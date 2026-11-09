import React, { useEffect, useState } from 'react';
import { Header } from '../components/Header';
import {
  Activity,
  Gauge,
  Percent,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Cpu,
  Layers,
  ShieldCheck,
  Zap,
  TrendingDown
} from 'lucide-react';
import { getModelMetrics, ModelMetricsData, apiClient } from '../api/client';

export const ModelMonitoring: React.FC = () => {
  const [metrics, setMetrics] = useState<ModelMetricsData | null>(null);
  const [driftReport, setDriftReport] = useState<any>(null);
  const [anomalies, setAnomalies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [runningDrift, setRunningDrift] = useState(false);
  const [simulating, setSimulating] = useState(false);

  const fetchMonitoringData = async () => {
    try {
      const [mData, dData, aData] = await Promise.all([
        getModelMetrics(),
        apiClient.get('/monitoring/drift').then(r => r.data),
        apiClient.get('/monitoring/anomalies').then(r => r.data)
      ]);
      setMetrics(mData);
      setDriftReport(dData);
      setAnomalies(aData.anomalies || []);
    } catch (err) {
      console.error('Failed to load telemetry data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonitoringData();
  }, []);

  const handleRunDrift = async () => {
    setRunningDrift(true);
    try {
      const { data } = await apiClient.get('/monitoring/drift');
      setDriftReport(data);
    } catch (err) {
      console.error(err);
    } finally {
      setRunningDrift(false);
    }
  };

  const handleSimulateShock = async () => {
    setSimulating(true);
    try {
      const { data } = await apiClient.post('/monitoring/drift/simulate-shift');
      setDriftReport(data.drift_summary);
    } catch (err) {
      console.error(err);
    } finally {
      setSimulating(false);
    }
  };

  const cm = metrics?.selected_model_metrics?.confusion_matrix || [
    [4358, 315],
    [814, 513]
  ];

  return (
    <div className="min-h-full flex flex-col bg-slate-50">
      <Header
        title="Model Telemetry, Calibration & Drift Monitoring"
        subtitle="Post-deployment model performance tracking, Brier score calibration, and statistical KS-drift tests"
      />

      <div className="p-8 space-y-6 flex-1 max-w-7xl mx-auto w-full">
        {/* Top Status Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Active Production Model
            </span>
            <div className="mt-2 font-bold text-lg text-slate-900">
              {metrics?.algorithm || 'Random Forest (Calibrated)'}
            </div>
            <div className="mt-2 text-xs text-slate-500 flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span>Version {metrics?.model_version || 'v1.0.0'} (Active)</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Discrimination (ROC-AUC)
            </span>
            <div className="mt-2 font-bold text-2xl text-slate-900">
              {metrics?.selected_model_metrics?.roc_auc?.toFixed(4) || '0.7744'}
            </div>
            <div className="mt-2 text-xs text-indigo-600 font-medium">
              PR-AUC: {metrics?.selected_model_metrics?.pr_auc?.toFixed(4) || '0.5470'}
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Probability Calibration
            </span>
            <div className="mt-2 font-bold text-2xl text-slate-900">
              {metrics?.selected_model_metrics?.brier_score?.toFixed(4) || '0.1368'}
            </div>
            <div className="mt-2 text-xs text-emerald-600 font-medium">
              Brier Score Loss (Empirical Alignment)
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Statistical Data Drift
            </span>
            <div className={`mt-2 font-bold text-2xl flex items-center gap-1.5 ${
              driftReport?.drift_detected ? 'text-rose-600' : 'text-emerald-600'
            }`}>
              {driftReport?.drift_detected ? (
                <>
                  <AlertTriangle className="h-5 w-5" />
                  <span>Drift Alert</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-5 w-5" />
                  <span>Stable</span>
                </>
              )}
            </div>
            <div className="mt-2 text-xs text-slate-500">
              Drift Share: {driftReport?.drift_share_pct || '0.0%'} of features
            </div>
          </div>
        </div>

        {/* Statistical Drift Diagnostics Panel */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                <Activity className="h-4 w-4 text-blue-600" />
                Kolmogorov-Smirnov Two-Sample Covariate Drift Tests
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Evaluates H0 (same distribution) against H1 (drifted) with p-value significance threshold &alpha; = 0.05
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleRunDrift}
                disabled={runningDrift}
                className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${runningDrift ? 'animate-spin' : ''}`} />
                {runningDrift ? 'Running KS Tests...' : 'Run Drift Test'}
              </button>
              <button
                onClick={handleSimulateShock}
                disabled={simulating}
                className="px-3.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                <Zap className="h-3.5 w-3.5 text-rose-600" />
                {simulating ? 'Simulating Shift...' : 'Simulate Recession Shock'}
              </button>
            </div>
          </div>

          <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-lg text-xs text-blue-900 flex items-start gap-2.5">
            <ShieldCheck className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Diagnostic Interpretation: </span>
              {driftReport?.interpretation || 'Feature distributions are consistent with training baseline.'}{' '}
              <span className="text-blue-700">({driftReport?.disclaimer})</span>
            </div>
          </div>

          {/* Feature Drift Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-2.5">Feature</th>
                  <th className="px-4 py-2.5">Statistical Test</th>
                  <th className="px-4 py-2.5">Statistic</th>
                  <th className="px-4 py-2.5">p-value</th>
                  <th className="px-4 py-2.5">Ref Mean</th>
                  <th className="px-4 py-2.5">Current Mean</th>
                  <th className="px-4 py-2.5">Mean Shift</th>
                  <th className="px-4 py-2.5 text-right">Drift Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {driftReport?.feature_metrics?.slice(0, 8).map((f: any, i: number) => (
                  <tr key={i} className="hover:bg-slate-50/80 transition-colors font-sans">
                    <td className="px-4 py-2.5 font-bold text-slate-800">{f.feature.toUpperCase()}</td>
                    <td className="px-4 py-2.5 text-slate-500 text-[11px]">{f.test_name}</td>
                    <td className="px-4 py-2.5 font-mono text-slate-700">{f.statistic.toFixed(4)}</td>
                    <td className="px-4 py-2.5 font-mono">
                      <span className={f.p_value < 0.05 ? 'text-rose-600 font-bold' : 'text-slate-600'}>
                        {f.p_value.toFixed(4)}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 font-mono text-slate-600">{f.reference_mean.toLocaleString()}</td>
                    <td className="px-4 py-2.5 font-mono text-slate-600">{f.current_mean.toLocaleString()}</td>
                    <td className="px-4 py-2.5 font-mono">
                      <span className={Math.abs(f.mean_shift_pct) > 15 ? 'text-rose-600 font-bold' : 'text-slate-600'}>
                        {f.mean_shift_pct > 0 ? `+${f.mean_shift_pct}%` : `${f.mean_shift_pct}%`}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      {f.drift_detected ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                          Drift Detected
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                          Stable
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Isolation Forest Anomaly Detection Panel */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                <Cpu className="h-4 w-4 text-emerald-600" />
                Isolation Forest Outlier Detection (Unsupervised Investigation)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Accounts exhibiting unusual multidimensional divergence between limit, balance, and repayment volume
              </p>
            </div>
            <span className="text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md font-mono">
              Contamination: 6.0%
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-2.5">Customer Code</th>
                  <th className="px-4 py-2.5">Credit Line ($)</th>
                  <th className="px-4 py-2.5">Billed Balance ($)</th>
                  <th className="px-4 py-2.5">Payment ($)</th>
                  <th className="px-4 py-2.5">Repayment Status</th>
                  <th className="px-4 py-2.5">Primary Anomaly Indicator</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {anomalies.slice(0, 5).map((a: any, i: number) => (
                  <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 font-bold text-slate-900">{a.customer_code}</td>
                    <td className="px-4 py-3 font-mono">${a.limit_bal.toLocaleString()}</td>
                    <td className="px-4 py-3 font-mono">${a.bill_amt1.toLocaleString()}</td>
                    <td className="px-4 py-3 font-mono">${a.pay_amt1.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      {a.pay_0 > 0 ? (
                        <span className="text-rose-600 font-bold">{a.pay_0} mo delay</span>
                      ) : (
                        <span className="text-slate-600">Current</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-700 font-medium">
                      <span className="p-1 px-2 rounded bg-amber-50 text-amber-800 border border-amber-200 text-[11px]">
                        {a.primary_risk_driver}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
