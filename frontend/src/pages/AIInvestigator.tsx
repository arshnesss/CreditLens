import React from 'react';
import { Header } from '../components/Header';
import { Bot, MessageSquare } from 'lucide-react';

export const AIInvestigator: React.FC = () => {
  return (
    <div className="min-h-full flex flex-col">
      <Header
        title="AI Credit Risk Investigator"
        subtitle="Autonomous investigation agent executing deterministic credit analysis tools"
      />
      <div className="p-8 space-y-6 flex-1">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm text-center py-16">
          <div className="mx-auto w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
            <Bot className="h-6 w-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-900">AI Investigator Agent Initialized</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
            Deterministic LangGraph agent with tools for profile lookup, default prediction, SHAP explanation, customer comparison, and anomaly detection.
          </p>
        </div>
      </div>
    </div>
  );
};
