import pytest
from backend.app.ml.explainability import (
    explain_customer_prediction,
    get_global_shap_importance
)


def test_explain_customer_prediction():
    customer = {
        "limit_bal": 50000,
        "sex": 1,
        "education": 2,
        "marriage": 1,
        "age": 35,
        "pay_0": 2,  # 2 months delay (strong risk driver)
        "pay_2": 2,
        "pay_3": 0,
        "pay_4": 0,
        "pay_5": 0,
        "pay_6": 0,
        "bill_amt1": 48000,
        "bill_amt2": 45000,
        "bill_amt3": 40000,
        "bill_amt4": 30000,
        "bill_amt5": 20000,
        "bill_amt6": 10000,
        "pay_amt1": 1000,
        "pay_amt2": 1000,
        "pay_amt3": 1000,
        "pay_amt4": 1000,
        "pay_amt5": 1000,
        "pay_amt6": 1000
    }
    explanation = explain_customer_prediction(customer)

    assert "base_value" in explanation
    assert "top_contributions" in explanation
    assert len(explanation["top_contributions"]) > 0

    # Ensure each item contains required keys
    for item in explanation["top_contributions"]:
        assert "feature" in item
        assert "feature_value" in item
        assert "shap_value" in item
        assert item["direction"] in ["increases_risk", "decreases_risk"]
        assert item["impact"] in ["High", "Medium", "Low"]
        assert len(item["description"]) > 10

    # Because customer has pay_0 = 2, it should be among key risk drivers
    risk_driver_features = [d["raw_feature"] for d in explanation["key_risk_drivers"]]
    assert "pay_0" in risk_driver_features

    # Verify disclaimer is present
    assert "disclaimer" in explanation
    assert "causal" in explanation["disclaimer"] or "behavior" in explanation["disclaimer"]


def test_global_shap_importance():
    res = get_global_shap_importance(sample_size=50)
    assert "global_importance" in res
    assert len(res["global_importance"]) > 0
    top = res["global_importance"][0]
    assert "feature" in top
    assert top["importance"] > 0
