import os
import json
import logging
from typing import Dict, Any, Union
import joblib
import pandas as pd
from backend.app.core.config import settings
from backend.app.ml.dataset import FEATURE_NAMES

logger = logging.getLogger("creditlens.ml.predict")
MODEL_PATH = os.path.join(settings.MODEL_DIR, "credit_default_pipeline.joblib")
METADATA_PATH = os.path.join(settings.MODEL_DIR, "model_metadata.json")

_cached_model = None
_cached_metadata = None


def get_model_and_metadata():
    """Load or cache model and metadata."""
    global _cached_model, _cached_metadata
    if _cached_model is None:
        if not os.path.exists(MODEL_PATH):
            from backend.app.ml.train import train_and_evaluate_pipeline
            logger.info("Model artifact not found. Triggering automated initial training...")
            _cached_model, _cached_metadata = train_and_evaluate_pipeline()
        else:
            _cached_model = joblib.load(MODEL_PATH)
            if os.path.exists(METADATA_PATH):
                with open(METADATA_PATH, "r") as f:
                    _cached_metadata = json.load(f)
            else:
                _cached_metadata = {"model_version": "v1.0.0", "algorithm": "Calibrated Random Forest"}
    return _cached_model, _cached_metadata


def classify_risk_category(probability: float) -> str:
    """
    Classify default probability into configurable illustrative risk categories:
    - Low Risk:    PD < 0.20
    - Medium Risk: 0.20 <= PD < 0.45
    - High Risk:   PD >= 0.45
    """
    if probability < settings.LOW_RISK_THRESHOLD:
        return "Low"
    elif probability < settings.HIGH_RISK_THRESHOLD:
        return "Medium"
    else:
        return "High"


def predict_credit_risk(customer_data: Union[Dict[str, Any], pd.DataFrame]) -> Dict[str, Any]:
    """
    Predict default probability and risk tier for a customer record.
    Input customer_data can be a dictionary of features or a DataFrame.
    """
    model, metadata = get_model_and_metadata()

    if isinstance(customer_data, dict):
        # Format dictionary keys to lower snake_case
        clean_input = {}
        for k, v in customer_data.items():
            clean_key = k.lower().replace(" ", "_").replace(".", "_")
            if clean_key == "pay_1":
                clean_key = "pay_0"
            clean_input[clean_key] = v

        # Construct single-row DataFrame with required columns
        row = {}
        for feature in FEATURE_NAMES:
            row[feature] = [clean_input.get(feature, 0)]
        df_input = pd.DataFrame(row)
    else:
        df_input = customer_data[FEATURE_NAMES].copy()

    # Probability estimation: [P(Non-Default), P(Default)]
    probabilities = model.predict_proba(df_input)
    default_prob = float(probabilities[0][1])
    predicted_class = int(default_prob >= 0.5)
    risk_category = classify_risk_category(default_prob)

    return {
        "default_probability": round(default_prob, 4),
        "predicted_class": predicted_class,
        "risk_category": risk_category,
        "model_version": metadata.get("model_version", "v1.0.0"),
        "algorithm": metadata.get("algorithm", "Calibrated Random Forest"),
        "risk_thresholds": {
            "low": f"< {settings.LOW_RISK_THRESHOLD:.2f}",
            "medium": f"{settings.LOW_RISK_THRESHOLD:.2f} - {settings.HIGH_RISK_THRESHOLD:.2f}",
            "high": f">= {settings.HIGH_RISK_THRESHOLD:.2f}"
        },
        "disclaimer": "Illustrative educational estimate only. Not an actual credit underwriting decision."
    }
