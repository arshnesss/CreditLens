import React from 'react';
import { Header } from '../components/Header';
import {
  Users,
  ShieldAlert,
  Percent,
  Cpu,
  ArrowUpRight,
  Sparkles,
  UploadCloud,
  FileText,
  AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const Overview: React.FC = () => {
  return (
    <div className="min-h-full flex flex-col">
      <Header
        title="Portfolio Risk Overview"
        subtitle="Credit default intelligence and probability distribution metrics"
      />

      <div className="p-8 space-y-6 flex-1">
        {/* Educational Disclaimer Banner */}
        <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
          <div className="text-xs text-blue-900 leading-relaxed">
            <span className="font-semibold">Educational Portfolio Project:</span> CreditLens AI demonstrates end-to-end credit risk modeling, calibrated probability estimation, SHAP explainability, and autonomous risk investigation. Predictions represent statistical estimates from machine learning algorithms and must not be used for actual credit underwriting or lending decisions.
          </div>
        </div>

        {/* Top KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-slate-300 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Portfolio Records</span>
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <Users className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-bold text-slate-900">30,000</span>
              <span className="text-xs text-slate-400 ml-2">UCI Benchmark</span>
            </div>
            <div className="mt-2 text-xs text-emerald-600 flex items-center font-medium">
              <ArrowUpRight className="h-3.5 w-3.5 mr-0.5" /> Complete validation pipeline
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-slate-300 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">High Risk Share</span>
              <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
                <ShieldAlert className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-bold text-slate-900">22.1%</span>
              <span className="text-xs text-rose-600 font-medium ml-2">6,636 accounts</span>
            </div>
            <div className="mt-2 text-xs text-slate-500">
              Threshold PD &ge; 45% (configurable)
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-slate-300 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Model ROC-AUC</span>
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                <Percent className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-bold text-slate-900">0.784</span>
              <span className="text-xs text-indigo-600 font-medium ml-2">PR-AUC 0.542</span>
            </div>
            <div className="mt-2 text-xs text-emerald-600 flex items-center font-medium">
              Calibrated Random Forest + LR
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-slate-300 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Engine</span>
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                <Cpu className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-xl font-bold text-slate-900">SHAP TreeExplainer</span>
            </div>
            <div className="mt-2 text-xs text-slate-500">
              Individual feature contributions
            </div>
          </div>
        </div>

        {/* Action quick links */}
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
                Run Risk Assessment
              </h3>
              <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                Evaluate individual credit profile attributes with real-time probability prediction and SHAP contribution breakdown.
              </p>
            </div>
            <div className="mt-4 flex items-center text-xs font-medium text-blue-400 group-hover:translate-x-1 transition-transform">
              Launch Assessment Tool &rarr;
            </div>
          </Link>

          <Link
            to="/investigator"
            className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm hover:border-blue-300 hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="p-2.5 bg-indigo-50 w-fit rounded-lg text-indigo-600 mb-3">
                <Sparkles className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-base text-slate-900 group-hover:text-indigo-600 transition-colors">
                AI Risk Investigator
              </h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Autonomous credit analyst agent powered by deterministic Python analytical tools to query profiles and anomalies.
              </p>
            </div>
            <div className="mt-4 flex items-center text-xs font-medium text-indigo-600 group-hover:translate-x-1 transition-transform">
              Start Investigation &rarr;
            </div>
          </Link>

          <Link
            to="/monitoring"
            className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm hover:border-emerald-300 hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="p-2.5 bg-emerald-50 w-fit rounded-lg text-emerald-600 mb-3">
                <Cpu className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-base text-slate-900 group-hover:text-emerald-600 transition-colors">
                Model Drift & Monitoring
              </h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Track statistical Kolmogorov-Smirnov drift tests, feature distribution shifts, and Isolation Forest anomalies.
              </p>
            </div>
            <div className="mt-4 flex items-center text-xs font-medium text-emerald-600 group-hover:translate-x-1 transition-transform">
              View Monitoring Telemetry &rarr;
            </div>
          </Link>
        </div>

        {/* Architecture & Pipeline Highlights */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-4">
            CreditLens Modular Architecture
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200/80">
              <span className="font-semibold text-slate-800 block text-sm mb-1">01 Ingestion & EDA</span>
              <p className="text-slate-500 leading-relaxed">
                UCI Credit dataset ingestion with missing-value analysis, duplicate detection, and stratified splits.
              </p>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200/80">
              <span className="font-semibold text-slate-800 block text-sm mb-1">02 ML & Calibration</span>
              <p className="text-slate-500 leading-relaxed">
                Scikit-learn pipeline with Logistic Regression and Random Forest calibrated via Isotonic / Sigmoid methods.
              </p>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200/80">
              <span className="font-semibold text-slate-800 block text-sm mb-1">03 SHAP Explainability</span>
              <p className="text-slate-500 leading-relaxed">
                Real mathematical SHAP game-theoretic feature attribution. No simulated or LLM-hallucinated factors.
              </p>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200/80">
              <span className="font-semibold text-slate-800 block text-sm mb-1">04 Agent & Monitoring</span>
              <p className="text-slate-500 leading-relaxed">
                Deterministic analytical agent tools combined with statistical drift detection and anomaly isolation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
