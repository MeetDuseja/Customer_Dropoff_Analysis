from fastapi import APIRouter
from database import query_df
import pandas as pd

router = APIRouter()

@router.get("/cohort")
def get_cohort():
    df = query_df("SELECT start_date, completed FROM onboarding_users")
    
    # Fix: use dayfirst=True to handle DD-MM-YYYY format
    df['start_date'] = pd.to_datetime(df['start_date'], dayfirst=True, errors='coerce')
    
    # Drop any rows where date parsing failed
    df = df.dropna(subset=['start_date'])
    
    df['month'] = df['start_date'].dt.strftime('%b %Y')
    df['month_num'] = df['start_date'].dt.to_period('M')

    result = df.groupby(['month', 'month_num']).agg(
        total=('completed', 'count'),
        completed=('completed', 'sum')
    ).reset_index()

    result['dropped'] = result['total'] - result['completed']
    result['completion_rate'] = (
        result['completed'] / result['total'] * 100
    ).round(1)
    result['drop_rate'] = (
        100 - result['completion_rate']
    ).round(1)

    result = result.sort_values('month_num')
    result = result.drop('month_num', axis=1)

    return {"cohort": result.to_dict(orient='records')}