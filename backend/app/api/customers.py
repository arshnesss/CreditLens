import json
import logging
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_

from backend.app.core.database import get_db
from backend.app.models.entities import Customer, CustomerPrediction, RiskAssessment
from backend.app.schemas.credit import CustomerCreate, CustomerResponse
from backend.app.ml.dataset import load_credit_dataset, FEATURE_NAMES

router = APIRouter(prefix="/customers", tags=["Customer Management"])
logger = logging.getLogger("creditlens.api.customers")


@router.post("", response_model=CustomerResponse, status_code=status.HTTP_201_CREATED)
def create_customer(payload: CustomerCreate, db: Session = Depends(get_db)):
    """Add a new customer profile into the database."""
    existing = db.query(Customer).filter(Customer.customer_code == payload.customer_code).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Customer with code '{payload.customer_code}' already exists."
        )

    customer = Customer(**payload.model_dump())
    db.add(customer)
    db.commit()
    db.refresh(customer)
    return customer


@router.get("")
def list_customers(
    page: int = Query(1, ge=1),
    limit: int = Query(25, ge=1, le=200),
    search: Optional[str] = None,
    risk_category: Optional[str] = None,
    segment: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Search and filter customer records with pagination.
    Supports search by customer code or segment.
    """
    query = db.query(Customer)

    if search:
        search_filter = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Customer.customer_code.ilike(search_filter),
                Customer.segment.ilike(search_filter)
            )
        )

    if segment:
        query = query.filter(Customer.segment == segment)

    total = query.count()
    offset = (page - 1) * limit
    customers = query.order_by(Customer.id.asc()).offset(offset).limit(limit).all()

    # Attach latest prediction if available
    items = []
    for c in customers:
        latest_pred = (
            db.query(CustomerPrediction)
            .filter(CustomerPrediction.customer_id == c.id)
            .order_by(CustomerPrediction.created_at.desc())
            .first()
        )
        c_dict = {
            "id": c.id,
            "customer_code": c.customer_code,
            "limit_bal": c.limit_bal,
            "sex": c.sex,
            "education": c.education,
            "marriage": c.marriage,
            "age": c.age,
            "pay_0": c.pay_0,
            "bill_amt1": c.bill_amt1,
            "pay_amt1": c.pay_amt1,
            "actual_default": c.actual_default,
            "segment": c.segment,
            "latest_prediction": {
                "probability": latest_pred.default_probability,
                "risk_category": latest_pred.risk_category,
                "assessed_at": latest_pred.created_at
            } if latest_pred else None
        }
        if risk_category:
            if latest_pred and latest_pred.risk_category.lower() == risk_category.lower():
                items.append(c_dict)
        else:
            items.append(c_dict)

    return {
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": (total + limit - 1) // limit if total > 0 else 1,
        "items": items
    }


@router.get("/{customer_id}")
def get_customer(customer_id: str, db: Session = Depends(get_db)):
    """Retrieve full credit profile for an individual customer by ID or customer_code."""
    customer = None
    if customer_id.isdigit():
        customer = db.query(Customer).filter(Customer.id == int(customer_id)).first()
    if not customer:
        customer = db.query(Customer).filter(Customer.customer_code == customer_id).first()

    if not customer:
        raise HTTPException(status_code=404, detail=f"Customer '{customer_id}' not found.")

    return customer


@router.get("/{customer_id}/history")
def get_customer_history(customer_id: str, db: Session = Depends(get_db)):
    """Retrieve historical risk assessments and predictions for a customer."""
    customer = None
    if customer_id.isdigit():
        customer = db.query(Customer).filter(Customer.id == int(customer_id)).first()
    if not customer:
        customer = db.query(Customer).filter(Customer.customer_code == customer_id).first()

    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found.")

    predictions = (
        db.query(CustomerPrediction)
        .filter(CustomerPrediction.customer_id == customer.id)
        .order_by(CustomerPrediction.created_at.desc())
        .all()
    )

    history = []
    for p in predictions:
        shap_data = json.loads(p.shap_values_json) if p.shap_values_json else []
        history.append({
            "id": p.id,
            "default_probability": p.default_probability,
            "predicted_class": p.predicted_class,
            "risk_category": p.risk_category,
            "shap_summary": shap_data,
            "created_at": p.created_at
        })

    return {
        "customer_code": customer.customer_code,
        "total_assessments": len(history),
        "history": history
    }


@router.post("/seed-benchmark")
def seed_benchmark_customers(count: int = 250, db: Session = Depends(get_db)):
    """
    Populate database with synthetic/benchmark customer profiles from UCI dataset.
    Permits instant testing and rich analytics.
    """
    existing_count = db.query(Customer).count()
    if existing_count >= count:
        return {"message": f"Database already has {existing_count} customers.", "total_customers": existing_count}

    df = load_credit_dataset("data/default_of_credit_card_clients_sample.csv")
    sample_rows = df.head(count)

    def determine_segment(row):
        limit = row["limit_bal"]
        age = row["age"]
        if limit > 250000 and age < 35:
            return "Prime Young Professional"
        elif limit > 200000:
            return "Established Prime"
        elif row["pay_0"] > 1:
            return "Revolving Delinquent"
        elif limit < 50000:
            return "Entry Credit Line"
        else:
            return "Standard Retail"

    added = 0
    for idx, row in sample_rows.iterrows():
        code = f"C{1000 + idx}"
        if not db.query(Customer).filter(Customer.customer_code == code).first():
            customer = Customer(
                customer_code=code,
                limit_bal=float(row["limit_bal"]),
                sex=int(row["sex"]),
                education=int(row["education"]),
                marriage=int(row["marriage"]),
                age=int(row["age"]),
                pay_0=int(row["pay_0"]),
                pay_2=int(row["pay_2"]),
                pay_3=int(row["pay_3"]),
                pay_4=int(row["pay_4"]),
                pay_5=int(row["pay_5"]),
                pay_6=int(row["pay_6"]),
                bill_amt1=float(row["bill_amt1"]),
                bill_amt2=float(row["bill_amt2"]),
                bill_amt3=float(row["bill_amt3"]),
                bill_amt4=float(row["bill_amt4"]),
                bill_amt5=float(row["bill_amt5"]),
                bill_amt6=float(row["bill_amt6"]),
                pay_amt1=float(row["pay_amt1"]),
                pay_amt2=float(row["pay_amt2"]),
                pay_amt3=float(row["pay_amt3"]),
                pay_amt4=float(row["pay_amt4"]),
                pay_amt5=float(row["pay_amt5"]),
                pay_amt6=float(row["pay_amt6"]),
                actual_default=int(row["default_payment_next_month"]) if "default_payment_next_month" in row else None,
                segment=determine_segment(row)
            )
            db.add(customer)
            added += 1

    db.commit()
    return {"message": f"Seeded {added} benchmark customer profiles.", "total_customers": db.query(Customer).count()}
