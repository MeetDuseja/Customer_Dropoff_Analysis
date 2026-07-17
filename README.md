# 📊 DropOff Analyzer
### Customer Onboarding Analytics & Live Simulation System


---

## 🎯 Problem Statement

A lending company has invested heavily in digital onboarding,
but only **48% of applicants complete the process**.

Product managers know where customers start,
but they cannot determine **where customers abandon the journey or why**.

Management wants **actionable insights** rather than additional dashboards.

---

## 💡Solution

**full-stack web application with two integrated parts**:

### Part 1 — Customer Side (Live Loan Application Form)
A working 8-step loan application that:
- Real customers can fill out with realistic input fields
- Captures data at every step (even if user leaves midway)
- Simulates real-world UX bugs (Android OTP failures, slow uploads, etc.)
- Every action feeds directly into the analytics dashboard

### Part 2 — Business Side (Admin Dashboard)
An analytics dashboard that:
- 📉 Shows **WHERE** users drop off (step by step funnel)
- 🔍 Shows **WHY** they drop off (device, time, age, city, source)
- 💡 Tells **WHAT TO DO** (prioritized actionable insights)
- 🧪 Simulates **WHAT IF** (A/B test simulator with revenue projection)
- 🤖 Predicts **WHO WILL DROP** in real time (live risk predictor)
- 💰 Quantifies **HOW MUCH IS LOST** (revenue impact in rupees)

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js + Vite |
| Styling | Tailwind CSS v3 |
| Charts | Recharts |
| Routing | React Router DOM |
| Icons | Lucide React |
| Backend | FastAPI (Python) |
| Database | SQLite |
| Data Analysis | Pandas + NumPy |
| HTTP Client | Axios |

---

## 📁 Project Structure
```

dropoff-analyzer/
│
├── backend/
│   ├── main.py                  ← FastAPI entry point
│   ├── database.py              ← SQLite connection + init
│   ├── requirements.txt         ← Python dependencies
│   ├── data/
│   │   ├── generate_data.py     ← Simulated dataset generator
│   │   ├── onboarding_data.csv  ← Analytics data (subset)
│   │   ├── user_details.csv     ← Full user form data
│   │   └── onboarding.db        ← SQLite database
│   └── routers/
│       ├── overview.py          ← /api/overview
│       ├── funnel.py            ← /api/funnel
│       ├── patterns.py          ← /api/patterns/*
│       ├── insights.py          ← /api/insights
│       ├── predict.py           ← /api/predict
│       ├── revenue.py           ← /api/revenue
│       ├── cohort.py            ← /api/cohort
│       └── form_submit.py       ← /api/form/* (live form data)
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx              ← Routing (home + form + dashboard)
│   │   ├── main.jsx             ← Entry point
│   │   ├── index.css            ← Global styles
│   │   ├── api/
│   │   │   └── api.js           ← All API calls
│   │   ├── components/
│   │   │   ├── Sidebar.jsx      ← Dashboard navigation
│   │   │   ├── KPICard.jsx      ← Metric cards
│   │   │   ├── DateFilter.jsx   ← Time range filter
│   │   │   ├── ExportButton.jsx ← CSV export
│   │   │   └── LoadingSpinner.jsx
│   │   └── pages/
│   │       ├── HomePage.jsx         ← Landing page (2 options)
│   │       ├── OnboardingForm.jsx   ← Live loan application form
│   │       ├── DashboardLayout.jsx  ← Dashboard wrapper
│   │       ├── Overview.jsx         ← Dashboard home
│   │       ├── FunnelAnalysis.jsx   ← Drop-off funnel
│   │       ├── PatternAnalysis.jsx  ← Why they drop
│   │       ├── CohortAnalysis.jsx   ← Monthly trends
│   │       ├── Insights.jsx         ← Action items
│   │       ├── ABSimulator.jsx      ← What-if simulator
│   │       ├── LivePredictor.jsx    ← Real-time predictor
│   │       └── RevenueImpact.jsx    ← Revenue analysis
│   └── package.json
│
└── README.md

```

---

## 🚀 How to Run

### Prerequisites
```

Python 3.10+
Node.js 18+
npm

```

### Step 1 — Navigate to Project

```bash
cd dropoff-analyzer
```

### Step 2 — Setup Backend

```bash
cd backend
pip install -r requirements.txt
```

### Step 3 — Generate Data

```bash
cd data
python generate_data.py
cd ..
```

You should see:

```
Generated 10000 users
Completion rate: 47.x%
```

### Step 4 — Start Backend

```bash
uvicorn main:app --reload --port 8000
```

Backend runs at: `http://localhost:8000`
API Docs at: `http://localhost:8000/docs`

### Step 5 — Setup Frontend (New Terminal)

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: `http://localhost:5173`

### Step 6 — Open in Browser

```
<http://localhost:5173>
```

You will see the homepage with 2 options.

---

## 🎬 How to Use

### Path A — Customer Journey (Fill Application)

1. Open homepage
2. Select device type (Android / iOS / Desktop / Tablet)
3. Click "Start Loan Application"
4. Fill through 8 steps OR leave at any step
5. All data is captured in real time

### Path B — Business Journey (View Analytics)

1. Open homepage
2. Click "Admin Dashboard"
3. Explore 8 dashboard pages
4. Real-time data from Path A users appears here

---

## 📡 API Endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/overview` | Summary KPIs + daily trend |
| GET | `/api/overview?days=30` | Filtered by last 30 days |
| GET | `/api/funnel` | Step by step drop analysis |
| GET | `/api/patterns/device` | Drop rate by device type |
| GET | `/api/patterns/time` | Drop rate by hour of day |
| GET | `/api/patterns/age` | Drop rate by age group |
| GET | `/api/patterns/city` | Drop rate by city |
| GET | `/api/patterns/source` | Drop rate by acquisition source |
| GET | `/api/patterns/heatmap` | Day × Hour completion heatmap |
| GET | `/api/cohort` | Monthly cohort analysis |
| GET | `/api/insights` | Prioritized actionable insights |
| GET | `/api/revenue` | Revenue impact calculation |
| POST | `/api/predict` | Predict drop risk for a user |
| GET | `/api/predict/live-users` | Simulated live users |
| POST | `/api/form/submit` | Submit form data (complete or dropped) |
| POST | `/api/form/validate-otp` | Validate OTP with device-based logic |
| GET | `/api/form/generate-user-id` | Generate unique user ID |

---

## 🗺️ Onboarding Journey (8 Steps)

| Step | Name | Real Input Fields |
| --- | --- | --- |
| 1 | Mobile Number Entry | 10-digit phone number |
| 2 | OTP Verification | 6-digit OTP with retry |
| 3 | Personal Details | Name, DOB, Gender, Email, Address, State, City, Pincode |
| 4 | PAN Card Upload | PAN number + document upload |
| 5 | Aadhaar Verification | 12-digit Aadhaar + document + UIDAI OTP |
| 6 | Income Details | Employment type, income, bank details, income proof |
| 7 | Loan Preferences | Amount, tenure, purpose (EMI auto-calculated) |
| 8 | Final Submit | Review + Terms acceptance |

---

## 🎨 UX Issues Simulated in Live Form

Based on our data analysis, we intentionally added realistic UX friction points:

### Android Users (matches Insight #2)

- Slow initial page load (800ms delay)
- OTP auto-read failure (40% chance)
- Upload failures (20% chance)
- Camera permission warnings
- Explicit "auto-read may not work" notice

### Night Time Users (matches Insight #3)

- Session expiry warnings appear
- Higher OTP failure rate
- Encourages users to return later

### Income Step for Young Users (matches Insight #4)

- Strict "salary slip mandatory" warning
- Warning: alternate proofs not accepted
- Warning: non-salaried users face higher rejection
- Minimum income enforcement

### OTP Step (matches Insight #1)

- 30-second resend timer
- Progressive error messages per attempt
- Support suggestion after 4 failures
- Multiple error message variants

---

## 📊 Dashboard Pages Overview

### 🏠 Overview Dashboard

- Health Score grade (A to F)
- KPI cards: started, completed, dropped, rate
- Daily completion rate trend line
- Drop distribution pie chart
- Revenue loss alert
- Date range filter (All / 7 / 30 / 90 days)

### 🔻 Drop-off Funnel

- Visual horizontal funnel bars
- Drop rate bar chart with color coding
- Detailed breakdown table
- Severity badges (Critical / High / Medium / Good)
- Export to CSV button

### 🔍 Why They Drop (Pattern Analysis)

- 5 tabs: Device, Time, Age, City, Source
- Each tab shows completion and drop rates
- Identifies root causes of drop-offs

### 📅 Cohort Analysis

- Month by month completion rate
- Trend indicators (Up / Down / Same)
- Line chart showing 6 month trend
- Helps track if fixes are working

### 💡 Actionable Insights

- 5 prioritized insights
- Each insight has: finding, why, action, impact, effort
- Expandable cards
- Severity: Critical / High / Medium
- Category: UX / Technical / Marketing / Product

### 🧪 A/B Test Simulator

- Sliders for each step to simulate drop reduction
- Real time revenue calculation
- Comparison chart (current vs simulated)
- Annual revenue gain projection
- Helps prioritize which fix gives maximum ROI

### 🤖 Live Risk Predictor

- Input form with user characteristics
- Drop probability score (0-100%)
- Risk level: High / Medium / Low
- Recommended action per risk level
- Live users table with auto refresh every 30 seconds

### 💰 Revenue Impact

- Monthly and annual revenue opportunity
- Recoverable users calculation
- Revenue breakdown by step
- Adjustable parameters (loan amount, commission rate)
- ROI multiplier for business case

---

## 💾 Data Storage

Two CSV files store data:

### onboarding_data.csv (Analytics Subset)

Used by the dashboard for all analysis.
Contains: user_id, timestamp, device, city, age, completion status, step reached.

### user_details.csv (Full User Records)

Complete form data with all fields.
Contains: everything from onboarding_data.csv PLUS name, email, PAN, Aadhaar, income, loan details.

**user_id** is the primary key linking both files.

The onboarding_data.csv is a **subset** of user_details.csv containing only the fields needed for analytics.

---

## 📝 Assumptions

```
1. ONBOARDING STEPS
   8 steps based on typical Indian lending app flow

2. DROP-OFF DEFINITION
   User clicked "Leave Form" OR did not complete
   the flow (in production: 48-hour inactivity)

3. DEVICE DETECTION
   User manually selects device on homepage
   (In production: auto-detected via user-agent
   and screen resolution)

4. INITIAL DATA
   10,000 simulated users seed the database
   Behavior patterns based on real world research:
   - Android users drop more (OTP auto-read issues)
   - Night time users drop more (fall asleep)
   - Young users (21-25) struggle at income step
   - Paid ads bring lower intent users

5. LIVE DATA
   Every form submission (complete or dropped)
   is appended to both CSV and SQLite database
   Analytics update in real time

6. RECOVERY RATE
   20% of dropped users are recoverable
   with better UX and timely interventions
   (industry standard estimate)

7. REVENUE CALCULATION
   Average loan amount : ₹1,50,000
   Commission rate     : 2% per loan
   Revenue per loan    : ₹3,000

8. RISK PREDICTOR
   Rule-based scoring in demo
   In production: trained ML model
   on actual app event logs

9. FILE UPLOADS
   Fake file names generated for demo
   In production: actual files uploaded to S3/GCS

10. OTP LOGIC
    Any 6-digit OTP accepted
    But device-based failure simulation
    Android: 40% fail rate
    iOS: 10% fail rate
    Desktop: 5% fail rate
    Night time: +20% fail rate
```

---

## 🔑 Key Metrics

| Metric | Value |
| --- | --- |
| Total Users Simulated | 10,000 |
| Current Completion Rate | ~48% |
| Target Completion Rate | 65% |
| Biggest Drop Step | Income Details (18%) |
| Monthly Revenue Lost | ~₹31 Lakhs |
| Annual Recovery Potential | ~₹3.7 Crores |
| Estimated ROI | 6x in Year 1 |

---

## 🏆 What Makes This Different

```
Most analytics tools → Tell you WHAT happened
Our system          → Tells you WHAT happened
                      + WHY it happened
                      + WHAT TO DO about it
                      + HOW MUCH you will gain if you do it
                      + LETS you SIMULATE the fix
                      + CAPTURES live data as it happens
```

| Feature | Regular Dashboard | Our System |
| --- | --- | --- |
| Shows drop location | ✅ | ✅ |
| Shows root cause | ❌ | ✅ |
| Gives specific actions | ❌ | ✅ |
| Quantifies revenue impact | ❌ | ✅ |
| Simulates what-if scenarios | ❌ | ✅ |
| Predicts individual drop risk | ❌ | ✅ |
| Real time intervention trigger | ❌ | ✅ |
| Live customer form for testing | ❌ | ✅ |
| Real UX bugs simulated | ❌ | ✅ |

---

## 🔮 Production Roadmap

```
Phase 1 (Current — Demo)
✅ Simulated seed data (10,000 users)
✅ Live customer form with real UX friction
✅ Rule based risk scoring
✅ CSV + SQLite storage

Phase 2 (Production MVP)
→ Connect to Firebase / Mixpanel event logs
→ Replace SQLite with PostgreSQL
→ Auto-detect device via user-agent
→ Train ML model on real user data
→ Connect predictor to WhatsApp Business API

Phase 3 (Full Production)
→ Real time data pipeline (Kafka/Kinesis)
→ Automated daily insight emails
→ Multi-product support
→ Branch level filtering
→ Agent performance tracking
→ A/B testing framework integration
```

---

## 🎥 Demo Video Walkthrough

The video demonstrates:

1. **Homepage** — Two clear options with device selector
2. **Live Form** — Filling the loan application with intentional Android OTP failures
3. **Leave Form** — Showing how partial data gets captured
4. **Overview Dashboard** — Health score, KPIs, trends
5. **Funnel Analysis** — Where the biggest drop is
6. **Pattern Analysis** — Root cause investigation
7. **Actionable Insights** — What business should do
8. **A/B Simulator** — Interactive revenue projection
9. **Live Predictor** — Real-time risk scoring

---

## 👤 Developer

**Developed by:** Meet Duseja

This project was independently designed and developed as a portfolio project to demonstrate full-stack development, product analytics, data visualization, and customer journey optimization. It showcases an end-to-end onboarding analytics platform featuring live user simulation, drop-off analysis, actionable business insights, revenue impact estimation, and predictive risk scoring.

---
## 🙏 Acknowledgments

- Inspired by real-world digital onboarding and product analytics challenges
- Real-world data patterns: Based on Indian FinTech research
- UI design: Inspired by modern SaaS analytics tools

---

*Built with ❤️ by Meet Duseja*

```

