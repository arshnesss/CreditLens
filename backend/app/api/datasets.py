import os
import shutil
import json
from typing import List, Optional
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from sqlalchemy.orm import Session
import pandas as pd

from backend.app.core.database import get_db
from backend.app.core.config import settings
from backend.app.models.entities import DatasetUpload
from backend.app.ml.dataset import (
    normalize_column_names,
    validate_dataset,
    compute_eda_summary,
    TARGET_COLUMN
)

router = APIRouter(prefix="/datasets", tags=["Dataset Operations"])


@router.post("/upload")
async def upload_dataset(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Upload and validate a credit dataset CSV file.
    Validates schema against standard credit risk feature definitions.
    """
    if not file.filename.endswith(".csv"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only CSV dataset files are supported."
        )

    file_path = os.path.join(settings.DATA_DIR, f"upload_{file.filename}")
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        df = pd.read_csv(file_path)
        df_norm = normalize_column_names(df)
        validation_report = validate_dataset(df_norm)

        default_rate = validation_report.get("target_analysis", {}).get("default_rate")

        record = DatasetUpload(
            filename=file.filename,
            row_count=validation_report["row_count"],
            column_count=validation_report["column_count"],
            target_column=TARGET_COLUMN if validation_report.get("target_analysis") else "Unknown",
            default_rate=default_rate,
            status="validated" if validation_report["is_valid"] else "warning",
            validation_summary=json.dumps(validation_report),
            file_path=file_path
        )
        db.add(record)
        db.commit()
        db.refresh(record)

        return {
            "id": record.id,
            "filename": record.filename,
            "row_count": record.row_count,
            "default_rate": record.default_rate,
            "status": record.status,
            "validation": validation_report
        }
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Failed to process CSV dataset: {str(exc)}"
        )


@router.get("")
def list_datasets(db: Session = Depends(get_db)):
    """List all uploaded datasets and their validation summaries."""
    uploads = db.query(DatasetUpload).order_by(DatasetUpload.created_at.desc()).all()
    results = []
    for u in uploads:
        summary = json.loads(u.validation_summary) if u.validation_summary else {}
        results.append({
            "id": u.id,
            "filename": u.filename,
            "row_count": u.row_count,
            "column_count": u.column_count,
            "target_column": u.target_column,
            "default_rate": u.default_rate,
            "status": u.status,
            "created_at": u.created_at,
            "validation_summary": summary
        })
    return results


@router.get("/{dataset_id}/summary")
def get_dataset_summary(dataset_id: int, db: Session = Depends(get_db)):
    """Retrieve detailed EDA metrics and feature correlation summary."""
    record = db.query(DatasetUpload).filter(DatasetUpload.id == dataset_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Dataset not found.")

    if not record.file_path or not os.path.exists(record.file_path):
        raise HTTPException(status_code=404, detail="Underlying dataset file is not available on disk.")

    df = pd.read_csv(record.file_path)
    df_norm = normalize_column_names(df)
    eda = compute_eda_summary(df_norm)

    return {
        "id": record.id,
        "filename": record.filename,
        "eda_summary": eda
    }
