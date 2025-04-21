import express from 'express';
import { google } from "googleapis";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { protect } from "../middleware/authMiddleware.js";
dotenv.config();
const router = express.Router();

// Google OAuth 2.0 Setup
const oauth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URI
);

let userTokens = {}; // Store user tokens in memory

// Google OAuth Authentication Route
router.get("/auth", (req, res) => {
    const { token } = req.query;
    if (!token) return res.status(401).send("Missing auth token");

    const authUrl = oauth2Client.generateAuthUrl({
        access_type: "offline",
        scope: [
            "https://www.googleapis.com/auth/fitness.activity.read",
            "https://www.googleapis.com/auth/fitness.heart_rate.read",
            "https://www.googleapis.com/auth/fitness.oxygen_saturation.read",
            "https://www.googleapis.com/auth/fitness.sleep.read",
            "https://www.googleapis.com/auth/fitness.body.read"
        ],
        state: token // We'll pass this to callback
    });

    res.redirect(authUrl);
});


// Handle Google Fit Callback
router.get("/auth/callback", async (req, res) => {
    try {
        const { code, state: token } = req.query;

        if (!token) return res.status(400).send("Missing state token");
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;

        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);

        const user = await User.findById(userId);
        if (!user) return res.status(404).send("User not found");

        user.googleFitTokens = tokens;
        await user.save();

        res.redirect("http://localhost:5173/patient-dashboard?smartwatch=connected");
    } catch (error) {
        console.error("Error during Google Fit callback:", error);
        res.status(500).send("Google Fit Authentication Failed");
    }
});


// Function to fetch fitness data
const fetchGoogleFitData = async (dataTypeName, patientId) => {
    try {
        const user = await User.findById(patientId);

        if (!user || !user.googleFitTokens || !user.googleFitTokens.access_token) {
            throw new Error("Google Fit not connected for this patient.");
        }

        oauth2Client.setCredentials(user.googleFitTokens);

        const fitness = google.fitness({ version: "v1", auth: oauth2Client });

        const response = await fitness.users.dataset.aggregate({
            userId: "me",
            requestBody: {
                aggregateBy: [{ dataTypeName }],
                bucketByTime: { durationMillis: 86400000 },
                startTimeMillis: Date.now() - 7 * 86400000,
                endTimeMillis: Date.now(),
            },
        });

        return response.data.bucket.map(bucket => ({
            date: new Date(parseInt(bucket.startTimeMillis)).toDateString(),
            value: bucket.dataset[0].point.length ? bucket.dataset[0].point[0].value[0].fpVal : "No Data"
        }));
    } catch (error) {
        console.error(`Error fetching ${dataTypeName}:`, error);
        return [];
    }
};

// Define API Endpoints for Health Data
router.get("/steps/:patientId", protect, async (req, res) => {
    const steps = await fetchGoogleFitData("com.google.step_count.delta", req.params.patientId);
    res.json({ steps });
});

router.get("/heartRate/:patientId", protect, async (req, res) => {
    const heartRate = await fetchGoogleFitData("com.google.heart_rate.bpm", req.params.patientId);
    res.json({ heartRate });
});

router.get("/oxygen/:patientId", protect, async (req, res) => {
    const oxygen = await fetchGoogleFitData("com.google.oxygen_saturation", req.params.patientId);
    res.json({ oxygen });
});

router.get("/sleep/:patientId", protect, async (req, res) => {
    const sleep = await fetchGoogleFitData("com.google.sleep.segment", req.params.patientId);
    res.json({ sleep });
});

router.get("/body/:patientId", protect, async (req, res) => {
    const weight = await fetchGoogleFitData("com.google.weight", req.params.patientId);
    const height = await fetchGoogleFitData("com.google.height", req.params.patientId);
    res.json({ body: { weight, height } });
});

export default router;
