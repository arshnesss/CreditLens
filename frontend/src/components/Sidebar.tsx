import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  ShieldAlert,
  PieChart,
  Bot,
  Activity,
  FileText,
  Settings,
  Layers,
  ShieldCheck
} from 'lucide-react';

interface NavItem {
  name: string;
  to: string;
  icon: React.ElementType;
  badge?: string;
}

const navItems: NavItem[] = [
  { name: 'Overview', to: '/', icon: LayoutDashboard },
  { name: 'Customers', to: '/customers', icon: Users },
  { name: 'Risk Assessment', to: '/risk-assessment', icon: ShieldAlert },
  { name: 'Portfolio Analytics', to: '/analytics', icon: PieChart },
  { name: 'AI Investigator', to: '/investigator', icon: Bot, badge: 'Agent' },
  { name: 'Model Monitoring', to: '/monitoring', icon: Activity },
  { name: 'Reports', to: '/reports', icon: FileText },
  { name: 'Settings', to: '/settings', icon: Settings },
];

export const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 bg-[#0B132B] text-slate-300 flex flex-col shrink-0 h-screen border-r border-[#1C2E5D]/50 select-none">
      {/* Brand Header */}
      <div className="h-16 px-6 flex items-center gap-3 border-b border-[#1C2E5D]/60 bg-[#070B19]/50">
        <div className="h-9 w-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
          <Layers className="h-5 w-5" />
        </div>
        <div>
          <div className="font-bold text-white tracking-tight text-base flex items-center gap-1.5">
            CreditLens <span className="text-blue-400 font-extrabold text-xs px-1.5 py-0.5 rounded bg-blue-950/80 border border-blue-800/60">AI</span>
          </div>
          <p className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">Credit Risk Intelligence</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
          Platform Navigation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30'
                    : 'text-slate-300 hover:bg-[#152042]/70 hover:text-white'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Educational Disclaimer Footer */}
      <div className="p-4 border-t border-[#1C2E5D]/60 bg-[#070B19]/40">
        <div className="flex items-start gap-2.5 p-2.5 rounded-md bg-[#152042]/40 border border-[#1C2E5D]/50 text-xs">
          <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-[11px] font-semibold text-slate-200">Educational Sandbox</p>
            <p className="text-[10px] text-slate-400 leading-relaxed mt-0.5">
              Simulated risk intelligence. Not for actual credit lending underwriting.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};

