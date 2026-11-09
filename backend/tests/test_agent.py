import pytest
from backend.app.agent.tools import (
    get_customer_profile,
    predict_default_risk,
    explain_prediction,
    compare_customers,
    compare_customer_segments,
    get_high_risk_customers,
    detect_customer_anomalies,
    generate_risk_report
)
from backend.app.agent.investigator import run_investigation_agent


def test_agent_get_customer_profile():
    res = get_customer_profile("C1000")
    assert "customer_code" in res
    assert res["customer_code"] == "C1000"
    assert "credit_limit" in res


def test_agent_predict_and_explain():
    pred = predict_default_risk("C1000")
    assert "default_probability" in pred
    assert pred["risk_category"] in ["Low", "Medium", "High"]

    exp = explain_prediction("C1000")
    assert "top_risk_drivers" in exp
    assert "disclaimer" in exp


def test_agent_compare_customers():
    comp = compare_customers("C1000", "C1001")
    assert "comparison_summary" in comp
    assert "customer_1" in comp
    assert "customer_2" in comp
    assert len(comp["key_differences"]) > 0


def test_agent_segment_comparison():
    seg = compare_customer_segments("Prime Young Professional", "Revolving Delinquent")
    assert "segment_1" in seg
    assert "segment_2" in seg
    assert "finding" in seg


def test_agent_anomalies_and_high_risk():
    hr = get_high_risk_customers(limit=3)
    assert "high_risk_customers" in hr

    anom = detect_customer_anomalies(sample_size=30)
    assert "anomalies_detected" in anom


def test_run_investigation_agent_end_to_end():
    query = "Why is customer C1000 classified as high risk?"
    agent_output = run_investigation_agent(query)
    assert "tools_executed" in agent_output
    assert len(agent_output["tools_executed"]) > 0
    assert "response" in agent_output
    assert "C1000" in agent_output["response"]
