import express from 'express';
import { google } from "googleapis";
import dotenv from "dotenv";

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
    const authUrl = oauth2Client.generateAuthUrl({
        access_type: "offline",
        scope: [
            "https://www.googleapis.com/auth/fitness.activity.read",
            "https://www.googleapis.com/auth/fitness.heart_rate.read",
            "https://www.googleapis.com/auth/fitness.oxygen_saturation.read",
            "https://www.googleapis.com/auth/fitness.sleep.read",
            "https://www.googleapis.com/auth/fitness.body.read"
        ],
    });
    res.redirect(authUrl);
});

// Handle Google Fit Callback
router.get("/auth/callback", async (req, res) => {
    try {
        const { code } = req.query;
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);
        userTokens = tokens;

        // Redirect back to the frontend page after successful connection
        res.redirect("http://localhost:5173/patient-dashboard?smartwatch=connected");
    } catch (error) {
        console.error("Error during authentication:", error);
        res.status(500).send("Authentication Failed");
    }
});

// Function to fetch fitness data
const fetchGoogleFitData = async (dataTypeName) => {
    try {
        if (!userTokens.access_token) throw new Error("User not authenticated");

        oauth2Client.setCredentials(userTokens);
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
        return { error: `Failed to fetch ${dataTypeName} data` };
    }
};

// Define API Endpoints for Health Data
router.get("/steps", async (req, res) => res.json({ steps: await fetchGoogleFitData("com.google.step_count.delta") }));
router.get("/heartRate", async (req, res) => res.json({ heartRate: await fetchGoogleFitData("com.google.heart_rate.bpm") }));

router.get("/oxygen", async (req, res) => {
    res.json({ oxygen: await fetchGoogleFitData("com.google.oxygen_saturation") });
});

router.get("/sleep", async (req, res) => {
    res.json({ sleep: await fetchGoogleFitData("com.google.sleep.segment") });
});

router.get("/body", async (req, res) => {
    const weight = await fetchGoogleFitData("com.google.weight");
    const height = await fetchGoogleFitData("com.google.height");
    res.json({ body: { weight, height } });
});

export default router;
