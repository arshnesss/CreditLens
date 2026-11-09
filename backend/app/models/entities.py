from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey, JSON
)
from sqlalchemy.orm import relationship
from backend.app.core.database import Base


class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    customer_code = Column(String(50), unique=True, index=True, nullable=False)
    
    # Financial & Demographic features (UCI Credit dataset aligned)
    limit_bal = Column(Float, nullable=False)
    sex = Column(Integer, nullable=False)          # 1=male, 2=female
    education = Column(Integer, nullable=False)    # 1=grad school, 2=university, 3=high school, 4=others
    marriage = Column(Integer, nullable=False)     # 1=married, 2=single, 3=others
    age = Column(Integer, nullable=False)

    # Repayment status (months -2 to +8)
    pay_0 = Column(Integer, default=0)
    pay_2 = Column(Integer, default=0)
    pay_3 = Column(Integer, default=0)
    pay_4 = Column(Integer, default=0)
    pay_5 = Column(Integer, default=0)
    pay_6 = Column(Integer, default=0)

    # Bill amounts
    bill_amt1 = Column(Float, default=0.0)
    bill_amt2 = Column(Float, default=0.0)
    bill_amt3 = Column(Float, default=0.0)
    bill_amt4 = Column(Float, default=0.0)
    bill_amt5 = Column(Float, default=0.0)
    bill_amt6 = Column(Float, default=0.0)

    # Payment amounts
    pay_amt1 = Column(Float, default=0.0)
    pay_amt2 = Column(Float, default=0.0)
    pay_amt3 = Column(Float, default=0.0)
    pay_amt4 = Column(Float, default=0.0)
    pay_amt5 = Column(Float, default=0.0)
    pay_amt6 = Column(Float, default=0.0)

    # Actual outcome if labelled in dataset (0=no default, 1=default)
    actual_default = Column(Integer, nullable=True)

    # Segment classification
    segment = Column(String(100), default="Standard")

    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    predictions = relationship("CustomerPrediction", back_populates="customer", cascade="all, delete-orphan")


class DatasetUpload(Base):
    __tablename__ = "dataset_uploads"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String(255), nullable=False)
    row_count = Column(Integer, default=0)
    column_count = Column(Integer, default=0)
    target_column = Column(String(100), default="default.payment.next.month")
    default_rate = Column(Float, nullable=True)
    status = Column(String(50), default="uploaded")  # uploaded, validated, processed, error
    validation_summary = Column(Text, nullable=True)  # JSON or text summary
    file_path = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class ModelVersion(Base):
    __tablename__ = "model_versions"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    version = Column(String(50), unique=True, nullable=False)
    algorithm = Column(String(100), nullable=False)
    roc_auc = Column(Float, nullable=True)
    pr_auc = Column(Float, nullable=True)
    f1_score = Column(Float, nullable=True)
    precision = Column(Float, nullable=True)
    recall = Column(Float, nullable=True)
    is_active = Column(Boolean, default=False)
    artifact_path = Column(String(500), nullable=False)
    metrics_json = Column(Text, nullable=True)  # JSON string of metrics
    training_date = Column(DateTime, default=datetime.utcnow)

    predictions = relationship("CustomerPrediction", back_populates="model_version")


class CustomerPrediction(Base):
    __tablename__ = "customer_predictions"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)
    customer_code = Column(String(50), index=True, nullable=False)
    model_version_id = Column(Integer, ForeignKey("model_versions.id"), nullable=True)

    default_probability = Column(Float, nullable=False)
    predicted_class = Column(Integer, nullable=False)
    risk_category = Column(String(20), nullable=False)  # Low, Medium, High
    shap_values_json = Column(Text, nullable=True)       # Top contributors JSON

    created_at = Column(DateTime, default=datetime.utcnow)

    customer = relationship("Customer", back_populates="predictions")
    model_version = relationship("ModelVersion", back_populates="predictions")


class RiskAssessment(Base):
    __tablename__ = "risk_assessments"

    id = Column(Integer, primary_key=True, index=True)
    customer_code = Column(String(50), index=True, nullable=False)
    default_probability = Column(Float, nullable=False)
    risk_category = Column(String(20), nullable=False)
    key_drivers = Column(Text, nullable=True)            # Top positive/negative drivers
    disclaimer = Column(String(500), default="Illustrative educational estimate only. Not an actual credit decision.")
    notes = Column(Text, nullable=True)
    assessed_at = Column(DateTime, default=datetime.utcnow)


class InvestigationReport(Base):
    __tablename__ = "investigation_reports"

    id = Column(Integer, primary_key=True, index=True)
    report_type = Column(String(50), nullable=False)    # 'customer' or 'portfolio'
    target_id = Column(String(100), nullable=False)      # Customer code or 'PORTFOLIO'
    title = Column(String(255), nullable=False)
    summary = Column(Text, nullable=False)
    content_json = Column(Text, nullable=False)         # Detailed sections, charts, metrics
    pdf_path = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class MonitoringRecord(Base):
    __tablename__ = "monitoring_records"

    id = Column(Integer, primary_key=True, index=True)
    reference_dataset = Column(String(255), nullable=False)
    current_dataset = Column(String(255), nullable=False)
    drift_detected = Column(Boolean, default=False)
    drift_share = Column(Float, default=0.0)
    anomalies_detected = Column(Integer, default=0)
    metrics_json = Column(Text, nullable=True)
    recorded_at = Column(DateTime, default=datetime.utcnow)
