import React from 'react';
import { Header } from '../components/Header';
import { Settings as SettingsIcon, Sliders, ShieldCheck } from 'lucide-react';

export const Settings: React.FC = () => {
  return (
    <div className="min-h-full flex flex-col">
      <Header
        title="System Settings & Risk Thresholds"
        subtitle="Manage probability thresholds, active model versions, and API connections"
      />
      <div className="p-8 space-y-6 flex-1">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="p-2 bg-slate-100 text-slate-700 rounded-lg">
              <Sliders className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Illustrative Risk Cutoff Thresholds</h2>
              <p className="text-xs text-slate-500">Configure default probability boundaries for categorization</p>
            </div>
          </div>

          <div className="mt-6 space-y-4 max-w-xl text-xs">
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
              <label className="font-semibold text-slate-700 block mb-1">Low Risk Upper Threshold</label>
              <p className="text-slate-500 mb-2">Customers with default probability &lt; 20% are tagged Low Risk</p>
              <input
                type="number"
                step="0.05"
                defaultValue={0.20}
                disabled
                className="w-32 px-3 py-1.5 bg-white border border-slate-300 rounded-md font-mono text-slate-800"
              />
            </div>

            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
              <label className="font-semibold text-slate-700 block mb-1">High Risk Lower Threshold</label>
              <p className="text-slate-500 mb-2">Customers with default probability &ge; 45% are tagged High Risk</p>
              <input
                type="number"
                step="0.05"
                defaultValue={0.45}
                disabled
                className="w-32 px-3 py-1.5 bg-white border border-slate-300 rounded-md font-mono text-slate-800"
              />
            </div>

            <div className="flex items-center gap-2 text-slate-500 pt-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Thresholds are centrally governed by server environment settings</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

