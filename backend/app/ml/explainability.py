import logging
from typing import Dict, Any, List, Union
import numpy as np
import pandas as pd
import shap
from backend.app.ml.predict import get_model_and_metadata
from backend.app.ml.preprocessing import get_feature_names_out
from backend.app.ml.dataset import FEATURE_NAMES

logger = logging.getLogger("creditlens.ml.explainability")

_cached_explainer = None
_cached_rf = None
_cached_preprocessor = None
_cached_feature_names = None

FEATURE_DESCRIPTIONS = {
    "pay_0": "Repayment status in September (most recent month)",
    "pay_2": "Repayment status in August",
    "pay_3": "Repayment status in July",
    "pay_4": "Repayment status in June",
    "pay_5": "Repayment status in May",
    "pay_6": "Repayment status in April",
    "limit_bal": "Total credit limit granted",
    "age": "Borrower age",
    "bill_amt1": "Billed balance in September",
    "bill_amt2": "Billed balance in August",
    "bill_amt3": "Billed balance in July",
    "bill_amt4": "Billed balance in June",
    "bill_amt5": "Billed balance in May",
    "bill_amt6": "Billed balance in April",
    "pay_amt1": "Payment amount in September",
    "pay_amt2": "Payment amount in August",
    "pay_amt3": "Payment amount in July",
    "pay_amt4": "Payment amount in June",
    "pay_amt5": "Payment amount in May",
    "pay_amt6": "Payment amount in April",
    "sex": "Gender",
    "education": "Education level",
    "marriage": "Marital status",
}


def get_explainer():
    """Lazy initialize and cache SHAP TreeExplainer."""
    global _cached_explainer, _cached_rf, _cached_preprocessor, _cached_feature_names
    if _cached_explainer is None:
        model, _ = get_model_and_metadata()
        # Retrieve base Random Forest pipeline from the calibrated wrapper
        base_pipeline = model.calibrated_classifiers_[0].estimator
        _cached_rf = base_pipeline.named_steps["classifier"]
        _cached_preprocessor = base_pipeline.named_steps["preprocessor"]
        _cached_feature_names = get_feature_names_out(_cached_preprocessor)
        _cached_explainer = shap.TreeExplainer(_cached_rf)
        logger.info("Initialized SHAP TreeExplainer on Random Forest estimator.")
    return _cached_explainer, _cached_rf, _cached_preprocessor, _cached_feature_names


def _format_analyst_description(feature: str, val: Any, direction: str, shap_val: float) -> str:
    """Generate clear, non-technical plain English explanations for risk officers."""
    desc = FEATURE_DESCRIPTIONS.get(feature, feature)
    abs_val = abs(shap_val)

    if "pay_0" in feature:
        if val > 0:
            return f"Repayment delay of {int(val)} month(s) in September significantly increases credit default probability."
        elif val == 0:
            return "Revolving credit in good standing in September helps moderate default risk."
        else:
            return "Timely advance payment in September reduces estimated default risk."

    if "pay_" in feature:
        if val > 0:
            return f"Past delinquency of {int(val)} month(s) contributes upward pressure to default probability."
        else:
            return f"Consistent historical repayment behavior contributes positively to creditworthiness."

    if "limit_bal" in feature:
        if direction == "increases_risk":
            return f"Credit limit of ${val:,.0f} relative to payment capacity slightly increases exposure risk."
        else:
            return f"Established credit line of ${val:,.0f} reflects institutional credit history and decreases risk."

    if "pay_amt" in feature:
        if direction == "decreases_risk":
            return f"Recent payment of ${val:,.0f} shows active liquidity and lowers predicted risk."
        else:
            return f"Low repayment amount of ${val:,.0f} indicates potential debt accumulation."

    if "bill_amt" in feature:
        if direction == "increases_risk":
            return f"Outstanding balance of ${val:,.0f} elevates revolving debt burden."
        else:
            return f"Conservative balance utilization of ${val:,.0f} keeps risk subdued."

    direction_text = "increases" if direction == "increases_risk" else "decreases"
    return f"{desc} (value: {val}) {direction_text} credit default probability."


def explain_customer_prediction(
    customer_data: Union[Dict[str, Any], pd.DataFrame],
    top_n: int = 8
) -> Dict[str, Any]:
    """
    Generate mathematically exact SHAP explanations for an individual customer.
    Derived directly from SHAP TreeExplainer game-theoretic Shapley values.
    """
    explainer, rf, preprocessor, feature_names = get_explainer()

    # Normalize customer dictionary to DataFrame
    if isinstance(customer_data, dict):
        clean_input = {}
        for k, v in customer_data.items():
            clean_key = k.lower().replace(" ", "_").replace(".", "_")
            if clean_key == "pay_1":
                clean_key = "pay_0"
            clean_input[clean_key] = v

        row = {f: [clean_input.get(f, 0)] for f in FEATURE_NAMES}
        df_input = pd.DataFrame(row)
    else:
        df_input = customer_data[FEATURE_NAMES].copy()

    # Preprocess customer record
    X_trans = preprocessor.transform(df_input)

    # Compute raw SHAP values: shape (1, n_features, 2) or (1, n_features)
    shap_vals = explainer.shap_values(X_trans)

    # For binary classification: index 1 represents probability of default
    if isinstance(shap_vals, list):
        # Multi-class list format: [class 0, class 1]
        shap_default = shap_vals[1][0]
    elif len(shap_vals.shape) == 3:
        # Array shape: (n_samples, n_features, 2)
        shap_default = shap_vals[0, :, 1]
    else:
        shap_default = shap_vals[0]

    # Expected value (base value)
    base_val = explainer.expected_value
    if isinstance(base_val, (list, np.ndarray)):
        base_val = float(base_val[1] if len(base_val) > 1 else base_val[0])
    else:
        base_val = float(base_val)

    # Reconcile one-hot encoded features back to original feature groups for clarity
    contributions = []
    for i, col_name in enumerate(feature_names):
        val_shap = float(shap_default[i])
        abs_shap = abs(val_shap)

        # Map back to raw feature and raw value
        raw_feature = col_name.split("_")[0] if ("sex_" in col_name or "education_" in col_name or "marriage_" in col_name) else col_name
        raw_val = df_input[raw_feature].iloc[0] if raw_feature in df_input.columns else 0
        if hasattr(raw_val, "item"):
            raw_val = raw_val.item()

        direction = "increases_risk" if val_shap > 0 else "decreases_risk"
        impact = "High" if abs_shap >= 0.05 else ("Medium" if abs_shap >= 0.02 else "Low")

        contributions.append({
            "feature": col_name,
            "raw_feature": raw_feature,
            "feature_value": raw_val,
            "shap_value": round(val_shap, 4),
            "abs_shap_value": round(abs_shap, 4),
            "direction": direction,
            "impact": impact,
            "description": _format_analyst_description(raw_feature, raw_val, direction, val_shap)
        })

    # Sort all contributions by absolute impact
    contributions.sort(key=lambda x: x["abs_shap_value"], reverse=True)

    top_drivers = contributions[:top_n]
    increasing_factors = [c for c in contributions if c["direction"] == "increases_risk"][:4]
    decreasing_factors = [c for c in contributions if c["direction"] == "decreases_risk"][:4]

    return {
        "base_value": round(base_val, 4),
        "total_impact": round(float(np.sum(shap_default)), 4),
        "top_contributions": top_drivers,
        "key_risk_drivers": increasing_factors,
        "key_mitigating_factors": decreasing_factors,
        "all_contributions": contributions,
        "disclaimer": "SHAP feature attributions describe the internal statistical weightings of the model. They represent model behavior, not causal proof."
    }


def get_global_shap_importance(sample_size: int = 250) -> Dict[str, Any]:
    """
    Calculate global feature importance across a sample of benchmark records
    using mean absolute SHAP values.
    """
    from backend.app.ml.dataset import load_credit_dataset
    explainer, _, preprocessor, feature_names = get_explainer()

    df = load_credit_dataset("data/default_of_credit_card_clients_sample.csv")
    X = df[FEATURE_NAMES].iloc[:sample_size]
    X_trans = preprocessor.transform(X)

    shap_vals = explainer.shap_values(X_trans)
    if isinstance(shap_vals, list):
        shap_default = shap_vals[1]
    elif len(shap_vals.shape) == 3:
        shap_default = shap_vals[:, :, 1]
    else:
        shap_default = shap_vals

    mean_abs_shap = np.mean(np.abs(shap_default), axis=0)

    importance_list = []
    for name, imp in zip(feature_names, mean_abs_shap):
        importance_list.append({
            "feature": name,
            "importance": round(float(imp), 4),
            "description": FEATURE_DESCRIPTIONS.get(name.split("_")[0], name)
        })

    importance_list.sort(key=lambda x: x["importance"], reverse=True)

    return {
        "global_importance": importance_list[:15],
        "sample_size": sample_size,
        "metric": "mean(|SHAP value|) on positive default class"
    }
