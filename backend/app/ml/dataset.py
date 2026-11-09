import os
import io
import urllib.request
import zipfile
import logging
from typing import Dict, Any, Tuple
import pandas as pd
import numpy as np

logger = logging.getLogger("creditlens.ml.dataset")

# Expected standard schema definitions
UCI_ZIP_URL = "https://archive.ics.uci.edu/static/public/350/default+of+credit+card+clients.zip"
TARGET_COLUMN = "default_payment_next_month"

FEATURE_NAMES = [
    "limit_bal", "sex", "education", "marriage", "age",
    "pay_0", "pay_2", "pay_3", "pay_4", "pay_5", "pay_6",
    "bill_amt1", "bill_amt2", "bill_amt3", "bill_amt4", "bill_amt5", "bill_amt6",
    "pay_amt1", "pay_amt2", "pay_amt3", "pay_amt4", "pay_amt5", "pay_amt6"
]

CATEGORICAL_FEATURES = ["sex", "education", "marriage"]
NUMERICAL_FEATURES = [
    "limit_bal", "age",
    "pay_0", "pay_2", "pay_3", "pay_4", "pay_5", "pay_6",
    "bill_amt1", "bill_amt2", "bill_amt3", "bill_amt4", "bill_amt5", "bill_amt6",
    "pay_amt1", "pay_amt2", "pay_amt3", "pay_amt4", "pay_amt5", "pay_amt6"
]


def normalize_column_names(df: pd.DataFrame) -> pd.DataFrame:
    """
    Standardize UCI credit dataset column names:
    - Lowercase, strip whitespace, replace spaces/dots with underscores.
    - Standardize 'pay_1' -> 'pay_0' (UCI dataset uses PAY_0 or PAY_1 for September payment).
    - Map target variants to 'default_payment_next_month'.
    """
    df = df.copy()
    cleaned_cols = {}
    for col in df.columns:
        clean = str(col).strip().lower().replace(" ", "_").replace(".", "_")
        if clean in ["default_payment_next_month", "default", "default_payment", "y"]:
            clean = TARGET_COLUMN
        elif clean == "pay_1":
            clean = "pay_0"
        cleaned_cols[col] = clean

    df.rename(columns=cleaned_cols, inplace=True)
    if "id" in df.columns:
        df.drop(columns=["id"], inplace=True)
    return df


def download_uci_dataset(dest_path: str = "data/default_of_credit_card_clients.csv") -> str:
    """Download official UCI Credit Card Default dataset and persist as clean CSV."""
    os.makedirs(os.path.dirname(dest_path), exist_ok=True)
    if os.path.exists(dest_path):
        logger.info(f"Dataset already exists at {dest_path}")
        return dest_path

    logger.info(f"Downloading benchmark dataset from {UCI_ZIP_URL}...")
    req = urllib.request.Request(UCI_ZIP_URL, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=30) as resp:
        zip_data = resp.read()

    with zipfile.ZipFile(io.BytesIO(zip_data)) as z:
        for name in z.namelist():
            if name.endswith(".xls") or name.endswith(".xlsx"):
                with z.open(name) as f:
                    df = pd.read_excel(f, header=1)
                    df = normalize_column_names(df)
                    df.to_csv(dest_path, index=False)
                    logger.info(f"Saved dataset to {dest_path} ({df.shape[0]} rows)")
                    return dest_path

    raise RuntimeError("Could not find Excel file in downloaded UCI zip.")


def load_credit_dataset(file_path: str = "data/default_of_credit_card_clients.csv") -> pd.DataFrame:
    """Load and normalize credit dataset from disk."""
    if not os.path.exists(file_path):
        # Fallback to sample if available, or download
        sample_path = "data/default_of_credit_card_clients_sample.csv"
        if os.path.exists(sample_path):
            file_path = sample_path
        else:
            file_path = download_uci_dataset(file_path)

    df = pd.read_csv(file_path)
    return normalize_column_names(df)


def validate_dataset(df: pd.DataFrame) -> Dict[str, Any]:
    """
    Perform rigorous dataset validation:
    1. Check missing values.
    2. Check duplicates.
    3. Verify target column presence and binary distribution.
    4. Check required features.
    """
    total_rows = len(df)
    missing_counts = df.isnull().sum().to_dict()
    total_missing = sum(missing_counts.values())
    duplicate_rows = int(df.duplicated().sum())

    missing_features = [f for f in FEATURE_NAMES if f not in df.columns]
    has_target = TARGET_COLUMN in df.columns

    target_stats = {}
    if has_target:
        counts = df[TARGET_COLUMN].value_counts().to_dict()
        default_rate = float(df[TARGET_COLUMN].mean())
        target_stats = {
            "counts": counts,
            "default_rate": round(default_rate, 4),
            "is_binary": set(df[TARGET_COLUMN].unique()).issubset({0, 1}),
            "class_imbalance_ratio": round(counts.get(0, 0) / max(counts.get(1, 1), 1), 2)
        }

    is_valid = (
        len(missing_features) == 0 and
        has_target and
        target_stats.get("is_binary", False) and
        total_rows > 10
    )

    return {
        "is_valid": is_valid,
        "row_count": total_rows,
        "column_count": df.shape[1],
        "total_missing_values": int(total_missing),
        "missing_by_column": {k: int(v) for k, v in missing_counts.items() if v > 0},
        "duplicate_rows": duplicate_rows,
        "missing_required_features": missing_features,
        "target_analysis": target_stats,
    }


def compute_eda_summary(df: pd.DataFrame) -> Dict[str, Any]:
    """
    Generate Exploratory Data Analysis metrics:
    - Numerical distributions (mean, std, quartiles)
    - Categorical frequency tables
    - Correlation of features with the target variable
    """
    validation = validate_dataset(df)
    numeric_cols = [c for c in NUMERICAL_FEATURES if c in df.columns]

    # Compute correlations with target
    correlations = {}
    if TARGET_COLUMN in df.columns:
        corr_series = df[numeric_cols + [TARGET_COLUMN]].corr()[TARGET_COLUMN].drop(TARGET_COLUMN)
        correlations = {
            feature: round(float(val), 4)
            for feature, val in corr_series.sort_values(ascending=False).items()
            if not np.isnan(val)
        }

    # Descriptive summary for key financial variables
    describe_dict = {}
    for col in ["limit_bal", "age", "bill_amt1", "pay_amt1", "pay_0"]:
        if col in df.columns:
            describe_dict[col] = {
                "mean": round(float(df[col].mean()), 2),
                "std": round(float(df[col].std()), 2),
                "median": round(float(df[col].median()), 2),
                "min": round(float(df[col].min()), 2),
                "max": round(float(df[col].max()), 2),
            }

    return {
        "validation": validation,
        "correlations_with_default": correlations,
        "key_feature_distributions": describe_dict,
        "target_distribution": validation.get("target_analysis", {})
    }
