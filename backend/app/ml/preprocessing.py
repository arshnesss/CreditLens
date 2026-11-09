import logging
from typing import Tuple, List
import pandas as pd
import numpy as np
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.model_selection import train_test_split
from backend.app.ml.dataset import (
    FEATURE_NAMES,
    CATEGORICAL_FEATURES,
    NUMERICAL_FEATURES,
    TARGET_COLUMN
)

logger = logging.getLogger("creditlens.ml.preprocessing")


def build_preprocessor() -> ColumnTransformer:
    """
    Build Scikit-learn ColumnTransformer:
    - Categorical: OneHotEncoder with handle_unknown='ignore'
    - Numerical: StandardScaler
    """
    numeric_transformer = StandardScaler()
    categorical_transformer = OneHotEncoder(handle_unknown="ignore", sparse_output=False)

    preprocessor = ColumnTransformer(
        transformers=[
            ("num", numeric_transformer, NUMERICAL_FEATURES),
            ("cat", categorical_transformer, CATEGORICAL_FEATURES),
        ],
        remainder="drop",
        verbose_feature_names_out=False
    )
    return preprocessor


def get_feature_names_out(preprocessor: ColumnTransformer) -> List[str]:
    """Retrieve output feature names from fitted ColumnTransformer."""
    try:
        return list(preprocessor.get_feature_names_out())
    except Exception:
        # Fallback if get_feature_names_out is unavailable
        cat_encoder = preprocessor.named_transformers_["cat"]
        cat_cols = cat_encoder.get_feature_names_out(CATEGORICAL_FEATURES).tolist()
        return NUMERICAL_FEATURES + cat_cols


def prepare_stratified_split(
    df: pd.DataFrame,
    test_size: float = 0.20,
    random_state: int = 42
) -> Tuple[pd.DataFrame, pd.DataFrame, pd.Series, pd.Series]:
    """
    Perform stratified train/test split.
    Guarantees that the ~22.1% default rate is equally distributed across
    both training and testing partitions, preventing sample distribution skew.
    """
    if TARGET_COLUMN not in df.columns:
        raise ValueError(f"Target column '{TARGET_COLUMN}' missing from dataframe.")

    X = df[FEATURE_NAMES].copy()
    y = df[TARGET_COLUMN].copy()

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=test_size,
        random_state=random_state,
        stratify=y  # Essential for imbalanced default rate
    )

    logger.info(
        f"Stratified Split: Train={len(X_train)} (Default Rate={y_train.mean():.4f}), "
        f"Test={len(X_test)} (Default Rate={y_test.mean():.4f})"
    )

    return X_train, X_test, y_train, y_test
