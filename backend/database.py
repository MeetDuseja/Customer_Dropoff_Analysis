import sqlite3
import pandas as pd
import os

DB_PATH = "data/onboarding.db"

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    os.makedirs("data", exist_ok=True)
    if not os.path.exists("data/onboarding_data.csv"):
        print("Generating data...")
        from data.generate_data import generate
        generate()
    df = pd.read_csv("data/onboarding_data.csv")
    conn = sqlite3.connect(DB_PATH)
    df.to_sql("onboarding_users", conn, if_exists="replace", index=False)
    conn.commit()
    conn.close()
    print(f"Database initialized with {len(df)} records")

def query_df(sql: str, params=None) -> pd.DataFrame:
    conn = get_connection()
    if params:
        df = pd.read_sql_query(sql, conn, params=params)
    else:
        df = pd.read_sql_query(sql, conn)
    conn.close()
    return df