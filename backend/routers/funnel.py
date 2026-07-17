from fastapi import APIRouter
from database import query_df

router = APIRouter()

STEPS = [
    ('step_1_mobile_entry',     'Mobile Entry',     1),
    ('step_2_otp_verification', 'OTP Verification', 2),
    ('step_3_personal_details', 'Personal Details', 3),
    ('step_4_pan_upload',       'PAN Upload',       4),
    ('step_5_aadhaar_verify',   'Aadhaar Verify',   5),
    ('step_6_income_details',   'Income Details',   6),
    ('step_7_loan_preferences', 'Loan Preferences', 7),
    ('step_8_final_submit',     'Final Submit',     8)
]

@router.get("/funnel")
def get_funnel():
    df = query_df("SELECT * FROM onboarding_users")
    total = len(df)
    funnel_data = []
    for step_key, step_name, step_num in STEPS:
        reached = len(df[(df['dropped_at_step_number'] >= step_num) | (df['completed'] == 1)])
        dropped_here = len(df[df['dropped_at_step'] == step_key])
        drop_rate = round(dropped_here / reached * 100, 2) if reached > 0 else 0
        funnel_data.append({
            "step_number": step_num,
            "step_key": step_key,
            "step_name": step_name,
            "users_reached": reached,
            "users_dropped": dropped_here,
            "drop_rate": drop_rate,
            "reach_rate": round(reached / total * 100, 1)
        })
    return {"funnel": funnel_data}