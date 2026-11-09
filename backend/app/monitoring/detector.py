import logging
from typing import Dict, Any, List
import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest

from backend.app.ml.dataset import FEATURE_NAMES

logger = logging.getLogger("creditlens.monitoring.detector")


class CreditAnomalyDetector:
    """
    Unsupervised multidimensional anomaly detection using Isolation Forest.
    Isolates unusual customer risk profiles that deviate sharply from standard
    utilization and payment ratios.
    """

    def __init__(self, contamination: float = 0.05, random_state: int = 42):
        self.contamination = contamination
        self.random_state = random_state
        self.model = IsolationForest(
            contamination=contamination,
            random_state=random_state,
            n_jobs=-1
        )
        self.is_fitted = False

    def fit(self, df: pd.DataFrame):
        X = df[FEATURE_NAMES].copy()
        self.model.fit(X)
        self.is_fitted = True
        logger.info(f"Fitted Isolation Forest anomaly detector on {len(df)} records.")
        return self

    def predict_anomalies(self, df: pd.DataFrame) -> List[Dict[str, Any]]:
        if not self.is_fitted:
            self.fit(df)

        X = df[FEATURE_NAMES].copy()
        preds = self.model.predict(X)  # -1 for anomaly, 1 for normal
        scores = self.model.decision_function(X)  # Lower score = more anomalous

        anomalies = []
        for i, (pred, score) in enumerate(zip(preds, scores)):
            if pred == -1:
                row = df.iloc[i]
                limit = float(row.get("limit_bal", 0))
                bill = float(row.get("bill_amt1", 0))
                pay = float(row.get("pay_amt1", 0))
                repay = int(row.get("pay_0", 0))

                reasons = []
                if bill > limit * 0.95:
                    reasons.append("Credit limit almost fully exhausted (>95% utilization)")
                if repay >= 2 and pay < 1000:
                    reasons.append("Chronic 2+ month arrears with negligible repayment")
                if pay > bill * 2 and bill > 10000:
                    reasons.append("Payment amount dramatically exceeds billed balance")
                if not reasons:
                    reasons.append("High multi-dimensional feature divergence")

                anomalies.append({
                    "customer_code": row.get("customer_code", f"REC_{i}"),
                    "anomaly_score": round(float(score), 4),
                    "limit_bal": limit,
                    "bill_amt1": bill,
                    "pay_amt1": pay,
                    "pay_0": repay,
                    "primary_risk_driver": "; ".join(reasons)
                })

        # Sort from most severe anomaly to least
        anomalies.sort(key=lambda x: x["anomaly_score"])
        return anomalies
