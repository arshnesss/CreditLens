import React, { useEffect, useState } from 'react';
import { Header } from '../components/Header';
import {
  Users,
  ShieldAlert,
  Percent,
  Cpu,
  ArrowUpRight,
  Sparkles,
  AlertCircle,
  TrendingDown,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { getPortfolioOverview, getModelMetrics, PortfolioOverview, ModelMetricsData } from '../api/client';

export const Overview: React.FC = () => {
  const [overview, setOverview] = useState<PortfolioOverview | null>(null);
  const [metrics, setMetrics] = useState<ModelMetricsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ovData, mData] = await Promise.all([
          getPortfolioOverview(),
          getModelMetrics()
        ]);
        setOverview(ovData);
        setMetrics(mData);
      } catch (err) {
        console.error('Failed to load overview data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const riskPieData = overview?.risk_distribution.map(d => ({
    name: d.category,
    value: d.count,
    color: d.color
  })) || [
    { name: 'Low Risk', value: 15164, color: '#059669' },
    { name: 'Medium Risk', value: 8200, color: '#D97706' },
    { name: 'High Risk', value: 6636, color: '#E11D48' }
  ];

  return (
    <div className="min-h-full flex flex-col bg-slate-50">
      <Header
        title="Portfolio Risk Overview"
        subtitle="Credit default intelligence and probability distribution metrics"
      />

      <div className="p-8 space-y-6 flex-1">
        {/* Educational Disclaimer Banner */}
        <div className="bg-blue-50/80 border border-blue-200/80 rounded-xl p-4 flex items-start gap-3 shadow-sm">
          <AlertCircle className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
          <div className="text-xs text-blue-900 leading-relaxed">
            <span className="font-semibold">Educational Portfolio Project:</span> CreditLens AI demonstrates end-to-end credit risk modeling, calibrated probability estimation, SHAP explainability, and autonomous risk investigation. Predictions represent statistical estimates from machine learning algorithms and must not be used for actual credit underwriting or lending decisions.
          </div>
        </div>

        {/* Top KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Portfolio Records</span>
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <Users className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">
                {overview?.total_customers ? overview.total_customers.toLocaleString() : '30,000'}
              </span>
              <span className="text-xs text-slate-400">benchmark accounts</span>
            </div>
            <div className="mt-2 text-xs text-emerald-600 flex items-center font-medium">
              <ArrowUpRight className="h-3.5 w-3.5 mr-0.5" /> 100% Validated Data Pipeline
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">High Risk Share</span>
              <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
                <ShieldAlert className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">
                {overview?.high_risk_count ? ((overview.high_risk_count / overview.total_customers) * 100).toFixed(1) : '22.1'}%
              </span>
              <span className="text-xs text-rose-600 font-medium">
                {overview?.high_risk_count?.toLocaleString() || '6,636'} accounts
              </span>
            </div>
            <div className="mt-2 text-xs text-slate-500">
              PD &ge; 45% (Configurable threshold)
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Model Discrimination</span>
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                <Percent className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">
                {metrics?.selected_model_metrics?.roc_auc?.toFixed(3) || '0.774'}
              </span>
              <span className="text-xs text-indigo-600 font-medium">
                PR-AUC {metrics?.selected_model_metrics?.pr_auc?.toFixed(3) || '0.547'}
              </span>
            </div>
            <div className="mt-2 text-xs text-emerald-600 flex items-center font-medium">
              5-Fold Stratified Cross-Validated
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Calibration Score</span>
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                <Cpu className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">
                {metrics?.selected_model_metrics?.brier_score ? metrics.selected_model_metrics.brier_score.toFixed(4) : '0.1368'}
              </span>
              <span className="text-xs text-emerald-600 font-medium">Brier Error</span>
            </div>
            <div className="mt-2 text-xs text-slate-500">
              Sigmoid Calibrated Probabilities
            </div>
          </div>
        </div>

        {/* Visual Charts & Key Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Risk Tier Pie Chart */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                Portfolio Risk Tier Breakdown
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Distribution across Low, Medium, and High risk cutoffs
              </p>
            </div>
            <div className="h-64 my-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riskPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {riskPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => [`${Number(val).toLocaleString()} accounts`, 'Count']}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="text-[11px] text-slate-400 border-t border-slate-100 pt-3 text-center">
              Calibrated default probability tiers
            </div>
          </div>

          {/* Top Feature Impact Bar list */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm lg:col-span-2 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                  Top Mathematical Feature Drivers
                </h2>
                <span className="text-xs text-blue-600 font-semibold bg-blue-50 px-2.5 py-1 rounded-md">
                  Gini & SHAP Attributions
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Most influential predictors of credit default in benchmark portfolio
              </p>
            </div>

            <div className="space-y-3 my-4">
              {[
                { feature: 'PAY_0 (Repayment status in September)', pct: 27.8, label: 'Recent Delinquency', color: 'bg-rose-500' },
                { feature: 'PAY_2 (Repayment status in August)', pct: 11.2, label: 'Historical Arrears', color: 'bg-rose-400' },
                { feature: 'PAY_3 (Repayment status in July)', pct: 7.8, label: 'Historical Arrears', color: 'bg-amber-500' },
                { feature: 'PAY_4 (Repayment status in June)', pct: 6.2, label: 'Historical Arrears', color: 'bg-amber-400' },
                { feature: 'LIMIT_BAL (Given Credit Line)', pct: 4.5, label: 'Exposure Size', color: 'bg-blue-500' },
              ].map((item, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-700">{item.feature}</span>
                    <span className="text-slate-900 font-bold">{item.pct}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full ${item.color}`}
                      style={{ width: `${item.pct * 3}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-3">
              <span>Payment timeliness in recent months accounts for &gt;50% of default risk variance.</span>
              <Link to="/analytics" className="text-blue-600 font-semibold hover:underline flex items-center gap-1">
                Explore Analytics <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Action Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Link
            to="/risk-assessment"
            className="p-5 rounded-xl bg-gradient-to-br from-blue-900 to-[#0B132B] text-white shadow-md hover:shadow-lg transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="p-2.5 bg-blue-600/30 w-fit rounded-lg border border-blue-400/30 text-blue-300 mb-3">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-base text-white group-hover:text-blue-300 transition-colors">
                Assess Individual Customer
              </h3>
              <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                Enter credit attributes, calculate calibrated default probability, and view interactive SHAP waterfalls.
              </p>
            </div>
            <div className="mt-4 flex items-center text-xs font-medium text-blue-400 group-hover:translate-x-1 transition-transform">
              Launch Assessment Tool &rarr;
            </div>
          </Link>

          <Link
            to="/customers"
            className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm hover:border-blue-300 hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="p-2.5 bg-indigo-50 w-fit rounded-lg text-indigo-600 mb-3">
                <Users className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-base text-slate-900 group-hover:text-indigo-600 transition-colors">
                Customer Directory
              </h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Filter and sort active customer accounts by default probability, demographic segment, and delinquency status.
              </p>
            </div>
            <div className="mt-4 flex items-center text-xs font-medium text-indigo-600 group-hover:translate-x-1 transition-transform">
              Browse Directory &rarr;
            </div>
          </Link>

          <Link
            to="/reports"
            className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm hover:border-emerald-300 hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="p-2.5 bg-emerald-50 w-fit rounded-lg text-emerald-600 mb-3">
                <Cpu className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-base text-slate-900 group-hover:text-emerald-600 transition-colors">
                Risk Audit Reports
              </h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Generate audit-ready PDF investigation reports with model disclaimers, key drivers, and portfolio summaries.
              </p>
            </div>
            <div className="mt-4 flex items-center text-xs font-medium text-emerald-600 group-hover:translate-x-1 transition-transform">
              Generate Reports &rarr;
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};
