# CreditLens AI — Credit Risk Intelligence Platform

[![Python](https://img.shields.io/badge/Python-3.12-blue.svg)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688.svg)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19-61DAFB.svg)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6.svg)](https://www.typescriptlang.org)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC.svg)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/License-MIT-lightgrey.svg)](LICENSE)

> **Important Educational Disclaimer**: CreditLens AI is an educational portfolio project demonstrating end-to-end credit risk modeling, calibrated probability estimation, SHAP explainability, and autonomous investigation workflows. It is **not** a production banking decision system and must **never** be used for actual lending decisions.

---

## 🏛️ System Architecture

CreditLens AI is organized as a production-grade monorepo containing:

- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS + Lucide Icons + Recharts + React Router.
- **Backend**: FastAPI + SQLAlchemy 2.0 + Pydantic v2 + Alembic migrations.
- **Machine Learning**: Scikit-learn Pipeline (ColumnTransformer, Stratified K-Fold CV, Calibrated Classifier).
- **Explainability**: SHAP (TreeExplainer) with game-theoretic individual feature contributions and directionality.
- **Agentic AI**: Deterministic LangGraph credit investigation tools.
- **Monitoring & Drift**: Statistical Kolmogorov-Smirnov drift tests and Isolation Forest anomaly detection.
- **Persistence**: PostgreSQL (production / Docker) and SQLite (zero-config local development).

```
creditlens-ai/
├── frontend/             # React 19 + TypeScript + Vite UI
│   ├── src/
│   │   ├── api/          # Central API client
│   │   ├── components/   # Sidebar, Header, Layout, UI widgets
│   │   ├── pages/        # 8 Platform sections
│   │   └── App.tsx
│   ├── package.json
│   └── vite.config.ts
├── backend/              # FastAPI Application
│   ├── app/
│   │   ├── api/          # REST endpoints (health, datasets, predictions, etc.)
│   │   ├── core/         # Settings, database connection
│   │   ├── models/       # SQLAlchemy ORM entities
│   │   ├── schemas/      # Pydantic v2 validation contracts
│   │   ├── ml/           # Dataset loader, preprocessing, training & calibration
│   │   ├── agent/        # LangGraph autonomous investigator
│   │   └── monitoring/   # Drift detection & Isolation Forest
│   ├── alembic/          # Database migrations
│   ├── tests/            # Pytest test suite
│   └── requirements.txt
├── data/                 # Benchmark credit datasets (UCI default credit cards)
├── models/               # Serialized pipelines and model metadata
├── docs/                 # Methodology, schema, and API documentation
├── docker-compose.yml    # Multi-container orchestration (App + PostgreSQL)
├── .env.example          # Environment variables template
└── README.md
```

---

## 🚀 Quick Start Guide

### Option 1: Local Development (Fastest, zero-config SQLite)

#### 1. Backend Setup
```bash
# Navigate to workspace
cd "c:\Users\Arsh Sharma\OneDrive\Desktop\project diwali"

# Activate Python Virtual Environment
# Windows:
.\backend\venv\Scripts\activate

# Install dependencies (if not already done)
pip install -r backend/requirements.txt

# Run database migrations
alembic upgrade head

# Start FastAPI server
python -m uvicorn backend.app.main:app --reload --port 8000
```
Backend API will be accessible at:
- API Base: `http://localhost:8000`
- Interactive Swagger Docs: `http://localhost:8000/docs`
- Health check: `http://localhost:8000/api/health`

#### 2. Frontend Setup
```bash
# In a new terminal:
cd frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```
Frontend will be running at `http://localhost:5173`.

---

### Option 2: Docker Compose (PostgreSQL + App Services)

```bash
# Build and run containers
docker-compose up --build
```
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000`
- PostgreSQL: `localhost:5432`

---

## 🧪 Testing

### Backend Tests
```bash
pytest
```
All unit tests, database migrations, and API route contracts are verified with pytest.

### Frontend Typecheck & Build
```bash
cd frontend
npm run build
```

---

## 📑 Platform Navigation Sections

1. **Overview**: Portfolio KPIs, default rate, calibration, and quick actions.
2. **Customers**: Search, filter, and sort accounts by default probability and risk tiers.
3. **Risk Assessment**: Feature input form, calibrated probability calculation, and real SHAP explanations.
4. **Portfolio Analytics**: Demographic default distribution, bill/payment correlations, and segments.
5. **AI Investigator**: Autonomous credit analyst answering analytical inquiries using deterministic tools.
6. **Model Monitoring**: Statistical feature drift detection, Kolmogorov-Smirnov tests, and Isolation Forest.
7. **Reports**: Customer-level investigation audit reports and portfolio risk summaries (with PDF/CSV export).
8. **Settings**: Configurable risk tier thresholds and model registry versions.

