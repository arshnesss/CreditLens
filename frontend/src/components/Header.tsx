import React, { useEffect, useState } from 'react';
import { getHealth, HealthStatus } from '../api/client';
import { Activity, CheckCircle2, AlertTriangle, ShieldAlert } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle }) => {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;
    const checkStatus = async () => {
      try {
        const data = await getHealth();
        if (mounted) {
          setHealth(data);
          setError(false);
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError(true);
          setLoading(false);
        }
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 20000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0 shadow-sm z-10">
      <div>
        <h1 className="text-lg font-bold text-slate-900 tracking-tight">{title}</h1>
        {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4">
        {/* Backend Connectivity Status */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs">
          {loading ? (
            <div className="flex items-center gap-1.5 text-slate-500">
              <Activity className="h-3.5 w-3.5 animate-spin" />
              <span>Connecting API...</span>
            </div>
          ) : error ? (
            <div className="flex items-center gap-1.5 text-rose-600 font-medium">
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>API Offline</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Backend Online ({health?.database})</span>
            </div>
          )}
        </div>

        {/* Global Educational Notice */}
        <div className="hidden md:flex items-center gap-1.5 text-xs text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full">
          <ShieldAlert className="h-3.5 w-3.5 text-amber-600" />
          <span>Educational Portfolio Mode</span>
        </div>
      </div>
    </header>
  );
};

