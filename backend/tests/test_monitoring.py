import pytest
import pandas as pd
import numpy as np
from backend.app.ml.dataset import load_credit_dataset, FEATURE_NAMES
from backend.app.monitoring.drift import detect_data_drift, simulate_recession_distribution_shift
from backend.app.monitoring.detector import CreditAnomalyDetector


def test_data_drift_baseline():
    df = load_credit_dataset("data/default_of_credit_card_clients_sample.csv")
    ref = df.sample(frac=0.5, random_state=42)
    curr = df.sample(frac=0.5, random_state=123)

    drift_res = detect_data_drift(ref, curr, p_value_threshold=0.01)
    assert "drift_detected" in drift_res
    assert "feature_metrics" in drift_res
    # Baseline sub-samples from same distribution should not show massive drift
    assert drift_res["drift_share"] < 0.30


def test_data_drift_controlled_shift():
    df = load_credit_dataset("data/default_of_credit_card_clients_sample.csv")
    shifted = simulate_recession_distribution_shift(df)

    drift_res = detect_data_drift(df, shifted, p_value_threshold=0.05)
    assert "drift_detected" in drift_res
    # Delinquency and payment shifts should be detected
    assert drift_res["drifted_features_count"] > 0
    drifted_names = [f["feature"] for f in drift_res["feature_metrics"] if f["drift_detected"]]
    assert any("pay" in name or "bill" in name for name in drifted_names)


def test_isolation_forest_anomaly_detector():
    df = load_credit_dataset("data/default_of_credit_card_clients_sample.csv")
    detector = CreditAnomalyDetector(contamination=0.05)
    anomalies = detector.predict_anomalies(df)
    assert isinstance(anomalies, list)
    assert len(anomalies) > 0
    first = anomalies[0]
    assert "anomaly_score" in first
    assert "primary_risk_driver" in first
