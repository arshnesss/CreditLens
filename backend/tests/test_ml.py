import pytest
import pandas as pd
import numpy as np
from backend.app.ml.dataset import (
    normalize_column_names,
    validate_dataset,
    compute_eda_summary,
    FEATURE_NAMES,
    TARGET_COLUMN
)
from backend.app.ml.preprocessing import (
    build_preprocessor,
    prepare_stratified_split,
    get_feature_names_out
)
from backend.app.ml.predict import (
    predict_credit_risk,
    classify_risk_category
)


@pytest.fixture
def sample_credit_df():
    """Generates synthetic credit dataset matching UCI schema for isolated unit testing."""
    np.random.seed(42)
    n = 100
    data = {
        "LIMIT_BAL": np.random.randint(10000, 500000, size=n),
        "SEX": np.random.choice([1, 2], size=n),
        "EDUCATION": np.random.choice([1, 2, 3, 4], size=n),
        "MARRIAGE": np.random.choice([1, 2, 3], size=n),
        "AGE": np.random.randint(21, 65, size=n),
        "PAY_0": np.random.choice([-1, 0, 1, 2], size=n),
        "PAY_2": np.random.choice([-1, 0, 1], size=n),
        "PAY_3": np.random.choice([-1, 0], size=n),
        "PAY_4": np.random.choice([-1, 0], size=n),
        "PAY_5": np.random.choice([-1, 0], size=n),
        "PAY_6": np.random.choice([-1, 0], size=n),
        "BILL_AMT1": np.random.randint(0, 50000, size=n),
        "BILL_AMT2": np.random.randint(0, 50000, size=n),
        "BILL_AMT3": np.random.randint(0, 50000, size=n),
        "BILL_AMT4": np.random.randint(0, 50000, size=n),
        "BILL_AMT5": np.random.randint(0, 50000, size=n),
        "BILL_AMT6": np.random.randint(0, 50000, size=n),
        "PAY_AMT1": np.random.randint(0, 5000, size=n),
        "PAY_AMT2": np.random.randint(0, 5000, size=n),
        "PAY_AMT3": np.random.randint(0, 5000, size=n),
        "PAY_AMT4": np.random.randint(0, 5000, size=n),
        "PAY_AMT5": np.random.randint(0, 5000, size=n),
        "PAY_AMT6": np.random.randint(0, 5000, size=n),
        "default payment next month": np.random.choice([0, 1], size=n, p=[0.78, 0.22])
    }
    return pd.DataFrame(data)


def test_normalize_column_names(sample_credit_df):
    normalized = normalize_column_names(sample_credit_df)
    assert TARGET_COLUMN in normalized.columns
    assert "pay_0" in normalized.columns
    assert "limit_bal" in normalized.columns
    assert "default payment next month" not in normalized.columns


def test_validate_dataset(sample_credit_df):
    normalized = normalize_column_names(sample_credit_df)
    val = validate_dataset(normalized)
    assert val["is_valid"] is True
    assert val["row_count"] == 100
    assert val["total_missing_values"] == 0
    assert val["target_analysis"]["is_binary"] is True


def test_stratified_split(sample_credit_df):
    normalized = normalize_column_names(sample_credit_df)
    X_train, X_test, y_train, y_test = prepare_stratified_split(normalized, test_size=0.20, random_state=42)
    assert len(X_train) == 80
    assert len(X_test) == 20
    # Stratification ensures default rates are very close
    train_rate = y_train.mean()
    test_rate = y_test.mean()
    assert abs(train_rate - test_rate) < 0.15


def test_preprocessor_fit_transform(sample_credit_df):
    normalized = normalize_column_names(sample_credit_df)
    X = normalized[FEATURE_NAMES]
    preprocessor = build_preprocessor()
    X_trans = preprocessor.fit_transform(X)
    assert X_trans.shape[0] == 100
    feature_names = get_feature_names_out(preprocessor)
    assert len(feature_names) == X_trans.shape[1]


def test_risk_category_thresholds():
    assert classify_risk_category(0.05) == "Low"
    assert classify_risk_category(0.199) == "Low"
    assert classify_risk_category(0.20) == "Medium"
    assert classify_risk_category(0.449) == "Medium"
    assert classify_risk_category(0.45) == "High"
    assert classify_risk_category(0.85) == "High"


def test_prediction_output():
    customer = {
        "limit_bal": 200000,
        "sex": 1,
        "education": 1,
        "marriage": 2,
        "age": 30,
        "pay_0": 0,
        "pay_2": 0,
        "pay_3": 0,
        "pay_4": 0,
        "pay_5": 0,
        "pay_6": 0,
        "bill_amt1": 15000,
        "bill_amt2": 14000,
        "bill_amt3": 13000,
        "bill_amt4": 12000,
        "bill_amt5": 11000,
        "bill_amt6": 10000,
        "pay_amt1": 2000,
        "pay_amt2": 2000,
        "pay_amt3": 2000,
        "pay_amt4": 2000,
        "pay_amt5": 2000,
        "pay_amt6": 2000
    }
    result = predict_credit_risk(customer)
    assert "default_probability" in result
    assert 0.0 <= result["default_probability"] <= 1.0
    assert result["risk_category"] in ["Low", "Medium", "High"]
    assert "disclaimer" in result
