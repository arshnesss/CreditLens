import React, { useEffect, useState } from 'react';
import { Header } from '../components/Header';
import {
  Sliders,
  ShieldCheck,
  Database,
  Cpu,
  Layers,
  Server,
  Key,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { getHealth, HealthStatus } from '../api/client';

export const Settings: React.FC = () => {
  const [health, setHealth] = useState<HealthStatus | null>(null);

  useEffect(() => {
    getHealth().then(setHealth).catch(console.error);
  }, []);

  return (
    <div className="min-h-full flex flex-col bg-slate-50">
      <Header
        title="System Configuration & Risk Governance"
        subtitle="Manage probability thresholds, active model versions, and API connections"
      />

      <div className="p-8 space-y-6 flex-1 max-w-5xl mx-auto w-full">
        {/* Risk Thresholds Governance Card */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Sliders className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                Configurable Probability of Default (PD) Cutoffs
              </h2>
              <p className="text-xs text-slate-500">
                Centrally governed risk bands for automated categorization
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-900">Low Risk Upper Threshold</span>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  PD &lt; 0.20 (20%)
                </span>
              </div>
              <p className="text-emerald-800/80 leading-relaxed text-[11px]">
                Borrowers with default probability below 20% are routed to expedited automated review.
              </p>
            </div>

            <div className="p-4 bg-rose-50/60 border border-rose-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-rose-900">High Risk Lower Threshold</span>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800">
                  PD &ge; 0.45 (45%)
                </span>
              </div>
              <p className="text-rose-800/80 leading-relaxed text-[11px]">
                Borrowers with default probability exceeding 45% trigger mandatory risk mitigation.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 pt-2 border-t border-slate-100">
            <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>Thresholds are centrally governed by server environment settings. Illustrative educational parameters.</span>
          </div>
        </div>

        {/* Runtime Environment Telemetry Card */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="p-2 bg-slate-100 text-slate-700 rounded-lg">
              <Server className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                Runtime Infrastructure & Storage
              </h2>
              <p className="text-xs text-slate-500">Live backend environment parameters</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200/80">
              <span className="text-slate-400 block mb-1">Backend Server</span>
              <span className="font-bold text-slate-800 block">{health?.app_name || 'CreditLens AI'}</span>
              <span className="text-[11px] text-emerald-600 font-medium">FastAPI v{health?.version || '1.0.0'}</span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200/80">
              <span className="text-slate-400 block mb-1">Database Engine</span>
              <span className="font-bold text-slate-800 block">SQLAlchemy 2.0</span>
              <span className="text-[11px] text-blue-600 font-medium">{health?.database || 'SQLite / PostgreSQL'}</span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200/80">
              <span className="text-slate-400 block mb-1">Model Inference Engine</span>
              <span className="font-bold text-slate-800 block">Calibrated Random Forest</span>
              <span className="text-[11px] text-indigo-600 font-medium">SHAP TreeExplainer Enabled</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
