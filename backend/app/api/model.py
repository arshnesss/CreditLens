import os
import json
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.app.core.database import get_db
from backend.app.models.entities import ModelVersion
from backend.app.ml.predict import get_model_and_metadata
from backend.app.ml.explainability import get_global_shap_importance
from backend.app.ml.train import train_and_evaluate_pipeline, METADATA_PATH

router = APIRouter(prefix="/model", tags=["Model Operations & Metadata"])


@router.get("/metrics")
def get_active_model_metrics():
    """Retrieve performance metrics, confusion matrix, and calibration scores for active champion model."""
    _, metadata = get_model_and_metadata()
    return metadata


@router.get("/feature-importance")
def get_feature_importance():
    """
    Retrieve both global Tree Gini importance and game-theoretic SHAP mean absolute attributions.
    """
    _, metadata = get_model_and_metadata()
    tree_importances = metadata.get("top_feature_importances", {})
    shap_importances = get_global_shap_importance(sample_size=150)

    return {
        "tree_feature_importance": tree_importances,
        "shap_global_importance": shap_importances.get("global_importance", []),
        "disclaimer": "Feature importances quantify statistical model dependencies, not real-world causation."
    }


@router.get("/versions")
def list_model_versions(db: Session = Depends(get_db)):
    """List registered model versions and benchmark records."""
    versions = db.query(ModelVersion).order_by(ModelVersion.training_date.desc()).all()
    if not versions:
        # Fallback to metadata file version
        _, meta = get_model_and_metadata()
        metrics = meta.get("selected_model_metrics", {})
        return [{
            "id": 1,
            "name": meta.get("algorithm", "Calibrated Random Forest"),
            "version": meta.get("model_version", "v1.0.0"),
            "algorithm": meta.get("algorithm", "Random Forest (Calibrated)"),
            "roc_auc": metrics.get("roc_auc", 0.7744),
            "pr_auc": metrics.get("pr_auc", 0.547),
            "f1_score": metrics.get("f1_score", 0.4761),
            "is_active": True,
            "training_date": meta.get("training_date")
        }]
    return versions


@router.post("/retrain")
def retrain_model(db: Session = Depends(get_db)):
    """Trigger model training and calibration pipeline."""
    try:
        pipeline, meta = train_and_evaluate_pipeline()
        metrics = meta.get("selected_model_metrics", {})

        version_record = ModelVersion(
            name=meta.get("algorithm", "Random Forest (Calibrated)"),
            version=f"v1.{int(datetime.utcnow().timestamp()) % 10000}",
            algorithm=meta.get("algorithm", "Random Forest"),
            roc_auc=metrics.get("roc_auc"),
            pr_auc=metrics.get("pr_auc"),
            f1_score=metrics.get("f1_score"),
            precision=metrics.get("precision"),
            recall=metrics.get("recall"),
            is_active=True,
            artifact_path="models/credit_default_pipeline.joblib",
            metrics_json=json.dumps(metrics)
        )
        db.add(version_record)
        db.commit()
        db.refresh(version_record)

        return {
            "message": "Model retrained and calibrated successfully.",
            "version": version_record.version,
            "metrics": metrics
        }
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Model training failed: {str(exc)}")
