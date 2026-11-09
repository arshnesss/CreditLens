import React from 'react';
import { Header } from '../components/Header';
import { PieChart, BarChart3 } from 'lucide-react';

export const PortfolioAnalytics: React.FC = () => {
  return (
    <div className="min-h-full flex flex-col">
      <Header
        title="Portfolio Analytics"
        subtitle="Segment-level risk distributions, feature correlations, and high-risk clusters"
      />
      <div className="p-8 space-y-6 flex-1">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm text-center py-16">
          <div className="mx-auto w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
            <PieChart className="h-6 w-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-900">Portfolio Analytics Initialized</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
            Segment analysis, default distributions, and cross-tabulations across demographics and repayment behaviors.
          </p>
        </div>
      </div>
    </div>
  );
};

