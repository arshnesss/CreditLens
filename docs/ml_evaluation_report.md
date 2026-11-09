# CreditLens AI — Machine Learning Evaluation Report

## 1. Executive Summary & Methodology

CreditLens AI predicts the probability of customer credit default using a supervised machine learning pipeline trained on the benchmark **UCI Default of Credit Card Clients Dataset** (30,000 accounts, 24 input features).

- **Target Variable**: `default_payment_next_month` (Binary: `1` = Default, `0` = Paid in full).
- **Target Distribution**: Non-Default = 77.88% (23,364 accounts), Default = 22.12% (6,636 accounts).
- **Selected Champion Model**: **Random Forest Classifier with Probability Calibration (Sigmoid CalibratedClassifierCV)**.
- **Pipeline Architecture**: Scikit-learn `ColumnTransformer` (StandardScaler for numerical features + OneHotEncoder for categorical features) + Stratified 5-Fold Cross Validation.

---

## 2. Why Accuracy is Insufficient for Credit Risk

In credit risk intelligence, accuracy is a deceptive metric due to **class imbalance**:
- If a model naively predicts `0` (no default) for every customer, it achieves **77.88% accuracy**.
- However, its **Recall for defaults is 0%**, missing all 6,636 defaulters and creating catastrophic write-offs and bad debt for the lending institution.
- In lending, the cost of a **False Negative** (approving a borrower who defaults, losing principal) far exceeds the cost of a **False Positive** (additional verification or declining a non-defaulter).
- Therefore, CreditLens prioritizes **PR-AUC (Precision-Recall Area Under Curve)**, **ROC-AUC**, and **Brier Score (probability calibration accuracy)**.

---

## 3. Model Comparison & Cross-Validation Results

Models were evaluated using Stratified 5-Fold Cross Validation on the training set (24,000 samples) and evaluated on an isolated holdout test set (6,000 samples).

| Metric | Baseline Logistic Regression (Balanced) | Random Forest (Uncalibrated) | **Selected: Random Forest (Calibrated)** |
| :--- | :--- | :--- | :--- |
| **ROC-AUC** | 0.7101 | **0.7760** | **0.7744** |
| **PR-AUC (Avg Precision)** | 0.4911 | **0.5471** | **0.5470** |
| **Precision** | 0.3686 | 0.5013 | **0.6196** |
| **Recall (Sensitivity)** | **0.6323** | 0.6014 | 0.3866 *(at 0.5 cutoff)* |
| **F1-Score** | 0.4657 | **0.5468** | 0.4761 |
| **Brier Score (Calibration)** | 0.2089 | 0.1801 | **0.1368 (Lowest error)** |
| **5-Fold CV ROC-AUC** | 0.7275 | **0.7805** | — |
| **5-Fold CV PR-AUC** | 0.5049 | **0.5530** | — |

---

## 4. Probability Calibration

Raw random forest probability estimates often bunch away from 0 and 1 because tree averaging reduces extreme variance. 
CreditLens applies **Sigmoid Probability Calibration (`CalibratedClassifierCV`)** on 3-fold internal validation splits. 
This reduced the **Brier Score from 0.1801 down to 0.1368**, ensuring that:
- A predicted probability of **30% default** empirically corresponds to approximately **30 defaults out of 100 similar accounts**.

---

## 5. Configurable Risk Categories

To make probabilities actionable for credit analysts without arbitrary binary hard approvals/rejections:
- **Low Risk**: Predicted Default Probability < **20.0%**
- **Medium Risk**: **20.0%** ≤ Predicted Default Probability < **45.0%**
- **High Risk**: Predicted Default Probability ≥ **45.0%**

---

## 6. Top Global Feature Drivers

Delinquency repayment recency (`pay_0`, `pay_2`, `pay_3`) dominates model importance, aligning with credit bureau observations that recent payment delays are the strongest leading indicator of imminent default:

1. `pay_0` (Repayment status in September): **27.83%**
2. `pay_2` (Repayment status in August): **11.20%**
3. `pay_3` (Repayment status in July): **7.80%**
4. `pay_4` (Repayment status in June): **6.24%**
5. `limit_bal` (Amount of given credit): **4.49%**
6. `pay_6` (Repayment status in April): **4.13%**
7. `pay_amt1` (Previous payment in September): **3.89%**
8. `pay_amt2` (Previous payment in August): **3.54%**
9. `pay_5` (Repayment status in May): **3.50%**
10. `pay_amt3` (Previous payment in July): **3.39%**

---

## 7. Known Model Limitations & Educational Disclaimer

1. **Stationary Historical Benchmark**: The dataset reflects Taiwanese credit card accounts from April–October 2005. Economic conditions, inflation, and lending policies have evolved.
2. **Missing Macroeconomic Variables**: The model only analyzes customer-level credit cards; it does not observe macro interest rates, unemployment shifts, or external bureau scores.
3. **Correlation vs. Causation**: Model scores indicate statistical risk association, not individual moral character or causal determinism.
4. **Regulatory & Compliance Note**: This application is strictly an educational sandbox portfolio project and must never be used to make actual legal or banking lending decisions.
