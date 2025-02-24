import React, { useState, useEffect } from "react";
import axios from "axios";
import "./SmartwatchConnect.css"; 

const SmartwatchConnect = () => {
    const [connected, setConnected] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get("smartwatch") === "connected") {
            setConnected(true);
        }
    }, []);

  // In SmartwatchConnect.jsx
const connectSmartwatch = () => {
    window.location.href = "http://localhost:5000/googlefit/auth";
};
    return (
        <div className="smartwatch-container">
            <h2>Smartwatch Integration</h2>
            {!connected ? (
                <button className="connect-btn" onClick={connectSmartwatch}>
                    Connect to Smartwatch
                </button>
            ) : (
                <p className="success-message">✅ Smartwatch Connected!</p>
            )}
            {error && <p className="error-message">{error}</p>}
        </div>
    );
};

export default SmartwatchConnect;
