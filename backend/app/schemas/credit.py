from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime


# Health Schemas
class HealthResponse(BaseModel):
    status: str = "ok"
    app_name: str
    version: str
    environment: str
    database: str
    timestamp: datetime


# Customer Schemas
class CustomerBase(BaseModel):
    customer_code: str
    limit_bal: float
    sex: int = Field(..., ge=1, le=2, description="1=male, 2=female")
    education: int = Field(..., ge=0, le=6, description="1=grad, 2=uni, 3=hs, 4=other")
    marriage: int = Field(..., ge=0, le=3, description="1=married, 2=single, 3=other")
    age: int = Field(..., ge=18, le=120)
    pay_0: int = 0
    pay_2: int = 0
    pay_3: int = 0
    pay_4: int = 0
    pay_5: int = 0
    pay_6: int = 0
    bill_amt1: float = 0.0
    bill_amt2: float = 0.0
    bill_amt3: float = 0.0
    bill_amt4: float = 0.0
    bill_amt5: float = 0.0
    bill_amt6: float = 0.0
    pay_amt1: float = 0.0
    pay_amt2: float = 0.0
    pay_amt3: float = 0.0
    pay_amt4: float = 0.0
    pay_amt5: float = 0.0
    pay_amt6: float = 0.0
    segment: Optional[str] = "Standard"


class CustomerCreate(CustomerBase):
    pass


class CustomerResponse(CustomerBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    actual_default: Optional[int] = None
    created_at: datetime


# Prediction Schemas
class PredictionRequest(BaseModel):
    customer_code: Optional[str] = "NEW_EVAL"
    limit_bal: float
    sex: int
    education: int
    marriage: int
    age: int
    pay_0: int = 0
    pay_2: int = 0
    pay_3: int = 0
    pay_4: int = 0
    pay_5: int = 0
    pay_6: int = 0
    bill_amt1: float = 0.0
    bill_amt2: float = 0.0
    bill_amt3: float = 0.0
    bill_amt4: float = 0.0
    bill_amt5: float = 0.0
    bill_amt6: float = 0.0
    pay_amt1: float = 0.0
    pay_amt2: float = 0.0
    pay_amt3: float = 0.0
    pay_amt4: float = 0.0
    pay_amt5: float = 0.0
    pay_amt6: float = 0.0


class ShapFeatureContribution(BaseModel):
    feature: str
    feature_value: Any
    shap_value: float
    direction: str  # "increases_risk" or "decreases_risk"
    impact: str     # "High", "Medium", "Low"
    description: str


class PredictionResponse(BaseModel):
    customer_code: str
    default_probability: float
    predicted_class: int
    risk_category: str
    model_version: str
    shap_contributions: List[ShapFeatureContribution] = []
    base_value: Optional[float] = None
    disclaimer: str = "Illustrative educational estimate only. Not an actual credit lending decision."
    assessed_at: datetime


# Dataset Schemas
class DatasetSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    filename: str
    row_count: int
    column_count: int
    target_column: str
    default_rate: Optional[float] = None
    status: str
    validation_summary: Optional[Dict[str, Any]] = None
    created_at: datetime


# Model Schemas
class ModelMetrics(BaseModel):
    version: str
    algorithm: str
    roc_auc: float
    pr_auc: float
    f1_score: float
    precision: float
    recall: float
    confusion_matrix: Optional[List[List[int]]] = None
    training_date: datetime
    is_active: bool


# Report Schemas
class ReportRequest(BaseModel):
    report_type: str = Field(..., pattern="^(customer|portfolio)$")
    target_id: str
    notes: Optional[str] = None


class ReportResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    report_type: str
    target_id: str
    title: str
    summary: str
    content: Dict[str, Any]
    created_at: datetime
