from fastapi import APIRouter
from pydantic import BaseModel
import random

router = APIRouter()

class UserInput(BaseModel):
    age: int
    income: float
    start_hour: int
    device: str
    city: str
    acquisition_source: str
    is_weekend: int = 0
    is_night: int = 0
    total_time_seconds: int = 180

@router.post("/predict")
def predict_risk(user: UserInput):
    score = 0
    device_risk = {'mobile_android': 35, 'tablet': 25, 'mobile_ios': 15, 'desktop': 10}
    score += device_risk.get(user.device, 20)
    if user.is_night or user.start_hour >= 22 or user.start_hour <= 6:
        score += 20
    elif user.start_hour <= 9:
        score += 10
    if user.age < 25: score += 15
    elif user.age > 45: score += 10
    source_risk = {'paid_ads': 15, 'social_media': 10, 'email': 5, 'referral': 0, 'organic_search': 5}
    score += source_risk.get(user.acquisition_source, 10)
    if user.total_time_seconds > 900: score += 15
    elif user.total_time_seconds > 500: score += 8
    if user.is_weekend: score += 5
    drop_probability = min(95, score)
    complete_probability = 100 - drop_probability
    if drop_probability >= 65:
        risk_level = "HIGH"
        action = "Trigger live chat immediately"
        color = "red"
    elif drop_probability >= 40:
        risk_level = "MEDIUM"
        action = "Send push notification in 10 minutes"
        color = "yellow"
    else:
        risk_level = "LOW"
        action = "Continue normal flow"
        color = "green"
    return {
        "drop_probability": drop_probability,
        "complete_probability": complete_probability,
        "risk_level": risk_level,
        "recommended_action": action,
        "color": color
    }

@router.get("/predict/live-users")
def get_live_users():
    steps = ['PAN Upload', 'Income Details', 'OTP Verify', 'Aadhaar Verify', 'Personal Details', 'Loan Preferences']
    users = []
    for i in range(1, 16):
        risk = random.randint(15, 95)
        users.append({
            "user_id": f"USR{100+i:06d}",
            "current_step": random.choice(steps),
            "time_on_step": f"{random.randint(1,9)}m {random.randint(0,59)}s",
            "device": random.choice(['Android', 'iOS', 'Desktop']),
            "drop_risk": risk,
            "risk_level": "HIGH" if risk >= 65 else "MEDIUM" if risk >= 40 else "LOW",
            "action": "🔴 Call Now" if risk >= 65 else "🟡 Send SMS" if risk >= 40 else "🟢 Normal"
        })
    return {"live_users": sorted(users, key=lambda x: -x['drop_risk'])}