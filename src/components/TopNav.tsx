import React from 'react';
import { Sparkles, BookOpen, Clock } from 'lucide-react';

interface TopNavProps {
  activeSection: string;
  onNavigate: (section: string) => void;
  onOpenJudgeDemo: () => void;
  onOpenMethodology: () => void;
  currentHour: number;
}

export const TopNav: React.FC<TopNavProps> = ({
  activeSection,
  onNavigate,
  onOpenJudgeDemo,
  onOpenMethodology,
  currentHour,
}) => {
  const navItems = [
    { id: 'overview', label: 'Overview' },
    { id: 'topology', label: 'Topology Map' },
    { id: 'regions', label: 'Regional Telemetry' },
    { id: 'optimizer', label: 'Meko Decision' },
    { id: 'tradeoff', label: 'Carbon Trade-off' },
    { id: 'memory', label: 'Memory & Learning' },
    { id: 'cluster', label: 'YugabyteDB Cluster' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 p-0.5 shadow-md shadow-emerald-500/20">
            <div className="w-full h-full bg-zinc-950 rounded-[10px] flex items-center justify-center text-emerald-400 font-bold text-sm">
              🌱
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-base font-extrabold tracking-tight text-white whitespace-nowrap">
              CLOVER
            </span>
            <span className="text-[10px] font-mono font-bold text-emerald-400 border border-emerald-500/30 bg-emerald-950/50 px-2 py-0.5 rounded shadow-sm">
              MEKO AI
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden xl:flex items-center gap-5 text-xs font-semibold text-zinc-400">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`transition-all whitespace-nowrap cursor-pointer py-1 ${
                activeSection === item.id
                  ? 'text-white border-b-2 border-emerald-400 font-bold'
                  : 'hover:text-zinc-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Simulated Clock Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono text-zinc-300 bg-zinc-900 border border-zinc-800 rounded-lg">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            <span>T+{String(currentHour).padStart(2, '0')}:00</span>
          </div>

          <button
            onClick={onOpenMethodology}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:text-white bg-zinc-900 border border-zinc-800 rounded-lg hover:border-zinc-700 transition-colors whitespace-nowrap cursor-pointer"
            title="Transparent Energy & Carbon Assumptions"
          >
            <BookOpen className="w-3.5 h-3.5 text-zinc-400" />
            <span>Methodology</span>
          </button>

          <button
            onClick={onOpenJudgeDemo}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-zinc-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow-md shadow-emerald-950/40 transition-all duration-150 whitespace-nowrap cursor-pointer hover:scale-[1.02]"
          >
            <Sparkles className="w-3.5 h-3.5 fill-zinc-950" />
            <span>Start Judge Demo</span>
          </button>
        </div>
      </div>
    </header>
  );
};
