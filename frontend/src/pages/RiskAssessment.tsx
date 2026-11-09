import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Header } from '../components/Header';
import {
  ShieldAlert,
  Send,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Info,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sliders
} from 'lucide-react';
import { predictRisk, PredictionResult } from '../api/client';

export const RiskAssessment: React.FC = () => {
  const location = useLocation();
  const prefill = location.state?.prefillCustomer;

  // Form state
  const [formData, setFormData] = useState({
    customer_code: 'C_EVAL_101',
    limit_bal: 150000,
    sex: 1,
    education: 2,
    marriage: 1,
    age: 32,
    pay_0: 0,
    pay_2: 0,
    pay_3: 0,
    pay_4: 0,
    pay_5: 0,
    pay_6: 0,
    bill_amt1: 35000,
    bill_amt2: 32000,
    bill_amt3: 28000,
    bill_amt4: 25000,
    bill_amt5: 20000,
    bill_amt6: 15000,
    pay_amt1: 4000,
    pay_amt2: 3500,
    pay_amt3: 3000,
    pay_amt4: 2500,
    pay_amt5: 2000,
    pay_amt6: 2000,
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);

  useEffect(() => {
    if (prefill) {
      setFormData(prev => ({
        ...prev,
        customer_code: prefill.customer_code,
        limit_bal: prefill.limit_bal,
        sex: prefill.sex,
        education: prefill.education,
        marriage: prefill.marriage,
        age: prefill.age,
        pay_0: prefill.pay_0,
        bill_amt1: prefill.bill_amt1,
        pay_amt1: prefill.pay_amt1,
      }));
    }
  }, [prefill]);

  // Scenario Presets
  const applyPreset = (preset: 'low' | 'medium' | 'high') => {
    if (preset === 'low') {
      setFormData({
        customer_code: 'PRESET_LOW_RISK',
        limit_bal: 300000,
        sex: 2,
        education: 1,
        marriage: 2,
        age: 35,
        pay_0: -1,
        pay_2: -1,
        pay_3: -1,
        pay_4: -1,
        pay_5: -1,
        pay_6: -1,
        bill_amt1: 15000,
        bill_amt2: 12000,
        bill_amt3: 10000,
        bill_amt4: 8000,
        bill_amt5: 5000,
        bill_amt6: 4000,
        pay_amt1: 15000,
        pay_amt2: 12000,
        pay_amt3: 10000,
        pay_amt4: 8000,
        pay_amt5: 5000,
        pay_amt6: 4000,
      });
    } else if (preset === 'medium') {
      setFormData({
        customer_code: 'PRESET_MED_RISK',
        limit_bal: 120000,
        sex: 1,
        education: 2,
        marriage: 1,
        age: 29,
        pay_0: 1,
        pay_2: 0,
        pay_3: 0,
        pay_4: 0,
        pay_5: 0,
        pay_6: 0,
        bill_amt1: 65000,
        bill_amt2: 60000,
        bill_amt3: 58000,
        bill_amt4: 55000,
        bill_amt5: 50000,
        bill_amt6: 48000,
        pay_amt1: 3000,
        pay_amt2: 3000,
        pay_amt3: 3000,
        pay_amt4: 2500,
        pay_amt5: 2500,
        pay_amt6: 2500,
      });
    } else {
      setFormData({
        customer_code: 'PRESET_HIGH_RISK',
        limit_bal: 40000,
        sex: 1,
        education: 3,
        marriage: 2,
        age: 26,
        pay_0: 2,
        pay_2: 2,
        pay_3: 1,
        pay_4: 0,
        pay_5: 0,
        pay_6: 0,
        bill_amt1: 39500,
        bill_amt2: 39000,
        bill_amt3: 38500,
        bill_amt4: 37000,
        bill_amt5: 36000,
        bill_amt6: 35000,
        pay_amt1: 500,
        pay_amt2: 500,
        pay_amt3: 500,
        pay_amt4: 500,
        pay_amt5: 500,
        pay_amt6: 500,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const pred = await predictRisk(formData);
      setResult(pred);
    } catch (err) {
      console.error('Prediction failed', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full flex flex-col bg-slate-50">
      <Header
        title="Credit Risk Assessment & Explainable AI"
        subtitle="Individual customer scoring, calibrated default probabilities, and mathematical SHAP attributions"
      />

      <div className="p-8 space-y-6 flex-1 max-w-7xl mx-auto w-full">
        {/* Preset Selector Bar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
            <Sliders className="h-4 w-4 text-blue-600" />
            <span>Load Diagnostic Scenario:</span>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => applyPreset('low')}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors"
            >
              Prime Borrower (Low Risk)
            </button>
            <button
              type="button"
              onClick={() => applyPreset('medium')}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-colors"
            >
              Revolving Account (Medium Risk)
            </button>
            <button
              type="button"
              onClick={() => applyPreset('high')}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition-colors"
            >
              Delinquent Credit (High Risk)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Input Form Column (7 cols) */}
          <div className="lg:col-span-7 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-4">
              Borrower Financial & Repayment Parameters
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Customer Identifier</label>
                  <input
                    type="text"
                    value={formData.customer_code}
                    onChange={e => setFormData({ ...formData, customer_code: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Credit Limit ($)</label>
                  <input
                    type="number"
                    value={formData.limit_bal}
                    onChange={e => setFormData({ ...formData, limit_bal: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:border-blue-500 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Age</label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={e => setFormData({ ...formData, age: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Education</label>
                  <select
                    value={formData.education}
                    onChange={e => setFormData({ ...formData, education: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:border-blue-500"
                  >
                    <option value={1}>Graduate School</option>
                    <option value={2}>University</option>
                    <option value={3}>High School</option>
                    <option value={4}>Others</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Marital Status</label>
                  <select
                    value={formData.marriage}
                    onChange={e => setFormData({ ...formData, marriage: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:border-blue-500"
                  >
                    <option value={1}>Married</option>
                    <option value={2}>Single</option>
                    <option value={3}>Others</option>
                  </select>
                </div>
              </div>

              {/* Repayment History Inputs */}
              <div className="pt-2">
                <span className="font-semibold text-slate-800 block mb-2">
                  Repayment Status History (PAY_0 to PAY_6)
                </span>
                <p className="text-[11px] text-slate-400 mb-2">
                  -1 = paid in full, 0 = revolving credit, 1 = 1 month delay, 2 = 2 months delay, etc.
                </p>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {[
                    { key: 'pay_0', label: 'Sep (PAY 0)' },
                    { key: 'pay_2', label: 'Aug (PAY 2)' },
                    { key: 'pay_3', label: 'Jul (PAY 3)' },
                    { key: 'pay_4', label: 'Jun (PAY 4)' },
                    { key: 'pay_5', label: 'May (PAY 5)' },
                    { key: 'pay_6', label: 'Apr (PAY 6)' },
                  ].map(item => (
                    <div key={item.key}>
                      <span className="text-[10px] text-slate-500 block mb-1">{item.label}</span>
                      <input
                        type="number"
                        value={(formData as any)[item.key]}
                        onChange={e => setFormData({ ...formData, [item.key]: Number(e.target.value) })}
                        className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded text-center font-bold"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Bill vs Pay Amount summary */}
              <div className="pt-2 grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Recent Bill Statement ($)</label>
                  <input
                    type="number"
                    value={formData.bill_amt1}
                    onChange={e => setFormData({ ...formData, bill_amt1: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Recent Payment Amount ($)</label>
                  <input
                    type="number"
                    value={formData.pay_amt1}
                    onChange={e => setFormData({ ...formData, pay_amt1: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors shadow-md flex items-center justify-center gap-2 text-xs"
                >
                  <Send className="h-4 w-4" />
                  {loading ? 'Evaluating Model & SHAP Values...' : 'Compute Calibrated Risk & SHAP Explanation'}
                </button>
              </div>
            </form>
          </div>

          {/* Results & SHAP Waterfall Column (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            {result ? (
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5">
                {/* Score & Risk Tier Banner */}
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                      Assessment Outcome
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {result.model_version}
                    </span>
                  </div>

                  <div className="mt-3 p-4 rounded-xl flex items-center justify-between border"
                    style={{
                      backgroundColor: result.risk_category === 'Low' ? '#F0FDF4' : (result.risk_category === 'Medium' ? '#FFFBEB' : '#FFF1F2'),
                      borderColor: result.risk_category === 'Low' ? '#BBF7D0' : (result.risk_category === 'Medium' ? '#FDE68A' : '#FECDD3')
                    }}
                  >
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider block"
                        style={{
                          color: result.risk_category === 'Low' ? '#15803D' : (result.risk_category === 'Medium' ? '#B45309' : '#BE123C')
                        }}
                      >
                        Default Probability (PD)
                      </span>
                      <span className="text-3xl font-extrabold text-slate-900">
                        {(result.default_probability * 100).toFixed(1)}%
                      </span>
                    </div>

                    <div className="text-right">
                      <span className={`text-xs font-extrabold px-3 py-1 rounded-full border ${
                        result.risk_category === 'Low'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : result.risk_category === 'Medium'
                          ? 'bg-amber-100 text-amber-800 border-amber-300'
                          : 'bg-rose-100 text-rose-800 border-rose-300'
                      }`}>
                        {result.risk_category} Risk
                      </span>
                      <p className="text-[10px] text-slate-500 mt-1">
                        {result.predicted_class === 1 ? 'Predicted Default' : 'Predicted Non-Default'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Mathematical SHAP Contributions */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                      Real SHAP Feature Attributions
                    </h3>
                    <span className="text-[10px] text-slate-400">TreeExplainer Game Theory</span>
                  </div>

                  <div className="space-y-2.5">
                    {result.shap_contributions.slice(0, 6).map((item, idx) => (
                      <div key={idx} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 text-xs">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                            {item.direction === 'increases_risk' ? (
                              <TrendingUp className="h-3.5 w-3.5 text-rose-600" />
                            ) : (
                              <TrendingDown className="h-3.5 w-3.5 text-emerald-600" />
                            )}
                            {item.feature.toUpperCase()}
                          </span>
                          <span className={`font-mono font-bold text-[11px] ${
                            item.direction === 'increases_risk' ? 'text-rose-600' : 'text-emerald-600'
                          }`}>
                            {item.shap_value > 0 ? `+${item.shap_value.toFixed(4)}` : item.shap_value.toFixed(4)}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Educational Disclaimer */}
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-[10px] text-slate-500 leading-relaxed">
                  <span className="font-semibold text-slate-700">Notice: </span>
                  {result.disclaimer} SHAP values represent internal mathematical attributions, not real-world causation.
                </div>
              </div>
            ) : (
              <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm text-center py-20">
                <div className="mx-auto w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                  <Sparkles className="h-6 w-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Awaiting Assessment</h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
                  Select a diagnostic scenario or adjust the parameters and click 'Compute Calibrated Risk' to view individual SHAP explanations.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
