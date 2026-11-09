import React from 'react';
import { Header } from '../components/Header';
import { Users, Filter, Search, ArrowUpDown } from 'lucide-react';

export const Customers: React.FC = () => {
  return (
    <div className="min-h-full flex flex-col">
      <Header
        title="Customer Directory"
        subtitle="Search, filter, and inspect credit portfolios and history"
      />
      <div className="p-8 space-y-6 flex-1">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by customer ID or segment..."
                className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <button className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
                <Filter className="h-3.5 w-3.5" />
                Filter Risk
              </button>
              <button className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
                <ArrowUpDown className="h-3.5 w-3.5" />
                Sort Probability
              </button>
            </div>
          </div>

          <div className="py-16 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">Customer Directory Pipeline Ready</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              Data ingestion and ML training pipeline will populate real customer accounts from the UCI Credit dataset.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

