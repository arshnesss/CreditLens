# CreditLens AI — Agent Workflow & Guardrails

```mermaid
flowchart TD
    UserQuery["Analyst Natural Language Query"] --> AgentRouter["Agent Intent Classifier"]

    AgentRouter -->|"Customer Investigation"| Tool_Profile["get_customer_profile()"]
    AgentRouter -->|"Probability Scoring"| Tool_Pred["predict_default_risk()"]
    AgentRouter -->|"Feature Attributions"| Tool_SHAP["explain_prediction()"]
    AgentRouter -->|"Borrower Comparison"| Tool_CompCust["compare_customers()"]
    AgentRouter -->|"Segment Analytics"| Tool_CompSeg["compare_customer_segments()"]
    AgentRouter -->|"Outlier Detection"| Tool_Anom["detect_customer_anomalies()"]
    AgentRouter -->|"Report Generation"| Tool_Report["generate_risk_report()"]

    Tool_Profile --> ExecutionTrace["Deterministic Analytical Tool Execution"]
    Tool_Pred --> ExecutionTrace
    Tool_SHAP --> ExecutionTrace
    Tool_CompCust --> ExecutionTrace
    Tool_CompSeg --> ExecutionTrace
    Tool_Anom --> ExecutionTrace
    Tool_Report --> ExecutionTrace

    ExecutionTrace --> Synthesizer["Evidence Synthesis & Transparency Layer"]
    Synthesizer --> Guardrails["Compliance & Non-Hallucination Guardrails"]
    Guardrails --> Output["Structured Response with Tools Logged"]
```

---

## 🛡️ Core Banking Safety Boundaries

1. **Zero Hallucination Policy**: All metrics, credit lines, delinquency counts, and probabilities are retrieved strictly from deterministic Python tools.
2. **Read-Only / Decision Support**: The agent cannot approve or deny loan applications. It is strictly an investigatory assistant for risk officers.
3. **No Parameter Alteration**: The agent has zero write access to risk cutoff thresholds or model weights.
4. **Tool Execution Transparency**: Every response explicitly displays which deterministic backend functions were executed (`tools_executed`).
