from typing import Dict, Any, List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
import pandas as pd

from backend.app.core.database import get_db
from backend.app.models.entities import Customer
from backend.app.ml.dataset import load_credit_dataset, FEATURE_NAMES
from backend.app.monitoring.drift import detect_data_drift, simulate_recession_distribution_shift
from backend.app.monitoring.detector import CreditAnomalyDetector

router = APIRouter(prefix="/monitoring", tags=["Model Telemetry & Drift Detection"])


@router.get("/drift")
def get_drift_report(p_value_threshold: float = 0.05):
    """
    Execute two-sample Kolmogorov-Smirnov data drift tests comparing current portfolio
    to baseline reference training distribution.
    """
    ref_df = load_credit_dataset("data/default_of_credit_card_clients_sample.csv")
    # For baseline reference vs production sample
    curr_df = ref_df.sample(frac=0.8, random_state=101)

    drift_report = detect_data_drift(ref_df, curr_df, p_value_threshold=p_value_threshold)
    return drift_report


@router.post("/drift/simulate-shift")
def simulate_distribution_shift():
    """
    Simulate a macro-economic credit stress shock (delinquency increases, payment drops)
    and execute Kolmogorov-Smirnov drift test to demonstrate alert trigger sensitivity.
    """
    ref_df = load_credit_dataset("data/default_of_credit_card_clients_sample.csv")
    shifted_df = simulate_recession_distribution_shift(ref_df)

    drift_report = detect_data_drift(ref_df, shifted_df, p_value_threshold=0.05)
    return {
        "simulation_scenario": "Macroeconomic Recession Stress (40% payment reduction, +1-2 months delinquency shock)",
        "monitoring_alert_triggered": drift_report["drift_detected"],
        "drift_summary": drift_report
    }


@router.get("/anomalies")
def get_isolated_anomalies(contamination: float = Query(0.06, ge=0.01, le=0.20)):
    """
    Isolate anomalous accounts using unsupervised Isolation Forest algorithm.
    Flags unusual combinations of credit limit, repayment delays, and balance ratios for human audit.
    """
    df = load_credit_dataset("data/default_of_credit_card_clients_sample.csv")
    # Add customer codes if missing
    if "customer_code" not in df.columns:
        df["customer_code"] = [f"C{1000 + i}" for i in range(len(df))]

    detector = CreditAnomalyDetector(contamination=contamination)
    anomalies = detector.predict_anomalies(df)

    return {
        "algorithm": "Isolation Forest (Unsupervised Anomaly Detection)",
        "sample_analyzed": len(df),
        "anomalies_detected": len(anomalies),
        "contamination_rate": contamination,
        "anomalies": anomalies[:15]
    }
