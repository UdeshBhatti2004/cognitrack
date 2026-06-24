# CogniTrack — Cognitive Assessment Platform
### MERN Stack | Built for UNSC/Healthcare Hackathon

---

## What It Is
A full-stack cognitive health monitoring platform that:
- Runs **5 interactive cognitive tasks** (Memory, Attention, Visuospatial, Processing Speed, Executive Function)
- Tracks **behavioral biomarkers** (reaction time, error rate, consistency, variability)
- Shows a **longitudinal dashboard** with radar chart, trend lines, and per-domain breakdown
- Stores all results in MongoDB per user

---

## Tech Stack
| Layer | Tech |
|-------|------|
| Frontend | React 18 + Vite |
| Charts | Recharts (RadarChart, LineChart) |
| Backend | Node.js + Express |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcryptjs |

---

## Setup

### 1. Backend
```bash
cd backend
npm install
# Create .env file:
echo "MONGO_URI=mongodb://localhost:27017/cognitrack" > .env
echo "JWT_SECRET=your_secret_key" >> .env
echo "PORT=5000" >> .env
node server.js
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
# Opens at http://localhost:5173
```

---

## The 5 Cognitive Tasks

| Task | What it tests | Method |
|------|--------------|--------|
| **Memory** | Immediate + delayed recall | 5-word chain shown → distractor → recall twice |
| **Attention** | Focus, sustained attention | Letter CPT — press when you see 'G' only |
| **Visuospatial** | Spatial reasoning | Study a 3×3 shape grid → reconstruct after scramble |
| **Processing Speed** | Symbol matching speed | See symbol (□△○★+) → press number key as fast as possible |
| **Executive Function** | Rule-based pattern matching | Does sequence start with the target pattern? YES/NO |

---

## Dashboard Tabs

| Tab | Shows |
|-----|-------|
| **Overview** | Total score, radar chart, domain breakdown with bars |
| **Biomarkers** | Reaction time, error rate, consistency, variability, per-domain details |
| **Trend** | LineChart of scores across sessions (needs 2+ assessments) |
| **History** | All past sessions with domain badges |

---

## Scoring
- Each domain outputs 0–100 score based on accuracy + response time + consistency
- Weighted average: Memory 25%, Attention 20%, Processing 20%, Visuospatial 20%, Executive 15%
- Color coding: Green ≥75, Yellow ≥50, Red <50

---

## API Endpoints
```
POST /api/auth/register    — { name, email, password, age }
POST /api/auth/login       — { email, password }
POST /api/assessment/submit — { sessionId, domains } [auth required]
GET  /api/assessment/history [auth required]
GET  /api/dashboard/stats   [auth required]
```
