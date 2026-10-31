import React from 'react';
import { ClusterMetrics } from '../types';
import { Leaf, Zap, Activity, Database, CheckCircle2, AlertTriangle, Clock, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface KpiMetricsProps {
  metrics: ClusterMetrics;
}

export const KpiMetrics: React.FC<KpiMetricsProps> = ({ metrics }) => {
  const getStatusBadge = (status: ClusterMetrics['optimizationStatus']) => {
    switch (status) {
      case 'OPTIMIZED':
        return {
          label: 'Optimal Placement',
          color: 'text-emerald-400 border-emerald-500/30 bg-emerald-950/40',
          dot: 'bg-emerald-400',
          icon: CheckCircle2,
        };
      case 'OPPORTUNITY_DETECTED':
        return {
          label: 'Green Shift Ready',
          color: 'text-amber-400 border-amber-500/30 bg-amber-950/40',
          dot: 'bg-amber-400',
          icon: AlertTriangle,
        };
      case 'LATENCY_CONSTRAINED':
        return {
          label: 'Latency Constrained',
          color: 'text-sky-400 border-sky-500/30 bg-sky-950/40',
          dot: 'bg-sky-400',
          icon: Clock,
        };
      default:
        return {
          label: 'Balancing Nodes',
          color: 'text-zinc-400 border-zinc-700 bg-zinc-900',
          dot: 'bg-zinc-400',
          icon: Activity,
        };
    }
  };

  const statusConfig = getStatusBadge(metrics.optimizationStatus);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
      {/* 1. Carbon per 1,000 Transactions */}
      <div className="relative group overflow-hidden rounded-xl bg-gradient-to-b from-zinc-900/90 to-zinc-950/90 border border-zinc-800/80 p-4 hover:border-zinc-700/80 transition-all duration-200">
        <div className="flex items-center justify-between text-xs text-zinc-400 font-medium">
          <span className="uppercase tracking-wider text-[11px] font-semibold">Emissions / 1k Tx</span>
          <div className="w-6 h-6 rounded-md bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
            <Leaf className="w-3.5 h-3.5" />
          </div>
        </div>

        <div className="mt-3">
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl lg:text-3xl font-extrabold font-mono tabular-nums text-white tracking-tight">
              {metrics.carbonPer1kTxG}
            </span>
            <span className="text-xs text-zinc-400 font-mono">gCO2</span>
          </div>

          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-zinc-400">
            <span className="inline-flex items-center text-emerald-400 font-mono font-semibold">
              <ArrowDownRight className="w-3 h-3" />
              -22.4%
            </span>
            <span>vs static baseline</span>
          </div>
        </div>

        <div className="mt-3 h-1 w-full bg-zinc-800/60 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-400 rounded-full w-2/3" />
        </div>
      </div>

      {/* 2. Estimated Total Carbon Saved */}
      <div className="relative group overflow-hidden rounded-xl bg-gradient-to-b from-zinc-900/90 to-zinc-950/90 border border-zinc-800/80 p-4 hover:border-zinc-700/80 transition-all duration-200">
        <div className="flex items-center justify-between text-xs text-zinc-400 font-medium">
          <span className="uppercase tracking-wider text-[11px] font-semibold">Total Carbon Saved</span>
          <div className="w-6 h-6 rounded-md bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
            <Zap className="w-3.5 h-3.5" />
          </div>
        </div>

        <div className="mt-3">
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl lg:text-3xl font-extrabold font-mono tabular-nums text-emerald-400 tracking-tight">
              {metrics.totalCarbonSavedKg.toFixed(2)}
            </span>
            <span className="text-xs text-zinc-400 font-mono">kg CO2</span>
          </div>

          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-zinc-400">
            <span className="inline-flex items-center text-emerald-400 font-mono font-semibold">
              <ArrowUpRight className="w-3 h-3" />
              +{metrics.carbonSavedPercentage}%
            </span>
            <span>abatement rate</span>
          </div>
        </div>

        <div className="mt-3 h-1 w-full bg-zinc-800/60 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-400 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, metrics.carbonSavedPercentage * 2.5)}%` }}
          />
        </div>
      </div>

      {/* 3. Current p99 Latency */}
      <div className="relative group overflow-hidden rounded-xl bg-gradient-to-b from-zinc-900/90 to-zinc-950/90 border border-zinc-800/80 p-4 hover:border-zinc-700/80 transition-all duration-200">
        <div className="flex items-center justify-between text-xs text-zinc-400 font-medium">
          <span className="uppercase tracking-wider text-[11px] font-semibold">Current p99 Latency</span>
          <div className="w-6 h-6 rounded-md bg-sky-500/10 flex items-center justify-center text-sky-400 border border-sky-500/20">
            <Activity className="w-3.5 h-3.5" />
          </div>
        </div>

        <div className="mt-3">
          <div className="flex items-baseline gap-1.5">
            <span
              className={`text-2xl lg:text-3xl font-extrabold font-mono tabular-nums tracking-tight ${
                metrics.currentP99LatencyMs > 60 ? 'text-amber-400' : 'text-white'
              }`}
            >
              {metrics.currentP99LatencyMs.toFixed(1)}
            </span>
            <span className="text-xs text-zinc-400 font-mono">ms</span>
          </div>

          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-zinc-400">
            <span className="font-mono text-zinc-300">Target SLA:</span>
            <span>&lt; 50ms</span>
          </div>
        </div>

        <div className="mt-3 h-1 w-full bg-zinc-800/60 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              metrics.currentP99LatencyMs > 60 ? 'bg-amber-400' : 'bg-sky-400'
            }`}
            style={{ width: `${Math.min(100, (metrics.currentP99LatencyMs / 80) * 100)}%` }}
          />
        </div>
      </div>

      {/* 4. Active Tablet Leaders */}
      <div className="relative group overflow-hidden rounded-xl bg-gradient-to-b from-zinc-900/90 to-zinc-950/90 border border-zinc-800/80 p-4 hover:border-zinc-700/80 transition-all duration-200">
        <div className="flex items-center justify-between text-xs text-zinc-400 font-medium">
          <span className="uppercase tracking-wider text-[11px] font-semibold">Active Leaders</span>
          <div className="w-6 h-6 rounded-md bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
            <Database className="w-3.5 h-3.5" />
          </div>
        </div>

        <div className="mt-3">
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl lg:text-3xl font-extrabold font-mono tabular-nums text-white tracking-tight">
              {metrics.totalLeaders}
            </span>
            <span className="text-xs text-zinc-400 font-mono">tablets (RF=3)</span>
          </div>

          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-zinc-400">
            <span className="text-indigo-400 font-mono font-semibold">3 Regions</span>
            <span>· 144 replicas</span>
          </div>
        </div>

        <div className="mt-3 h-1 w-full bg-zinc-800/60 rounded-full overflow-hidden">
          <div className="h-full bg-indigo-400 rounded-full w-full" />
        </div>
      </div>

      {/* 5. Optimization Status */}
      <div className="relative group overflow-hidden rounded-xl bg-gradient-to-b from-zinc-900/90 to-zinc-950/90 border border-zinc-800/80 p-4 hover:border-zinc-700/80 transition-all duration-200">
        <div className="flex items-center justify-between text-xs text-zinc-400 font-medium">
          <span className="uppercase tracking-wider text-[11px] font-semibold">Meko Policy State</span>
          <StatusIcon className="w-4 h-4 text-zinc-400" />
        </div>

        <div className="mt-3">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-semibold font-mono tracking-tight shadow-sm">
            <span className={`w-2 h-2 rounded-full ${statusConfig.dot}`} />
            <span className={statusConfig.color.split(' ')[0]}>{statusConfig.label}</span>
          </div>

          <div className="mt-2 text-[11px] text-zinc-400">
            Adaptive SLA protection
          </div>
        </div>

        <div className="mt-3 h-1 w-full bg-zinc-800/60 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-400 rounded-full w-4/5" />
        </div>
      </div>
    </div>
  );
};
