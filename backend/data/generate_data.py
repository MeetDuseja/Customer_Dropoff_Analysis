import pandas as pd
import numpy as np
import random
import os
from datetime import datetime, timedelta

TOTAL_USERS = 10000
START_DATE = datetime(2026, 1, 1)
END_DATE = datetime(2026, 6, 30)

STEPS = [
    'step_1_mobile_entry',
    'step_2_otp_verification',
    'step_3_personal_details',
    'step_4_pan_upload',
    'step_5_aadhaar_verify',
    'step_6_income_details',
    'step_7_loan_preferences',
    'step_8_final_submit'
]

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

DROP_RATES = {
    'step_1_mobile_entry':     0.04,
    'step_2_otp_verification': 0.09,
    'step_3_personal_details': 0.08,
    'step_4_pan_upload':       0.11,
    'step_5_aadhaar_verify':   0.09,
    'step_6_income_details':   0.13,
    'step_7_loan_preferences': 0.05,
    'step_8_final_submit':     0.03
}

CITIES = {
    'Mumbai':    {'weight': 20, 'avg_income': 65000},
    'Delhi':     {'weight': 18, 'avg_income': 58000},
    'Bengaluru': {'weight': 15, 'avg_income': 72000},
    'Pune':      {'weight': 12, 'avg_income': 55000},
    'Chennai':   {'weight': 10, 'avg_income': 52000},
    'Hyderabad': {'weight': 10, 'avg_income': 60000},
    'Kolkata':   {'weight': 8,  'avg_income': 45000},
    'Ahmedabad': {'weight': 7,  'avg_income': 48000}
}

DEVICE_DROP_MULTIPLIER = {
    'mobile_android': 1.15,
    'mobile_ios':     0.95,
    'desktop':        0.88,
    'tablet':         1.05
}

def get_state(city):
    mapping = {
        'Mumbai': 'Maharashtra', 'Pune': 'Maharashtra',
        'Delhi': 'Delhi', 'Bengaluru': 'Karnataka',
        'Chennai': 'Tamil Nadu', 'Hyderabad': 'Telangana',
        'Kolkata': 'West Bengal', 'Ahmedabad': 'Gujarat'
    }
    return mapping.get(city, 'Unknown')

def get_age_group(age):
    if age < 25: return '21-24'
    elif age < 30: return '25-29'
    elif age < 35: return '30-34'
    elif age < 40: return '35-39'
    elif age < 45: return '40-44'
    else: return '45+'

def get_income_bracket(income):
    if income < 25000: return 'Low'
    elif income < 50000: return 'Middle'
    elif income < 80000: return 'Upper-Middle'
    else: return 'High'

def get_step_number(step):
    if step is None: return 9
    return int(step.split('_')[1])

def get_time_drop_multiplier(hour):
    if 22 <= hour or hour <= 6: return 1.20
    elif 7 <= hour <= 9: return 1.05
    elif 10 <= hour <= 18: return 0.92
    else: return 1.0

def get_age_drop_multiplier(age, step):
    if step == 'step_6_income_details':
        if age < 25: return 1.25
        elif age > 45: return 1.10
        else: return 0.95
    return 1.0

def generate():
    os.makedirs('data', exist_ok=True)
    records = []
    for user_num in range(1, TOTAL_USERS + 1):
        city = random.choices(
            list(CITIES.keys()),
            weights=[v['weight'] for v in CITIES.values()]
        )[0]
        device = random.choices(
            ['mobile_android', 'mobile_ios', 'desktop', 'tablet'],
            weights=[55, 20, 20, 5]
        )[0]
        age = int(np.clip(np.random.normal(32, 9), 21, 58))
        start_time = START_DATE + timedelta(
            seconds=random.randint(0, int((END_DATE - START_DATE).total_seconds()))
        )
        hour = start_time.hour
        base_income = CITIES[city]['avg_income']
        income = int(max(15000, np.random.normal(base_income, base_income * 0.3)))
        source = random.choices(
            ['organic_search', 'paid_ads', 'referral', 'social_media', 'email'],
            weights=[25, 35, 15, 20, 5]
        )[0]
        dropped_at_step = None
        completed = True
        for step in STEPS:
            base_drop = DROP_RATES[step]
            device_mult = DEVICE_DROP_MULTIPLIER[device]
            time_mult = get_time_drop_multiplier(hour)
            age_mult = get_age_drop_multiplier(age, step)
            source_mult = 1.08 if source == 'paid_ads' else 0.96
            final_drop = min(base_drop * device_mult * time_mult * age_mult * source_mult, 0.95)
            if random.random() < final_drop:
                dropped_at_step = step
                completed = False
                break
        records.append({
            'user_id': f'USR{user_num:06d}',
            'start_timestamp': start_time.isoformat(),
            'start_date': start_time.date().isoformat(),
            'start_hour': hour,
            'start_day_of_week': start_time.strftime('%A'),
            'city': city,
            'state': get_state(city),
            'device': device,
            'age': age,
            'age_group': get_age_group(age),
            'income': income,
            'income_bracket': get_income_bracket(income),
            'acquisition_source': source,
            'completed': int(completed),
            'dropped_at_step': dropped_at_step if not completed else 'completed',
            'dropped_at_step_number': get_step_number(dropped_at_step),
            'step_label': STEP_LABELS.get(dropped_at_step, 'Completed') if not completed else 'Completed',
            'total_time_seconds': random.randint(60, 1800)
        })
    df = pd.DataFrame(records)
    df.to_csv('data/onboarding_data.csv', index=False)
    print(f"Generated {len(df)} users")
    print(f"Completion rate: {df['completed'].mean()*100:.1f}%")
    return df

if __name__ == '__main__':
    generate()