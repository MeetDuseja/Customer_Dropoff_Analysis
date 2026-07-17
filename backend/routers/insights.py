from fastapi import APIRouter
from database import query_df

router = APIRouter()

@router.get("/insights")
def get_insights():
    df = query_df("SELECT * FROM onboarding_users")
    insights = []

    step_drops = df[df['completed'] == 0].groupby('dropped_at_step').size()
    if len(step_drops) > 0:
        worst_step = step_drops.idxmax()
        worst_count = int(step_drops.max())
        worst_label = worst_step.replace('step_', 'Step ').replace('_', ' ').title()
        insights.append({
            "priority": 1, "severity": "CRITICAL", "category": "UX/Product",
            "title": f"{worst_label} has highest drop-offs",
            "finding": f"{worst_count} users abandon at {worst_label} every month",
            "why": "Users face too many fields or confusing UI at this step",
            "action": "Simplify this step. Reduce fields. Add Save and Continue Later option. Add progress bar.",
            "expected_improvement": "Reduce drop by 30-40% at this step",
            "effort": "Medium — 2-3 weeks development"
        })

    device_data = df.groupby('device')['completed'].mean()
    if 'mobile_android' in device_data.index and 'mobile_ios' in device_data.index:
        android_rate = round(device_data['mobile_android'] * 100, 1)
        ios_rate = round(device_data['mobile_ios'] * 100, 1)
        diff = round(ios_rate - android_rate, 1)
        insights.append({
            "priority": 2, "severity": "HIGH", "category": "Technical",
            "title": f"Android users complete {diff}% less than iOS users",
            "finding": f"Android: {android_rate}% vs iOS: {ios_rate}%",
            "why": "OTP auto-read fails on Android. Camera permission crashes on some devices.",
            "action": "Fix Android OTP auto-read. Test on 10+ Android versions. Add manual OTP fallback.",
            "expected_improvement": "+8-12% completion on Android",
            "effort": "Low — 1 week"
        })

    night = df[(df['start_hour'] >= 22) | (df['start_hour'] <= 6)]
    day = df[(df['start_hour'] >= 10) & (df['start_hour'] <= 18)]
    night_rate = round(night['completed'].mean() * 100, 1)
    day_rate = round(day['completed'].mean() * 100, 1)
    insights.append({
        "priority": 3, "severity": "HIGH", "category": "Engagement",
        "title": f"Night users complete {round(day_rate - night_rate, 1)}% less than daytime",
        "finding": f"Night 10PM-6AM: {night_rate}% vs Day 10AM-6PM: {day_rate}%",
        "why": "Users start at night and fall asleep. No mechanism to bring them back.",
        "action": "Send push notification at 9 AM next morning for incomplete applications.",
        "expected_improvement": "Recover 20-25% of night-drop users",
        "effort": "Low — 3-4 days"
    })

    young_income_drop = df[(df['age'] < 26) & (df['dropped_at_step'] == 'step_6_income_details')]
    if len(young_income_drop) > 30:
        insights.append({
            "priority": 4, "severity": "MEDIUM", "category": "Product",
            "title": f"{len(young_income_drop)} young users aged 21-25 drop at Income Details",
            "finding": "Age group 21-25 struggles most at income verification step",
            "why": "Young users have informal income, freelance work, or no salary slips.",
            "action": "Add alternate proofs: UPI history, GST returns, employer letter.",
            "expected_improvement": "+15% completion in 21-25 age group",
            "effort": "Medium — 1-2 weeks"
        })

    source_data = df.groupby('acquisition_source')['completed'].mean()
    worst_source = source_data.idxmin()
    best_source = source_data.idxmax()
    worst_rate = round(source_data.min() * 100, 1)
    best_rate = round(source_data.max() * 100, 1)
    insights.append({
        "priority": 5, "severity": "MEDIUM", "category": "Marketing",
        "title": f"'{worst_source}' brings lowest quality traffic",
        "finding": f"{worst_source}: {worst_rate}% vs {best_source}: {best_rate}%",
        "why": "Low-intent traffic from poor-targeted campaigns wastes marketing budget.",
        "action": f"Shift 30% budget from {worst_source} to {best_source}. Add pre-qualification quiz.",
        "expected_improvement": "+5% overall completion, -20% cost per acquisition",
        "effort": "Low — Marketing decision, 1 day"
    })

    return {"insights": insights}