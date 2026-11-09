import re
import logging
from typing import Dict, Any, List, Optional
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

logger = logging.getLogger("creditlens.agent")


def run_investigation_agent(query: str) -> Dict[str, Any]:
    """
    CreditLens AI Investigation Agent:
    - Parses natural language credit queries
    - Dynamically selects and executes deterministic analytical Python tools
    - Formats actual numerical findings with tool execution transparency
    - Adheres strictly to banking guidelines: never invents data, never approves loans
    """
    q = query.lower().strip()
    tools_used = []
    response_text = ""
    structured_data = {}

    # Extract potential customer IDs (e.g., C1000, C102, C205, etc.)
    customer_ids = re.findall(r"\bc\d+\b", q, flags=re.IGNORECASE)
    customer_ids = [c.upper() for c in customer_ids]

    # Intent 1: Customer Comparison (e.g., "compare customer C1000 and C1002")
    if ("compare" in q or "versus" in q or " vs " in q) and len(customer_ids) >= 2:
        tools_used.append("compare_customers")
        c1, c2 = customer_ids[0], customer_ids[1]
        comp = compare_customers(c1, c2)
        structured_data = comp

        if "error" in comp:
            response_text = comp["error"]
        else:
            cust1 = comp["customer_1"]
            cust2 = comp["customer_2"]
            response_text = (
                f"**Customer Comparison Investigation: {cust1['code']} vs {cust2['code']}**\n\n"
                f"• **{cust1['code']}**: Segment '{cust1['segment']}', Credit Line ${cust1['limit']:,.0f}, "
                f"Repayment Status: {cust1['pay_0']} mo delay. Default Risk: **{cust1['default_probability']}** ({cust1['risk_tier']}).\n"
                f"• **{cust2['code']}**: Segment '{cust2['segment']}', Credit Line ${cust2['limit']:,.0f}, "
                f"Repayment Status: {cust2['pay_0']} mo delay. Default Risk: **{cust2['default_probability']}** ({cust2['risk_tier']}).\n\n"
                f"**Key Analytical Divergences:**\n"
                + "\n".join([f"- {diff}" for diff in comp["key_differences"]])
            )

    # Intent 2: Segment Comparison (e.g., "compare segments Prime Young Professional and Revolving Delinquent")
    elif "segment" in q and ("compare" in q or "highest" in q or "versus" in q or "rate" in q):
        tools_used.append("compare_customer_segments")
        seg1 = "Prime Young Professional"
        seg2 = "Revolving Delinquent"
        if "prime" in q and "entry" in q:
            seg1, seg2 = "Established Prime", "Entry Credit Line"
        elif "retail" in q:
            seg1, seg2 = "Standard Retail", "Revolving Delinquent"

        seg_res = compare_customer_segments(seg1, seg2)
        structured_data = seg_res
        response_text = (
            f"**Customer Segment Risk Differential Analysis**\n\n"
            f"• **{seg1}**: Empirical Default Rate **{seg_res['segment_1']['default_rate']}**, Average Credit Limit {seg_res['segment_1']['avg_limit']} ({seg_res['segment_1']['risk_tier']}).\n"
            f"• **{seg2}**: Empirical Default Rate **{seg_res['segment_2']['default_rate']}**, Average Credit Limit {seg_res['segment_2']['avg_limit']} ({seg_res['segment_2']['risk_tier']}).\n\n"
            f"**Conclusion:** {seg_res['finding']}"
        )

    # Intent 3: Anomaly Detection (e.g., "find unusual patterns", "anomalies")
    elif "anomal" in q or "unusual" in q or "outlier" in q:
        tools_used.append("detect_customer_anomalies")
        anom_res = detect_customer_anomalies(sample_size=100)
        structured_data = anom_res

        if "error" in anom_res:
            response_text = anom_res["error"]
        else:
            response_text = (
                f"**Isolation Forest Unsupervised Anomaly Detection Results**\n\n"
                f"Analyzed {anom_res['sample_analyzed']} customer accounts across multi-dimensional utilization, credit line, and payment vectors.\n"
                f"Identified **{anom_res['anomalies_detected']} anomalous borrower records** exhibiting uncharacteristic risk behavior.\n\n"
                f"**Sample Flagged Outliers:**\n"
            )
            for a in anom_res["anomalous_records"][:3]:
                response_text += f"- **{a['customer_code']}**: Limit ${a['credit_limit']:,.0f}, Balance ${a['bill_amt']:,.0f}, Payment ${a['pay_amt']:,.0f}. Finding: {a['anomaly_reason']}.\n"

    # Intent 4: Generate Report (e.g., "generate report for C1000")
    elif "report" in q and len(customer_ids) >= 1:
        cid = customer_ids[0]
        tools_used.append("generate_risk_report")
        rep = generate_risk_report(cid)
        structured_data = rep

        if "error" in rep:
            response_text = rep["error"]
        else:
            response_text = (
                f"**Risk Audit Report Generated for {cid}**\n\n"
                f"• Title: {rep['title']}\n"
                f"• Summary: {rep['summary']}\n"
                f"• [Download Official Audit PDF]({rep['pdf_download_url']})"
            )

    # Intent 5: Specific Customer Explanation / "Why is C1000 high risk?"
    elif ("why" in q or "explain" in q or "risk" in q or "profile" in q) and len(customer_ids) >= 1:
        cid = customer_ids[0]
        tools_used.extend(["get_customer_profile", "predict_default_risk", "explain_prediction"])
        prof = get_customer_profile(cid)

        if "error" in prof:
            response_text = prof["error"]
        else:
            pred = predict_default_risk(cid)
            shap_exp = explain_prediction(cid)
            structured_data = {"profile": prof, "prediction": pred, "shap": shap_exp}

            response_text = (
                f"**Credit Risk Investigation for {cid} ({prof['segment']})**\n\n"
                f"• **Calibrated Probability of Default (PD)**: **{pred['default_percentage']}** ({pred['risk_category']} Risk Tier).\n"
                f"• **Approved Credit Line**: ${prof['credit_limit']:,.0f} | Recent Balance: ${prof['recent_bill_statement']:,.0f}.\n"
                f"• **Repayment Status (September)**: {prof['recent_repayment_status_pay_0']} month(s) delay.\n\n"
                f"**Key Mathematical SHAP Drivers:**\n"
            )
            for d in shap_exp.get("top_risk_drivers", []):
                response_text += f"- ⚠️ **{d['feature'].upper()}** (SHAP: +{d['shap_value']:.4f}): {d['description']}\n"
            for m in shap_exp.get("top_mitigating_factors", []):
                response_text += f"- ✅ **{m['feature'].upper()}** (SHAP: {m['shap_value']:.4f}): {m['description']}\n"

    # Intent 6: High Risk Summary (e.g. "show high risk customers", "portfolio risk")
    else:
        tools_used.append("get_high_risk_customers")
        hr = get_high_risk_customers(limit=5)
        structured_data = hr

        response_text = (
            f"**High-Risk Customer Portfolio Surveillance**\n\n"
            f"Retrieved top accounts displaying critical repayment arrears and elevated default exposure:\n\n"
        )
        for c in hr["high_risk_customers"]:
            response_text += f"• **{c['customer_code']}** ({c['segment']}): ${c['limit_bal']:,.0f} credit line, **{c['pay_0_delay']}** arrears. Estimated Default Probability: **{c['estimated_pd']}** ({c['risk_tier']}).\n"

        response_text += "\n*Ask me about any specific customer (e.g., 'Why is customer C1000 high risk?'), or compare accounts ('Compare C1000 and C1002').*"

    return {
        "query": query,
        "tools_executed": tools_used,
        "response": response_text,
        "evidence": structured_data,
        "disclaimer": "AI Investigator uses deterministic analytical Python tools. It cannot make lending approvals or alter risk cutoffs."
    }
