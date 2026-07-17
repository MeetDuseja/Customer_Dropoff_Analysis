from fastapi import APIRouter, Query
from database import query_df
import pandas as pd

router = APIRouter()

@router.get("/overview")
def get_overview(days: int = Query(default=0)):
    df = query_df("SELECT * FROM onboarding_users")

    if days > 0:
        total_rows = len(df)
        keep_rows = int(total_rows * (days / 180))
        df = df.tail(keep_rows)

    total = len(df)
    completed = int(df['completed'].sum())
    dropped = total - completed
    completion_rate = round(completed / total * 100, 1)

    daily = df.groupby('start_date').agg(
        total=('user_id', 'count'),
        completed=('completed', 'sum')
    ).reset_index()
    daily['completion_rate'] = (
        daily['completed'] / daily['total'] * 100
    ).round(1)

    drop_dist = df[df['completed'] == 0].groupby(
        'step_label'
    ).size().reset_index(name='count')

    return {
        "summary": {
            "total_started": total,
            "total_completed": completed,
            "total_dropped": dropped,
            "completion_rate": completion_rate,
            "drop_rate": round(100 - completion_rate, 1)
        },
        "daily_trend": daily.to_dict(orient='records'),
        "drop_distribution": drop_dist.to_dict(orient='records')
    }