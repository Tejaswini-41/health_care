from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import numpy as np
import pickle
import torch
import logging
from typing import List
import google.generativeai as genai  # Google Generative AI SDK
import os
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()  # Add this at the top with other imports

# Replace the hard-coded API key with environment variable
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise ValueError("GEMINI_API_KEY not found in environment variables")

genai.configure(api_key=api_key)

# Initialize FastAPI App
app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


try:
    # Load XGBoost Activity Model
    with open("xgb_activity_model.pkl", "rb") as f:
        xgb_model = pickle.load(f)

    # Load Sleep BiLSTM Model (PyTorch)
    class BiLSTM(torch.nn.Module):
        def __init__(self, input_size=2, hidden_size=128, output_size=3):
            super(BiLSTM, self).__init__()
            self.lstm = torch.nn.LSTM(
                input_size,
                hidden_size,
                num_layers=3,
                bidirectional=True,
                batch_first=True,
                dropout=0.3,
            )
            self.fc = torch.nn.Linear(hidden_size * 2, output_size)

        def forward(self, x):
            lstm_out, _ = self.lstm(x)
            return self.fc(lstm_out[:, -1, :])

    sleep_model = BiLSTM()
    sleep_model.load_state_dict(
        torch.load(
            "sleep_bilstm_model.pth",
            map_location=torch.device("cpu"),
            weights_only=True,
        )
    )
    sleep_model.eval()

    # Load Isolation Forest (Heart Rate Anomaly Detection)
    with open("isolation_forest_hr.pkl", "rb") as f:
        iso_forest = pickle.load(f)

    # Load GMM Model (BMI Classification)
    with open("gmm_bmi_model.pkl", "rb") as f:
        gmm_model = pickle.load(f)

    logger.info("✅ Models loaded successfully")

except Exception as e:
    logger.error(f"🔥 Model loading failed: {str(e)}")
    raise RuntimeError("Model loading failed. Check logs for details.")


# ========================== #
# ✅ Define Input Schemas     #
# ========================== #
class HealthInput(BaseModel):
    activity: List[float]  # [TotalSteps, VeryActiveMinutes, Calories]
    sleep: List[float]  # [TotalMinutesAsleep, SleepEfficiency]
    heart_rate: List[
        float
    ]  # List of heart rate readings (e.g., per minute over several days)
    bmi: float  # BMI value


class SummaryInput(BaseModel):
    age: int
    bmi: float
    heart_rate: List[float]  # List of heart rate readings over 2-3 days
    activity_levels: List[List[float]]  # Daily activity metrics for the last 2-3 days
    medical_history: str
    medical_symptoms: str
    patient_id: str  # Add this to track individual patients


# ========================== #
# 🚀 Prediction Endpoint     #
# ========================== #
@app.post("/predict")
def predict_health(data: HealthInput):
    try:
        # ✅ Predict Activity Category (XGBoost)
        activity_input = np.array(data.activity).reshape(1, -1)
        activity_prediction = int(xgb_model.predict(activity_input)[0])

        # ✅ Predict Sleep Quality (BiLSTM)
        sleep_input = (
            torch.tensor(data.sleep, dtype=torch.float32)
            .unsqueeze(0)
            .unsqueeze(0)  # Batch & sequence dimensions
        )
        with torch.no_grad():
            sleep_prediction = int(sleep_model(sleep_input).argmax(dim=1).item())

        # ✅ Predict Heart Rate Anomaly (Isolation Forest)
        heart_rate_array = np.array(data.heart_rate).reshape(-1, 1)
        predictions = iso_forest.predict(heart_rate_array)  # -1 indicates anomaly
        anomaly_ratio = np.mean(predictions == -1)
        heart_rate_anomaly_flag = 1 if anomaly_ratio > 0.1 else 0

        # ✅ Predict BMI Category (GMM Clustering)
        bmi_input = np.array(data.bmi).reshape(1, -1)
        bmi_prediction = int(gmm_model.predict(bmi_input)[0])

        return {
            "Activity Prediction": activity_prediction,
            "Sleep Quality Prediction": sleep_prediction,
            "Heart Rate Anomaly": "Anomaly" if heart_rate_anomaly_flag else "Normal",
            "BMI Category": (
                "Overweight/Obese" if bmi_prediction == 1 else "Normal Weight"
            ),
        }

    except Exception as e:
        logger.error(f"🔥 Prediction failed: {str(e)}")
        raise HTTPException(
            status_code=500, detail="Prediction failed. Check logs for details."
        )


# ========================== #
# 🚀 Summary Generation Endpoint #
# ========================== #
@app.post("/generate-summary")
async def generate_summary(data: SummaryInput):
    try:
        # Personalized analysis based on patient data
        health_score = calculate_health_score(data)
        
        prompt = (
            f"As a medical professional, provide a personalized health analysis for this specific patient.\n"
            f"Patient Profile:\n"
            f"- Age: {data.age}\n"
            f"- BMI: {data.bmi:.1f}\n"
            f"- Current Symptoms: {data.medical_symptoms}\n"
            f"- Medical History: {data.medical_history}\n\n"
            f"Recent Health Metrics:\n"
            f"- Heart Rate (avg): {sum(data.heart_rate)/len(data.heart_rate):.0f} BPM\n"
            f"- Activity Data: {format_activity_data(data.activity_levels)}\n\n"
            f"Health Score: {health_score}/100\n\n"
            "Provide:\n"
            "1. Overall Health Assessment\n"
            "2. Key Concerns\n"
            "3. Specific Recommendations\n"
            "4. Lifestyle Modifications\n"
            "Format the response in clear sections with bullet points where appropriate."
        )

        model = genai.GenerativeModel("gemini-pro")
        response = model.generate_content(prompt)

        if not response.text:
            raise ValueError("No AI response generated")

        return {
            "text": response.text,
            "health_score": health_score
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate insights: {str(e)}"
        )

def calculate_health_score(data: SummaryInput) -> int:
    try:
        # Basic health score calculation
        base_score = 70  # Start with base score
        
        # BMI Impact (-10 to +10)
        if 18.5 <= data.bmi <= 24.9:
            base_score += 10
        elif 25 <= data.bmi <= 29.9:
            base_score -= 5
        else:
            base_score -= 10
            
        # Heart Rate Impact (-10 to +10)
        avg_hr = sum(data.heart_rate)/len(data.heart_rate)
        if 60 <= avg_hr <= 100:
            base_score += 10
        else:
            base_score -= 5
            
        # Activity Impact (0 to +10)
        if data.activity_levels:
            activity_score = min(10, len(data.activity_levels))
            base_score += activity_score
            
        return max(0, min(100, base_score))
    except:
        return 50  # Default score if calculation fails

def format_activity_data(activity_levels: List[List[float]]) -> str:
    if not activity_levels:
        return "No activity data available"
    
    recent_activity = activity_levels[-1]
    return f"Steps: {recent_activity[0]:.0f}, Duration: {recent_activity[1]:.0f}min, Calories: {recent_activity[2]:.0f}"


# ========================== #
# 🚀 Health Check Endpoint   #
# ========================== #
@app.get("/")
def health_check():
    return {"status": "API is running!"}

