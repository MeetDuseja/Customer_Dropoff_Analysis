from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import init_db
from routers import overview, funnel, patterns, insights, predict, revenue, cohort, form_submit

app = FastAPI(title="Customer Drop-off Analyzer API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup():
    init_db()
    print("Server started. Database ready.")

@app.get("/")
def root():
    return {"status": "running"}

@app.get("/api/health")
def health():
    return {"status": "healthy"}

app.include_router(overview.router,     prefix="/api", tags=["Overview"])
app.include_router(funnel.router,       prefix="/api", tags=["Funnel"])
app.include_router(patterns.router,     prefix="/api", tags=["Patterns"])
app.include_router(insights.router,     prefix="/api", tags=["Insights"])
app.include_router(predict.router,      prefix="/api", tags=["Predict"])
app.include_router(revenue.router,      prefix="/api", tags=["Revenue"])
app.include_router(cohort.router,       prefix="/api", tags=["Cohort"])
app.include_router(form_submit.router,  prefix="/api", tags=["Form"])