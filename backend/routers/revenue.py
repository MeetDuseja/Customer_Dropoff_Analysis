from fastapi import APIRouter, Query
from database import query_df

router = APIRouter()

@router.get("/revenue")
def get_revenue(avg_loan: float = Query(default=150000), commission_rate: float = Query(default=0.02)):
    df = query_df("SELECT * FROM onboarding_users")
    total = len(df)
    completed = int(df['completed'].sum())
    dropped = total - completed
    recoverable_rate = 0.20
    recoverable = int(dropped * recoverable_rate)
    revenue_per_conversion = avg_loan * commission_rate
    monthly_opportunity = recoverable * revenue_per_conversion
    annual_opportunity = monthly_opportunity * 12
    step_breakdown = []
    for step in df['dropped_at_step'].unique():
        if step == 'completed':
            continue
        count = len(df[df['dropped_at_step'] == step])
        rec = int(count * recoverable_rate)
        step_breakdown.append({
            "step": step.replace('step_', 'Step ').replace('_', ' ').title(),
            "total_dropped": count,
            "recoverable_users": rec,
            "monthly_opportunity": round(rec * revenue_per_conversion, 0),
            "annual_opportunity": round(rec * revenue_per_conversion * 12, 0)
        })
    step_breakdown.sort(key=lambda x: -x['annual_opportunity'])
    return {
        "summary": {
            "total_dropped": dropped,
            "recoverable_users": recoverable,
            "revenue_per_conversion": revenue_per_conversion,
            "monthly_opportunity": round(monthly_opportunity, 0),
            "annual_opportunity": round(annual_opportunity, 0),
            "roi_multiplier": round(annual_opportunity / 750000, 1)
        },
        "step_breakdown": step_breakdown
    }