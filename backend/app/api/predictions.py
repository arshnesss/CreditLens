import json
from datetime import datetime
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from backend.app.core.database import get_db
from backend.app.models.entities import Customer, CustomerPrediction
from backend.app.schemas.credit import PredictionRequest, PredictionResponse, ShapFeatureContribution
from backend.app.ml.predict import predict_credit_risk
from backend.app.ml.explainability import explain_customer_prediction

router = APIRouter(prefix="/predictions", tags=["Risk Predictions & Explainability"])


@router.post("/predict", response_model=PredictionResponse)
def compute_prediction(payload: PredictionRequest, db: Session = Depends(get_db)):
    """
    Generate credit default risk prediction and SHAP explainability.
    Connects to calibrated Random Forest model and TreeExplainer.
    Persists prediction audit into database.
    """
    data_dict = payload.model_dump()
    customer_code = data_dict.get("customer_code") or "EVAL_APP"

    # 1. Run Machine Learning Model Prediction
    pred_result = predict_credit_risk(data_dict)

    # 2. Run SHAP TreeExplainer for Feature Contributions
    shap_result = explain_customer_prediction(data_dict)

    shap_contributions = [
        ShapFeatureContribution(
            feature=item["feature"],
            feature_value=item["feature_value"],
            shap_value=item["shap_value"],
            direction=item["direction"],
            impact=item["impact"],
            description=item["description"]
        )
        for item in shap_result["top_contributions"]
    ]

    # Find customer id if exists
    customer = db.query(Customer).filter(Customer.customer_code == customer_code).first()
    customer_id = customer.id if customer else None

    # If customer does not exist, optionally create or link
    if not customer_id:
        # Create a lightweight customer entity to maintain relational integrity
        new_customer = Customer(
            customer_code=customer_code,
            limit_bal=payload.limit_bal,
            sex=payload.sex,
            education=payload.education,
            marriage=payload.marriage,
            age=payload.age,
            pay_0=payload.pay_0,
            pay_2=payload.pay_2,
            pay_3=payload.pay_3,
            pay_4=payload.pay_4,
            pay_5=payload.pay_5,
            pay_6=payload.pay_6,
            bill_amt1=payload.bill_amt1,
            bill_amt2=payload.bill_amt2,
            bill_amt3=payload.bill_amt3,
            bill_amt4=payload.bill_amt4,
            bill_amt5=payload.bill_amt5,
            bill_amt6=payload.bill_amt6,
            pay_amt1=payload.pay_amt1,
            pay_amt2=payload.pay_amt2,
            pay_amt3=payload.pay_amt3,
            pay_amt4=payload.pay_amt4,
            pay_amt5=payload.pay_amt5,
            pay_amt6=payload.pay_amt6,
            segment="Ad-hoc Assessment"
        )
        db.add(new_customer)
        db.commit()
        db.refresh(new_customer)
        customer_id = new_customer.id

    # 3. Store prediction audit record
    prediction_record = CustomerPrediction(
        customer_id=customer_id,
        customer_code=customer_code,
        default_probability=pred_result["default_probability"],
        predicted_class=pred_result["predicted_class"],
        risk_category=pred_result["risk_category"],
        shap_values_json=json.dumps([c.model_dump() for c in shap_contributions])
    )
    db.add(prediction_record)
    db.commit()
    db.refresh(prediction_record)

    return PredictionResponse(
        customer_code=customer_code,
        default_probability=pred_result["default_probability"],
        predicted_class=pred_result["predicted_class"],
        risk_category=pred_result["risk_category"],
        model_version=pred_result["model_version"],
        shap_contributions=shap_contributions,
        base_value=shap_result["base_value"],
        disclaimer=pred_result["disclaimer"],
        assessed_at=prediction_record.created_at
    )


@router.get("/history")
def list_prediction_history(limit: int = Query(20, ge=1, le=100), db: Session = Depends(get_db)):
    """Retrieve recent risk prediction logs with audit outcomes."""
    records = db.query(CustomerPrediction).order_by(CustomerPrediction.created_at.desc()).limit(limit).all()
    out = []
    for r in records:
        shap_list = json.loads(r.shap_values_json) if r.shap_values_json else []
        out.append({
            "id": r.id,
            "customer_code": r.customer_code,
            "default_probability": r.default_probability,
            "predicted_class": r.predicted_class,
            "risk_category": r.risk_category,
            "key_drivers": shap_list[:3],
            "assessed_at": r.created_at
        })
    return out


@router.get("/{prediction_id}")
def get_prediction_detail(prediction_id: int, db: Session = Depends(get_db)):
    """Retrieve specific prediction with full SHAP breakdown."""
    record = db.query(CustomerPrediction).filter(CustomerPrediction.id == prediction_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Prediction record not found.")

    shap_data = json.loads(record.shap_values_json) if record.shap_values_json else []
    return {
        "id": record.id,
        "customer_code": record.customer_code,
        "default_probability": record.default_probability,
        "predicted_class": record.predicted_class,
        "risk_category": record.risk_category,
        "shap_contributions": shap_data,
        "created_at": record.created_at
    }
