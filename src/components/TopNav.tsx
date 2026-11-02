import React from 'react';
import { Sparkles, Download, RefreshCw } from 'lucide-react';

interface TopNavProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onRefreshData: () => void;
  onOpenDiagnostic: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  activeTab,
  onSelectTab,
  onRefreshData,
  onOpenDiagnostic,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Executive KPIs' },
    { id: 'rootcause', label: 'Root Cause Layer' },
    { id: 'forecasting', label: 'Prophet Forecasting' },
    { id: 'nlsql', label: 'NL-to-SQL Agent' },
    { id: 'sql', label: 'SQL Console' },
    { id: 'sop', label: 'Ops SOP Playbook' },
    { id: 'github', label: 'GitHub & Scripts' },
  ];

  return (
    <header className="flex items-center justify-between gap-8 px-6 py-3.5 bg-slate-900 border-b border-slate-800 text-white shrink-0 sticky top-0 z-30">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <a 
          href="#dashboard" 
          onClick={(e) => { e.preventDefault(); onSelectTab('dashboard'); }}
          className="text-lg font-bold tracking-tight text-white hover:text-emerald-400 transition-colors whitespace-nowrap"
        >
          QuickPulse Ops
        </a>
        <span className="text-xs text-slate-400 font-mono hidden sm:inline">
          10-20m Dark Store Intelligence
        </span>
      </div>

      {/* Zone 2: Concise single-line navigation links */}
      <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-300">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`whitespace-nowrap transition-colors py-1 cursor-pointer ${
                isActive 
                  ? 'text-emerald-400 border-b-2 border-emerald-400 font-semibold' 
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Zone 3: Primary action button */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onRefreshData}
          title="Regenerate synthetic operations dataset with fresh stochastic seeds"
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
        <button
          onClick={onOpenDiagnostic}
          className="px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-md transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Ask Ops Agent</span>
        </button>
      </div>
    </header>
  );
};
