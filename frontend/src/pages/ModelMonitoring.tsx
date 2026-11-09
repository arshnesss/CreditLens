import React from 'react';
import { Header } from '../components/Header';
import { Activity, Gauge } from 'lucide-react';

export const ModelMonitoring: React.FC = () => {
  return (
    <div className="min-h-full flex flex-col">
      <Header
        title="Model Performance & Drift Monitoring"
        subtitle="Post-deployment telemetry, Kolmogorov-Smirnov drift tests, and Isolation Forest anomalies"
      />
      <div className="p-8 space-y-6 flex-1">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm text-center py-16">
          <div className="mx-auto w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
            <Activity className="h-6 w-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-900">Model Monitoring Module Initialized</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
            Tracks feature distribution shifts, concept drift, and flags uncharacteristic customer patterns for human review.
          </p>
        </div>
      </div>
    </div>
  );
};

