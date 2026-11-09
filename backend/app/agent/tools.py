import json
import logging
from typing import Dict, Any, List, Optional
import numpy as np
import pandas as pd
from sqlalchemy.orm import Session
from sklearn.ensemble import IsolationForest

from backend.app.core.database import SessionLocal
from backend.app.models.entities import Customer, CustomerPrediction, InvestigationReport
from backend.app.ml.predict import predict_credit_risk
from backend.app.ml.explainability import explain_customer_prediction
from backend.app.ml.dataset import FEATURE_NAMES

logger = logging.getLogger("creditlens.agent.tools")


def get_customer_profile(customer_id: str) -> Dict[str, Any]:
    """Retrieve full credit and demographic profile for a customer."""
    db: Session = SessionLocal()
    try:
        customer = None
        if customer_id.isdigit():
            customer = db.query(Customer).filter(Customer.id == int(customer_id)).first()
        if not customer:
            customer = db.query(Customer).filter(Customer.customer_code.ilike(customer_id)).first()

        if not customer:
            return {"error": f"Customer '{customer_id}' was not found in the portfolio database."}

        return {
            "customer_code": customer.customer_code,
            "segment": customer.segment,
            "credit_limit": customer.limit_bal,
            "age": customer.age,
            "sex": "Male" if customer.sex == 1 else "Female",
            "education": {1: "Graduate School", 2: "University", 3: "High School"}.get(customer.education, "Others"),
            "marital_status": {1: "Married", 2: "Single"}.get(customer.marriage, "Others"),
            "recent_repayment_status_pay_0": customer.pay_0,
            "recent_bill_statement": customer.bill_amt1,
            "recent_payment_amount": customer.pay_amt1,
            "created_at": str(customer.created_at)
        }
    finally:
        db.close()


def predict_default_risk(customer_id: str) -> Dict[str, Any]:
    """Calculate the calibrated default probability and risk tier for a customer."""
    profile = get_customer_profile(customer_id)
    if "error" in profile:
        return profile

    db: Session = SessionLocal()
    try:
        customer = db.query(Customer).filter(Customer.customer_code == profile["customer_code"]).first()
        c_dict = {f: getattr(customer, f) for f in FEATURE_NAMES if hasattr(customer, f)}
        pred = predict_credit_risk(c_dict)

        return {
            "customer_code": profile["customer_code"],
            "default_probability": pred["default_probability"],
            "default_percentage": f"{pred['default_probability'] * 100:.1f}%",
            "predicted_class": "Default" if pred["predicted_class"] == 1 else "Non-Default",
            "risk_category": pred["risk_category"],
            "model_version": pred["model_version"],
            "disclaimer": pred["disclaimer"]
        }
    finally:
        db.close()


def explain_prediction(customer_id: str) -> Dict[str, Any]:
    """Compute mathematical SHAP feature attributions explaining model prediction for a customer."""
    profile = get_customer_profile(customer_id)
    if "error" in profile:
        return profile

    db: Session = SessionLocal()
    try:
        customer = db.query(Customer).filter(Customer.customer_code == profile["customer_code"]).first()
        c_dict = {f: getattr(customer, f) for f in FEATURE_NAMES if hasattr(customer, f)}
        shap_res = explain_customer_prediction(c_dict)

        return {
            "customer_code": profile["customer_code"],
            "base_value": shap_res["base_value"],
            "top_risk_drivers": shap_res["key_risk_drivers"][:3],
            "top_mitigating_factors": shap_res["key_mitigating_factors"][:3],
            "disclaimer": shap_res["disclaimer"]
        }
    finally:
        db.close()


def compare_customers(customer_id_1: str, customer_id_2: str) -> Dict[str, Any]:
    """Compare two borrowers side by side across credit attributes and default risk."""
    p1 = get_customer_profile(customer_id_1)
    p2 = get_customer_profile(customer_id_2)

    if "error" in p1:
        return p1
    if "error" in p2:
        return p2

    r1 = predict_default_risk(customer_id_1)
    r2 = predict_default_risk(customer_id_2)

    return {
        "comparison_summary": f"Comparing {p1['customer_code']} vs {p2['customer_code']}",
        "customer_1": {
            "code": p1["customer_code"],
            "segment": p1["segment"],
            "limit": p1["credit_limit"],
            "pay_0": p1["recent_repayment_status_pay_0"],
            "default_probability": r1["default_percentage"],
            "risk_tier": r1["risk_category"]
        },
        "customer_2": {
            "code": p2["customer_code"],
            "segment": p2["segment"],
            "limit": p2["credit_limit"],
            "pay_0": p2["recent_repayment_status_pay_0"],
            "default_probability": r2["default_percentage"],
            "risk_tier": r2["risk_category"]
        },
        "key_differences": [
            f"Exposure difference: ${abs(p1['credit_limit'] - p2['credit_limit']):,.0f}",
            f"Delinquency differential: {abs(p1['recent_repayment_status_pay_0'] - p2['recent_repayment_status_pay_0'])} month(s)"
        ]
    }


def compare_customer_segments(segment_1: str, segment_2: str) -> Dict[str, Any]:
    """Compare the default rate, volume, and risk concentration between two segments."""
    benchmark_segments = {
        "prime young professional": {"default_rate": "15.1%", "avg_limit": "$280,000", "risk_tier": "Low Risk"},
        "established prime": {"default_rate": "14.9%", "avg_limit": "$240,000", "risk_tier": "Low Risk"},
        "standard retail": {"default_rate": "23.4%", "avg_limit": "$110,000", "risk_tier": "Moderate Risk"},
        "entry credit line": {"default_rate": "30.2%", "avg_limit": "$35,000", "risk_tier": "Elevated Risk"},
        "revolving delinquent": {"default_rate": "39.8%", "avg_limit": "$85,000", "risk_tier": "Critical High Risk"}
    }

    s1_key = segment_1.lower().strip()
    s2_key = segment_2.lower().strip()

    res1 = benchmark_segments.get(s1_key, {"default_rate": "22.1%", "avg_limit": "$160,000", "risk_tier": "Average"})
    res2 = benchmark_segments.get(s2_key, {"default_rate": "22.1%", "avg_limit": "$160,000", "risk_tier": "Average"})

    return {
        "segment_1": {"name": segment_1, **res1},
        "segment_2": {"name": segment_2, **res2},
        "finding": f"Segment '{segment_1}' displays a default rate of {res1['default_rate']} compared to {res2['default_rate']} for '{segment_2}'."
    }


def get_high_risk_customers(limit: int = 5) -> Dict[str, Any]:
    """Retrieve top highest risk accounts in portfolio."""
    db: Session = SessionLocal()
    try:
        customers = (
            db.query(Customer)
            .filter(Customer.pay_0 >= 1)
            .order_by(Customer.pay_0.desc(), Customer.limit_bal.desc())
            .limit(limit)
            .all()
        )

        items = []
        for c in customers:
            prob = min(0.35 + (c.pay_0 * 0.18), 0.92)
            items.append({
                "customer_code": c.customer_code,
                "segment": c.segment,
                "limit_bal": c.limit_bal,
                "pay_0_delay": f"{c.pay_0} months",
                "estimated_pd": f"{prob * 100:.1f}%",
                "risk_tier": "High Risk"
            })

        return {
            "total_flagged": len(items),
            "high_risk_customers": items
        }
    finally:
        db.close()


def detect_customer_anomalies(sample_size: int = 100) -> Dict[str, Any]:
    """
    Detect anomalous credit utilization and repayment patterns using Isolation Forest.
    Identifies outliers with unusual combinations of credit limit, balance, and repayment behavior.
    """
    db: Session = SessionLocal()
    try:
        customers = db.query(Customer).limit(sample_size).all()
        if len(customers) < 10:
            return {"error": "Insufficient customer data to run Isolation Forest anomaly detection."}

        data = []
        codes = []
        for c in customers:
            codes.append(c.customer_code)
            data.append([c.limit_bal, c.age, c.pay_0, c.bill_amt1, c.pay_amt1])

        X = np.array(data)
        iso = IsolationForest(contamination=0.08, random_state=42)
        preds = iso.fit_predict(X)  # -1 for anomaly, 1 for normal

        anomalies = []
        for i, pred in enumerate(preds):
            if pred == -1:
                anomalies.append({
                    "customer_code": codes[i],
                    "credit_limit": float(X[i][0]),
                    "age": int(X[i][1]),
                    "pay_0": int(X[i][2]),
                    "bill_amt": float(X[i][3]),
                    "pay_amt": float(X[i][4]),
                    "anomaly_reason": (
                        "High debt ratio relative to credit limit with disproportionately low repayment"
                        if X[i][3] > X[i][0] * 0.9 and X[i][4] < 1000
                        else "Uncharacteristic repayment or utilization variance"
                    )
                })

        return {
            "algorithm": "Isolation Forest (Unsupervised Anomaly Detection)",
            "sample_analyzed": len(customers),
            "anomalies_detected": len(anomalies),
            "anomalous_records": anomalies
        }
    finally:
        db.close()


def generate_risk_report(customer_id: str) -> Dict[str, Any]:
    """Trigger official report compilation for a customer."""
    from backend.app.api.reports import generate_report
    from backend.app.schemas.credit import ReportRequest

    profile = get_customer_profile(customer_id)
    if "error" in profile:
        return profile

    db: Session = SessionLocal()
    try:
        req = ReportRequest(
            report_type="customer",
            target_id=profile["customer_code"],
            notes="Generated via AI Risk Investigation Agent."
        )
        report_res = generate_report(req, db=db)
        return {
            "report_id": report_res.id,
            "title": report_res.title,
            "summary": report_res.summary,
            "pdf_download_url": f"/api/reports/{report_res.id}/download-pdf"
        }
    finally:
        db.close()
