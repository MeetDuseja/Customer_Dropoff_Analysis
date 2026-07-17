from fastapi import APIRouter
from database import query_df

router = APIRouter()

@router.get("/patterns/device")
def by_device():
    df = query_df("SELECT device, completed FROM onboarding_users")
    result = df.groupby('device').agg(total=('completed','count'), completed=('completed','sum')).reset_index()
    result['drop_rate'] = ((result['total'] - result['completed']) / result['total'] * 100).round(1)
    result['completion_rate'] = (result['completed'] / result['total'] * 100).round(1)
    return result.sort_values('drop_rate', ascending=False).to_dict(orient='records')

@router.get("/patterns/time")
def by_time():
    df = query_df("SELECT start_hour, completed FROM onboarding_users")
    result = df.groupby('start_hour').agg(total=('completed','count'), completed=('completed','sum')).reset_index()
    result['completion_rate'] = (result['completed'] / result['total'] * 100).round(1)
    result['drop_rate'] = (100 - result['completion_rate']).round(1)
    return result.sort_values('start_hour').to_dict(orient='records')

@router.get("/patterns/age")
def by_age():
    df = query_df("SELECT age_group, completed FROM onboarding_users")
    result = df.groupby('age_group').agg(total=('completed','count'), completed=('completed','sum')).reset_index()
    result['completion_rate'] = (result['completed'] / result['total'] * 100).round(1)
    result['drop_rate'] = (100 - result['completion_rate']).round(1)
    return result.sort_values('age_group').to_dict(orient='records')

@router.get("/patterns/city")
def by_city():
    df = query_df("SELECT city, state, completed FROM onboarding_users")
    result = df.groupby(['city','state']).agg(total=('completed','count'), completed=('completed','sum')).reset_index()
    result['completion_rate'] = (result['completed'] / result['total'] * 100).round(1)
    result['drop_rate'] = (100 - result['completion_rate']).round(1)
    return result.sort_values('drop_rate', ascending=False).to_dict(orient='records')

@router.get("/patterns/source")
def by_source():
    df = query_df("SELECT acquisition_source, completed FROM onboarding_users")
    result = df.groupby('acquisition_source').agg(total=('completed','count'), completed=('completed','sum')).reset_index()
    result['completion_rate'] = (result['completed'] / result['total'] * 100).round(1)
    result['drop_rate'] = (100 - result['completion_rate']).round(1)
    return result.sort_values('completion_rate', ascending=False).to_dict(orient='records')

@router.get("/patterns/heatmap")
def heatmap():
    df = query_df("SELECT start_hour, start_day_of_week, completed FROM onboarding_users")
    result = df.groupby(['start_day_of_week','start_hour']).agg(total=('completed','count'), completed=('completed','sum')).reset_index()
    result['completion_rate'] = (result['completed'] / result['total'] * 100).round(1)
    return result.to_dict(orient='records')