# CreditLens AI — Credit Risk Intelligence Platform

[![Python](https://img.shields.io/badge/Python-3.12-blue.svg)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688.svg)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19-61DAFB.svg)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6.svg)](https://www.typescriptlang.org)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC.svg)](https://tailwindcss.com)
[![SHAP](https://img.shields.io/badge/XAI-SHAP%20TreeExplainer-orange.svg)](https://shap.readthedocs.io)

> **Important Educational Disclaimer**: CreditLens AI is an educational portfolio project demonstrating end-to-end credit risk modeling, calibrated probability estimation, SHAP explainability, and autonomous investigation workflows. It is **not** a production banking decision system and must **never** be used for actual lending decisions.

---

## 🏛️ System Architecture

CreditLens AI is organized as a production-grade monorepo containing:

- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS + Lucide Icons + Recharts + React Router.
- **Backend**: FastAPI + SQLAlchemy 2.0 + Pydantic v2 + Alembic migrations.
- **Machine Learning**: Scikit-learn Pipeline (ColumnTransformer, Stratified 5-Fold CV, Calibrated Random Forest Champion).
- **Explainability**: SHAP (TreeExplainer) with game-theoretic individual feature contributions and directionality.
- **Autonomous Agent**: Deterministic Python analytical tools orchestrated for transparent credit investigations.
- **Monitoring & Drift**: Two-sample Kolmogorov-Smirnov statistical tests and Isolation Forest anomaly detection.
- **Persistence & Reports**: PostgreSQL / SQLite dual-engine, with ReportLab audit PDF generator.

```
creditlens-ai/
├── frontend/             # React 19 + TypeScript + Vite UI
│   ├── src/
│   │   ├── api/          # Central API client
│   │   ├── components/   # Sidebar, Header, Layout
│   │   ├── pages/        # 8 Platform sections
│   │   └── App.tsx
├── backend/              # FastAPI Application
│   ├── app/
│   │   ├── api/          # REST endpoints (health, datasets, predictions, agent, monitoring)
│   │   ├── core/         # Settings, database connection
│   │   ├── models/       # SQLAlchemy ORM entities
│   │   ├── schemas/      # Pydantic v2 validation contracts
│   │   ├── ml/           # Dataset loader, preprocessing, training & calibration
│   │   ├── agent/        # Deterministic tools & investigation orchestrator
│   │   └── monitoring/   # KS drift detection & Isolation Forest
│   ├── alembic/          # Database migrations
│   ├── tests/            # 25 automated unit & integration tests
│   └── requirements.txt
├── data/                 # Benchmark credit datasets (UCI default credit cards) & PDF reports
├── models/               # Serialized pipelines and model metadata
├── docs/                 # Methodology, schema, and API documentation
│   ├── architecture.md
│   ├── agent_workflow.md
│   ├── database_schema.md
│   └── ml_evaluation_report.md
├── docker-compose.yml    # Multi-container orchestration (App + PostgreSQL)
└── README.md
```

---

## 🚀 Quick Start Guide

### Active Ports & URLs

| Service | Host | Port | URL |
| :--- | :--- | :--- | :--- |
| **React Frontend** | `127.0.0.1` | **`5173`** | [http://localhost:5173](http://localhost:5173) |
| **FastAPI Backend** | `127.0.0.1` | **`8000`** | [http://localhost:8000](http://localhost:8000) |
| **Interactive Swagger Docs**| `127.0.0.1` | **`8000`** | [http://localhost:8000/docs](http://localhost:8000/docs) |
| **API Health Check** | `127.0.0.1` | **`8000`** | [http://localhost:8000/api/health](http://localhost:8000/api/health) |

---

### Local Development (Zero-Config SQLite)

#### 1. Backend Setup
```bash
# Navigate to workspace
cd "c:\Users\Arsh Sharma\OneDrive\Desktop\project diwali"

# Activate Python Virtual Environment
.\backend\venv\Scripts\activate

# Install dependencies (if needed)
pip install -r backend/requirements.txt

# Run migrations
alembic upgrade head

# Start FastAPI server
python -m uvicorn backend.app.main:app --reload --port 8000
```

#### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend runs at `http://localhost:5173`.

---

## 🧪 Testing Suite (25 Tests Passing)

Execute all backend unit, ML, and integration tests:
```bash
pytest
```

Build and typecheck the React frontend:
```bash
cd frontend
npm run build
```

---

## 🎯 9-Step Demo Walkthrough

1. **Portfolio Overview**: Open `http://localhost:5173` to view portfolio default rate (22.1%), calibration Brier score (0.1368), and risk tiers.
2. **Customer Directory**: Navigate to `/customers` to filter accounts by risk tiers or search for specific borrowers. Click **Seed 100 Accounts** to instantly populate records.
3. **Risk Assessment**: Go to `/risk-assessment`, select a diagnostic scenario (e.g. *Delinquent Credit*), and click **Compute Calibrated Risk**.
4. **SHAP Waterfall**: Inspect the exact game-theoretic SHAP feature attributions showing which parameters push risk up or down.
5. **Portfolio Analytics**: Visit `/analytics` to examine default rates by customer segment (e.g., *Revolving Delinquent* at 39.8% vs. *Established Prime* at 14.9%).
6. **AI Risk Investigator**: Open `/investigator` and ask: *"Why is customer C1000 classified as high risk?"* or *"Compare customer C1000 and C1002"*.
7. **Model Monitoring & Drift**: Visit `/monitoring` and click **Run Drift Test** to see live two-sample Kolmogorov-Smirnov statistical tests. Click **Simulate Recession Shock** to verify alert trigger sensitivity.
8. **Isolation Forest Anomalies**: Inspect unsupervised outlier records with unusual debt-to-payment ratios.
9. **Risk Audit Reports**: Go to `/reports` and generate an audit report with downloadable PDF export.

---

## 📚 Technical Documentation

- [System Architecture](file:///docs/architecture.md)
- [Agent Workflow & Safety Guardrails](file:///docs/agent_workflow.md)
- [Database Schema & ERD](file:///docs/database_schema.md)
- [Machine Learning Evaluation Report](file:///docs/ml_evaluation_report.md)
