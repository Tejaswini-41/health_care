import React, { useState, useEffect } from "react";
import axios from "axios";
import "./SmartwatchConnect.css";

const SmartwatchConnect = () => {
    const [connected, setConnected] = useState(false);
    const [healthData, setHealthData] = useState({
        activity: [],
        heartRate: [],
        oxygen: [],
        sleep: [],
        body: { weight: [], height: [] },
    });
    const [error, setError] = useState("");

    const dummyData = {
        activity: [7000, 8000],
        heartRate: [72, 75],
        oxygen: [97, 98],
        sleep: ["7 hrs", "6.5 hrs"],
        body: {
            weight: [44],
            height: [177],
        },
    };

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get("smartwatch") === "connected") {
            setConnected(true);
            fetchAllHealthData();
        }
    }, []);

    const connectSmartwatch = () => {
        const token = localStorage.getItem("token");
        if (!token) {
            alert("Please login again to connect your smartwatch.");
            return;
        }
        window.location.href = `http://localhost:5000/googlefit/auth?token=${token}`;
    };
    

    const extractValidValues = (data, fallback, count = 2) => {
        if (!data || !Array.isArray(data)) return fallback;
        const filtered = data.filter(item => item.value !== "No Data" && item.value !== null).map(item => item.value);
        return filtered.length ? filtered.slice(-count) : fallback;
    };

    const fetchAllHealthData = async () => {
        try {
            const [stepsRes, heartRes, oxygenRes, sleepRes, bodyRes] = await Promise.all([
                axios.get("http://localhost:5000/googlefit/steps"),
                axios.get("http://localhost:5000/googlefit/heartRate"),
                axios.get("http://localhost:5000/googlefit/oxygen"),
                axios.get("http://localhost:5000/googlefit/sleep"),
                axios.get("http://localhost:5000/googlefit/body"),
            ]);

            const activity = extractValidValues(stepsRes.data.steps, dummyData.activity);
            const heartRate = extractValidValues(heartRes.data.heartRate, dummyData.heartRate);
            const oxygen = extractValidValues(oxygenRes.data.oxygen, dummyData.oxygen);
            const sleep = extractValidValues(sleepRes.data.sleep, dummyData.sleep);
            const weight = extractValidValues(bodyRes.data.body.weight, dummyData.body.weight, 1);
            const height = extractValidValues(bodyRes.data.body.height, dummyData.body.height, 1);

            setHealthData({
                activity,
                heartRate,
                oxygen,
                sleep,
                body: { weight, height },
            });
        } catch (err) {
            console.error("Failed to fetch health data:", err);
            setHealthData(dummyData);
            setError("Unable to fetch health data. Showing fallback values.");
        }
    };

    return (
        <div className="smartwatch-container">
            <h2>Smartwatch Integration</h2>

            {!connected ? (
                <button className="connect-btn" onClick={connectSmartwatch}>
                    Connect to Smartwatch
                </button>
            ) : (
                <>
                    <p className="success-message">✅ Smartwatch Connected!</p>

                    <div className="data-section">
                        <h3>🏃 Activity (Steps)</h3>
                        <ul>{healthData.activity.map((val, i) => <li key={i}>{val} steps</li>)}</ul>

                        <h3>❤️ Heart Rate</h3>
                        <ul>{healthData.heartRate.map((val, i) => <li key={i}>{val} bpm</li>)}</ul>

                        <h3>🫁 Oxygen Saturation</h3>
                        <ul>{healthData.oxygen.map((val, i) => <li key={i}>{val}%</li>)}</ul>

                        <h3>🛌 Sleep Duration</h3>
                        <ul>{healthData.sleep.map((val, i) => <li key={i}>{val}</li>)}</ul>

                        <h3>🧍 Body</h3>
                        <ul>
                            <li>Weight: {healthData.body.weight[0] || "N/A"} kg</li>
                            <li>Height: {healthData.body.height[0] || "N/A"} cm</li>
                        </ul>
                    </div>
                </>
            )}

            {error && <p className="error-message">{error}</p>}
        </div>
    );
};

export default SmartwatchConnect;
