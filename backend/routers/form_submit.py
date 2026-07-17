from fastapi import APIRouter, Body
from pydantic import BaseModel
from typing import Optional
import pandas as pd
import os
import sqlite3
from datetime import datetime

router = APIRouter()

DB_PATH = "data/onboarding.db"
USER_DETAILS_CSV = "data/user_details.csv"
ONBOARDING_CSV = "data/onboarding_data.csv"

class FormSubmission(BaseModel):
    user_id: str
    device: str
    step_reached: str
    step_number: int
    completed: bool
    dropped: bool
    start_hour: int
    start_day_of_week: str
    start_date: str
    start_timestamp: str
    # User form data
    mobile_number: Optional[str] = None
    otp_entered: Optional[str] = None
    full_name: Optional[str] = None
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    pan_number: Optional[str] = None
    pan_file_name: Optional[str] = None
    aadhaar_number: Optional[str] = None
    aadhaar_file_name: Optional[str] = None
    aadhaar_otp: Optional[str] = None
    employment_type: Optional[str] = None
    company_name: Optional[str] = None
    monthly_income: Optional[float] = None
    income_proof_file: Optional[str] = None
    bank_name: Optional[str] = None
    account_number: Optional[str] = None
    loan_amount: Optional[float] = None
    loan_tenure: Optional[int] = None
    loan_purpose: Optional[str] = None
    agreed_terms: Optional[bool] = None

def get_age_group(dob_str):
    try:
        dob = datetime.strptime(dob_str, "%Y-%m-%d")
        age = (datetime.now() - dob).days // 365
        if age < 25: return '21-24'
        elif age < 30: return '25-29'
        elif age < 35: return '30-34'
        elif age < 40: return '35-39'
        elif age < 45: return '40-44'
        else: return '45+'
    except:
        return '30-34'

def get_age(dob_str):
    try:
        dob = datetime.strptime(dob_str, "%Y-%m-%d")
        return (datetime.now() - dob).days // 365
    except:
        return 30

def get_income_bracket(income):
    if income is None: return 'Middle'
    if income < 25000: return 'Low'
    elif income < 50000: return 'Middle'
    elif income < 80000: return 'Upper-Middle'
    else: return 'High'

STEP_LABELS = {
    'step_1_mobile_entry':     'Mobile Entry',
    'step_2_otp_verification': 'OTP Verification',
    'step_3_personal_details': 'Personal Details',
    'step_4_pan_upload':       'PAN Upload',
    'step_5_aadhaar_verify':   'Aadhaar Verify',
    'step_6_income_details':   'Income Details',
    'step_7_loan_preferences': 'Loan Preferences',
    'step_8_final_submit':     'Final Submit'
}

@router.post("/form/submit")
def submit_form(data: FormSubmission):
    now = datetime.now()
    
    age = get_age(data.date_of_birth) if data.date_of_birth else 30
    income = data.monthly_income if data.monthly_income else 40000
    
    # Build onboarding record (for analytics)
    onboarding_record = {
        'user_id': data.user_id,
        'start_timestamp': data.start_timestamp,
        'start_date': data.start_date,
        'start_hour': data.start_hour,
        'start_day_of_week': data.start_day_of_week,
        'city': data.city if data.city else 'Mumbai',
        'state': data.state if data.state else 'Maharashtra',
        'device': data.device,
        'age': age,
        'age_group': get_age_group(data.date_of_birth) if data.date_of_birth else '30-34',
        'income': int(income),
        'income_bracket': get_income_bracket(income),
        'acquisition_source': 'direct',
        'completed': 1 if data.completed else 0,
        'dropped_at_step': 'completed' if data.completed else data.step_reached,
        'dropped_at_step_number': 9 if data.completed else data.step_number,
        'step_label': 'Completed' if data.completed else STEP_LABELS.get(data.step_reached, 'Unknown'),
        'total_time_seconds': int((now - datetime.fromisoformat(data.start_timestamp.replace('Z', '').split('+')[0])).total_seconds())
    }
    
    # Build full user details record
    user_detail_record = {
        'user_id': data.user_id,
        'device': data.device,
        'step_reached': data.step_reached,
        'step_number': data.step_number,
        'completed': data.completed,
        'dropped': data.dropped,
        'start_timestamp': data.start_timestamp,
        'start_date': data.start_date,
        'start_hour': data.start_hour,
        'mobile_number': data.mobile_number,
        'full_name': data.full_name,
        'date_of_birth': data.date_of_birth,
        'gender': data.gender,
        'email': data.email,
        'address': data.address,
        'city': data.city,
        'state': data.state,
        'pincode': data.pincode,
        'pan_number': data.pan_number,
        'pan_file_name': data.pan_file_name,
        'aadhaar_number': data.aadhaar_number,
        'aadhaar_file_name': data.aadhaar_file_name,
        'employment_type': data.employment_type,
        'company_name': data.company_name,
        'monthly_income': data.monthly_income,
        'income_proof_file': data.income_proof_file,
        'bank_name': data.bank_name,
        'account_number': data.account_number,
        'loan_amount': data.loan_amount,
        'loan_tenure': data.loan_tenure,
        'loan_purpose': data.loan_purpose,
        'agreed_terms': data.agreed_terms,
        'submitted_at': now.isoformat()
    }
    
    # Save to onboarding CSV (append)
    onboarding_df = pd.DataFrame([onboarding_record])
    if os.path.exists(ONBOARDING_CSV):
        onboarding_df.to_csv(ONBOARDING_CSV, mode='a', header=False, index=False)
    else:
        onboarding_df.to_csv(ONBOARDING_CSV, index=False)
    
    # Save to user details CSV (append)
    user_df = pd.DataFrame([user_detail_record])
    if os.path.exists(USER_DETAILS_CSV):
        user_df.to_csv(USER_DETAILS_CSV, mode='a', header=False, index=False)
    else:
        user_df.to_csv(USER_DETAILS_CSV, index=False)
    
    # Also insert into SQLite onboarding_users table
    try:
        conn = sqlite3.connect(DB_PATH)
        onboarding_df.to_sql("onboarding_users", conn, if_exists="append", index=False)
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"DB insert error: {e}")
    
    return {
        "status": "success",
        "user_id": data.user_id,
        "completed": data.completed,
        "step_reached": data.step_reached,
        "message": "Application submitted successfully" if data.completed else f"Application saved at {STEP_LABELS.get(data.step_reached, data.step_reached)}"
    }

@router.post("/form/validate-otp")
def validate_otp(payload: dict = Body(...)):
    otp = payload.get("otp", "")
    device = payload.get("device", "desktop")
    hour = payload.get("hour", 12)
    attempt = payload.get("attempt", 1)
    
    import random
    
    # OTP must be 6 digits
    if len(otp) != 6 or not otp.isdigit():
        return {"valid": False, "message": "OTP must be exactly 6 digits", "retry": False}
    
    # Base failure chance based on device (mimics real bugs)
    failure_chance = 0
    
    if device == "mobile_android":
        failure_chance = 40  # Android auto-read bug
    elif device == "tablet":
        failure_chance = 25
    elif device == "mobile_ios":
        failure_chance = 10
    else:  # desktop
        failure_chance = 5
    
    # Night time increases failure
    if hour >= 22 or hour <= 6:
        failure_chance += 20
    
    # After 3 attempts, reduce failure chance (user gets frustrated)
    if attempt >= 3:
        failure_chance = max(5, failure_chance - 30)
    
    # Random failure based on device
    if random.randint(1, 100) <= failure_chance:
        messages = [
            "OTP verification failed. Please try again.",
            "Incorrect OTP. Please check and retry.",
            "OTP validation error. Please resend and try again.",
            "Network issue during verification. Try again.",
        ]
        return {
            "valid": False,
            "message": random.choice(messages),
            "retry": True
        }
    
    return {"valid": True, "message": "OTP verified successfully"}
    
@router.get("/form/generate-user-id")
def generate_user_id():
    import random
    user_id = f"LIVE{random.randint(100000, 999999)}"
    return {"user_id": user_id}