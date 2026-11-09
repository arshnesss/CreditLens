import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)


def test_seed_and_list_customers():
    # Seed 10 benchmark customers
    seed_resp = client.post("/api/customers/seed-benchmark?count=10")
    assert seed_resp.status_code == 200
    seed_data = seed_resp.json()
    assert "total_customers" in seed_data
    assert seed_data["total_customers"] >= 10

    # List customers
    list_resp = client.get("/api/customers?page=1&limit=5")
    assert list_resp.status_code == 200
    data = list_resp.json()
    assert data["total"] >= 10
    assert len(data["items"]) == 5
    first_customer = data["items"][0]
    assert "customer_code" in first_customer
    assert "limit_bal" in first_customer


def test_get_customer_detail_and_history():
    # Get by code C1000
    resp = client.get("/api/customers/C1000")
    assert resp.status_code == 200
    data = resp.json()
    assert data["customer_code"] == "C1000"

    # Get history
    hist_resp = client.get("/api/customers/C1000/history")
    assert hist_resp.status_code == 200
    hist_data = hist_resp.json()
    assert "history" in hist_data


def test_predict_endpoint_with_shap():
    payload = {
        "customer_code": "C1000",
        "limit_bal": 120000,
        "sex": 2,
        "education": 2,
        "marriage": 1,
        "age": 28,
        "pay_0": 0,
        "pay_2": 0,
        "pay_3": 0,
        "pay_4": 0,
        "pay_5": 0,
        "pay_6": 0,
        "bill_amt1": 50000,
        "bill_amt2": 45000,
        "bill_amt3": 40000,
        "bill_amt4": 35000,
        "bill_amt5": 30000,
        "bill_amt6": 25000,
        "pay_amt1": 5000,
        "pay_amt2": 5000,
        "pay_amt3": 5000,
        "pay_amt4": 5000,
        "pay_amt5": 5000,
        "pay_amt6": 5000
    }
    resp = client.post("/api/predictions/predict", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert "default_probability" in data
    assert 0.0 <= data["default_probability"] <= 1.0
    assert data["risk_category"] in ["Low", "Medium", "High"]
    assert len(data["shap_contributions"]) > 0
    assert "disclaimer" in data


def test_model_metrics_and_feature_importance():
    metrics_resp = client.get("/api/model/metrics")
    assert metrics_resp.status_code == 200
    metrics = metrics_resp.json()
    assert "roc_auc" in metrics["selected_model_metrics"]
    assert metrics["selected_model_metrics"]["roc_auc"] > 0.70

    imp_resp = client.get("/api/model/feature-importance")
    assert imp_resp.status_code == 200
    imp_data = imp_resp.json()
    assert "tree_feature_importance" in imp_data
    assert "shap_global_importance" in imp_data


def test_portfolio_analytics():
    overview_resp = client.get("/api/analytics/overview")
    assert overview_resp.status_code == 200
    overview = overview_resp.json()
    assert "total_customers" in overview
    assert "risk_distribution" in overview

    dist_resp = client.get("/api/analytics/risk-distribution")
    assert dist_resp.status_code == 200

    segments_resp = client.get("/api/analytics/segments")
    assert segments_resp.status_code == 200
    segments = segments_resp.json()
    assert len(segments) > 0


def test_generate_report():
    report_payload = {
        "report_type": "customer",
        "target_id": "C1000",
        "notes": "Automated integration test assessment."
    }
    resp = client.post("/api/reports/generate", json=report_payload)
    assert resp.status_code == 201
    report = resp.json()
    assert report["report_type"] == "customer"
    assert report["target_id"] == "C1000"
    assert "content" in report

    list_resp = client.get("/api/reports")
    assert list_resp.status_code == 200
    assert len(list_resp.json()) > 0
