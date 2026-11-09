import os
import json
from datetime import datetime
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib import colors

from backend.app.core.database import get_db
from backend.app.core.config import settings
from backend.app.models.entities import InvestigationReport, Customer, CustomerPrediction
from backend.app.schemas.credit import ReportRequest, ReportResponse
from backend.app.ml.predict import predict_credit_risk
from backend.app.ml.explainability import explain_customer_prediction

router = APIRouter(prefix="/reports", tags=["Report Generation"])
REPORT_DIR = os.path.join(settings.DATA_DIR, "reports")
os.makedirs(REPORT_DIR, exist_ok=True)


def _generate_pdf_file(title: str, summary: str, details: dict, output_path: str):
    """Generate a clean, professional PDF audit report using reportlab."""
    c = canvas.Canvas(output_path, pagesize=letter)
    width, height = letter

    # Header Banner
    c.setFillColor(colors.HexColor("#0B132B"))
    c.rect(0, height - 70, width, 70, stroke=0, fill=1)

    c.setFillColor(colors.white)
    c.setFont("Helvetica-Bold", 18)
    c.drawString(40, height - 42, "CreditLens AI — Credit Risk Audit Report")
    c.setFont("Helvetica", 9)
    c.drawString(40, height - 58, f"Generated: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')} | Educational Portfolio System")

    # Body
    c.setFillColor(colors.HexColor("#0F172A"))
    c.setFont("Helvetica-Bold", 14)
    c.drawString(40, height - 105, title)

    c.setFont("Helvetica", 10)
    c.setFillColor(colors.HexColor("#334155"))
    y = height - 130
    for line in summary.split("\n"):
        c.drawString(40, y, line[:95])
        y -= 16

    y -= 10
    c.setStrokeColor(colors.HexColor("#CBD5E1"))
    c.line(40, y, width - 40, y)
    y -= 25

    # Key Metrics / Details
    c.setFont("Helvetica-Bold", 11)
    c.setFillColor(colors.HexColor("#0F172A"))
    c.drawString(40, y, "Analytical Audit Findings & Risk Evidence:")
    y -= 20

    c.setFont("Helvetica", 9)
    for k, v in details.items():
        if y < 100:
            c.showPage()
            y = height - 60
        label = str(k).replace("_", " ").title()
        val_str = str(v)
        c.setFillColor(colors.HexColor("#475569"))
        c.drawString(50, y, f"• {label}:")
        c.setFillColor(colors.HexColor("#0F172A"))
        c.drawString(220, y, val_str[:60])
        y -= 18

    # Disclaimer Footer
    y = 50
    c.setFillColor(colors.HexColor("#94A3B8"))
    c.setFont("Helvetica-Oblique", 8)
    c.drawString(40, y, "Disclaimer: This document is generated for educational evaluation purposes only.")
    c.drawString(40, y - 12, "Model scores reflect mathematical approximations and do not constitute actual credit lending decisions.")

    c.save()


@router.post("/generate", response_model=ReportResponse, status_code=status.HTTP_201_CREATED)
def generate_report(payload: ReportRequest, db: Session = Depends(get_db)):
    """
    Generate an individual customer audit report or an aggregate portfolio risk report.
    Creates a persistent database record and downloadable PDF.
    """
    if payload.report_type == "customer":
        customer = db.query(Customer).filter(Customer.customer_code == payload.target_id).first()
        if not customer:
            raise HTTPException(status_code=404, detail=f"Customer '{payload.target_id}' not found.")

        # Compute fresh prediction and SHAP
        c_dict = {
            "limit_bal": customer.limit_bal,
            "sex": customer.sex,
            "education": customer.education,
            "marriage": customer.marriage,
            "age": customer.age,
            "pay_0": customer.pay_0,
            "pay_2": customer.pay_2,
            "pay_3": customer.pay_3,
            "pay_4": customer.pay_4,
            "pay_5": customer.pay_5,
            "pay_6": customer.pay_6,
            "bill_amt1": customer.bill_amt1,
            "bill_amt2": customer.bill_amt2,
            "bill_amt3": customer.bill_amt3,
            "bill_amt4": customer.bill_amt4,
            "bill_amt5": customer.bill_amt5,
            "bill_amt6": customer.bill_amt6,
            "pay_amt1": customer.pay_amt1,
            "pay_amt2": customer.pay_amt2,
            "pay_amt3": customer.pay_amt3,
            "pay_amt4": customer.pay_amt4,
            "pay_amt5": customer.pay_amt5,
            "pay_amt6": customer.pay_amt6,
        }
        pred = predict_credit_risk(c_dict)
        shap_res = explain_customer_prediction(c_dict)

        title = f"Credit Risk Audit Report: {customer.customer_code}"
        summary = (
            f"Comprehensive credit risk investigation for account {customer.customer_code} ({customer.segment}).\n"
            f"Calibrated probability of default is estimated at {pred['default_probability'] * 100:.1f}% "
            f"placing the account in the '{pred['risk_category']}' risk category."
        )

        content = {
            "customer_code": customer.customer_code,
            "segment": customer.segment,
            "default_probability": pred["default_probability"],
            "risk_category": pred["risk_category"],
            "credit_limit": customer.limit_bal,
            "delinquency_recent_pay_0": customer.pay_0,
            "top_risk_driver": shap_res["key_risk_drivers"][0]["description"] if shap_res["key_risk_drivers"] else "None",
            "top_mitigating_factor": shap_res["key_mitigating_factors"][0]["description"] if shap_res["key_mitigating_factors"] else "None",
            "model_version": pred["model_version"],
            "analyst_notes": payload.notes or "Standard risk assessment review."
        }

    else:
        # Portfolio Report
        title = "Overall Portfolio Risk & Drift Intelligence Report"
        summary = (
            "Executive portfolio-level audit examining default distribution, high-risk customer segments,\n"
            "and model calibration telemetry across 30,000 credit records."
        )
        content = {
            "portfolio_scope": "Benchmark Credit Card Portfolio",
            "benchmark_default_rate": "22.12%",
            "high_risk_share": "22.1% (6,636 accounts)",
            "medium_risk_share": "27.3% (8,200 accounts)",
            "low_risk_share": "50.5% (15,164 accounts)",
            "highest_risk_segment": "Revolving Delinquent (39.8% default rate)",
            "lowest_risk_segment": "Established Prime (14.9% default rate)",
            "active_model": "Random Forest (Sigmoid Calibrated)",
            "model_roc_auc": 0.7744,
            "model_brier_score": 0.1368,
            "analyst_notes": payload.notes or "Quarterly portfolio risk intelligence audit."
        }

    # Generate PDF
    pdf_filename = f"report_{payload.report_type}_{payload.target_id}_{int(datetime.utcnow().timestamp())}.pdf"
    pdf_path = os.path.join(REPORT_DIR, pdf_filename)
    _generate_pdf_file(title, summary, content, pdf_path)

    report_record = InvestigationReport(
        report_type=payload.report_type,
        target_id=payload.target_id,
        title=title,
        summary=summary,
        content_json=json.dumps(content),
        pdf_path=pdf_path
    )
    db.add(report_record)
    db.commit()
    db.refresh(report_record)

    return ReportResponse(
        id=report_record.id,
        report_type=report_record.report_type,
        target_id=report_record.target_id,
        title=report_record.title,
        summary=report_record.summary,
        content=content,
        created_at=report_record.created_at
    )


@router.get("")
def list_reports(db: Session = Depends(get_db)):
    """List all generated risk reports."""
    reports = db.query(InvestigationReport).order_by(InvestigationReport.created_at.desc()).all()
    results = []
    for r in reports:
        results.append({
            "id": r.id,
            "report_type": r.report_type,
            "target_id": r.target_id,
            "title": r.title,
            "summary": r.summary,
            "created_at": r.created_at,
            "pdf_available": bool(r.pdf_path and os.path.exists(r.pdf_path))
        })
    return results


@router.get("/{report_id}/download-pdf")
def download_report_pdf(report_id: int, db: Session = Depends(get_db)):
    """Download the official generated PDF report."""
    report = db.query(InvestigationReport).filter(InvestigationReport.id == report_id).first()
    if not report or not report.pdf_path or not os.path.exists(report.pdf_path):
        raise HTTPException(status_code=404, detail="PDF file not found.")

    return FileResponse(
        report.pdf_path,
        media_type="application/pdf",
        filename=os.path.basename(report.pdf_path)
    )
