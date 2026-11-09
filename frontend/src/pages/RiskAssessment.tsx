import React from 'react';
import { Header } from '../components/Header';
import { ShieldAlert, Send } from 'lucide-react';

export const RiskAssessment: React.FC = () => {
  return (
    <div className="min-h-full flex flex-col">
      <Header
        title="Credit Risk Assessment & SHAP Explainability"
        subtitle="Individual customer scoring and explainable feature attributions"
      />
      <div className="p-8 space-y-6 flex-1">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Customer Risk Scoring Form</h2>
              <p className="text-xs text-slate-500">Submit credit features to compute default probability and SHAP waterfall</p>
            </div>
          </div>

          <div className="py-16 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
              <Send className="h-6 w-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">Assessment Module Initialized</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              Connects to the FastAPI backend prediction engine with SHAP TreeExplainer integration in upcoming phases.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
