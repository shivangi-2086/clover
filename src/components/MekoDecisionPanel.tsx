import React, { useState } from 'react';
import { MekoDecision, RegionId } from '../types';
import { REGIONS } from '../utils/carbonData';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  Sliders,
  CheckCircle2,
  Brain,
  Info,
  RotateCcw,
  Zap,
  TrendingDown,
  Clock,
  Gauge,
} from 'lucide-react';

interface MekoDecisionPanelProps {
  decision: MekoDecision;
  latencyToleranceMs: number;
  onToleranceChange: (val: number) => void;
  onRunOptimization: () => void;
  onApplyOptimization: () => void;
  onRebalanceEqual: () => void;
  isApplied: boolean;
}

export const MekoDecisionPanel: React.FC<MekoDecisionPanelProps> = ({
  decision,
  latencyToleranceMs,
  onToleranceChange,
  onRunOptimization,
  onApplyOptimization,
  onRebalanceEqual,
  isApplied,
}) => {
  const presets = [
    { value: 5, label: 'Speed First (5ms)', desc: 'Financial/Gaming low-latency SLA' },
    { value: 20, label: 'Balanced (20ms)', desc: 'Standard production tolerance' },
    { value: 50, label: 'Carbon Priority (50ms)', desc: 'Aggressive sustainability mode' },
  ];

  const sourceRegionInfo = decision.sourceRegion ? REGIONS[decision.sourceRegion] : null;
  const targetRegionInfo = decision.targetRegion ? REGIONS[decision.targetRegion] : null;

  const isAccepted = decision.status === 'ACCEPTED';
  const isRejected = decision.status === 'REJECTED';

  return (
    <div className="rounded-2xl bg-zinc-950/80 border border-zinc-800/80 p-5 md:p-6 space-y-6 backdrop-blur-xl">
      {/* Panel Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800/80">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-sm shadow-emerald-500/20">
              <Brain className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">
                  MEKO AI Decision Engine
                </h2>
                <span className="text-[11px] font-mono font-semibold text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2 py-0.5 rounded">
                  RULE-BASED SOLVER
                </span>
              </div>
            </div>
          </div>
          <p className="text-xs text-zinc-400 mt-1 max-w-2xl">
            Autonomous decision engine that solves multi-objective placement: minimizes carbon emissions while guaranteeing client latency remains within SLA constraints.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <button
            onClick={onRebalanceEqual}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-zinc-300 hover:text-white bg-zinc-900 border border-zinc-800 rounded-lg hover:border-zinc-700 transition-colors cursor-pointer"
            title="Reset tablet leaders to equal distribution (16 in each region)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Equalize Distribution</span>
          </button>

          <button
            onClick={onRunOptimization}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-zinc-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow-md shadow-emerald-950/30 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 fill-zinc-950" />
            <span>Run Meko Evaluation</span>
          </button>
        </div>
      </div>

      {/* Latency Tolerance Slider Section */}
      <div className="bg-gradient-to-b from-zinc-900/80 to-zinc-950/90 border border-zinc-800 rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white tracking-wide uppercase">
              HOW MUCH LATENCY CAN YOU TOLERATE TO SAVE CARBON?
            </h3>
          </div>
          <div className="flex items-center gap-2 text-right">
            <span className="text-xs text-zinc-400">Tolerance Budget:</span>
            <span className="text-xl font-bold font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2.5 py-0.5 rounded tabular-nums">
              +{latencyToleranceMs} ms
            </span>
          </div>
        </div>

        {/* Range Slider Track with Visual Zones */}
        <div className="space-y-2 pt-1">
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={latencyToleranceMs}
            onChange={(e) => onToleranceChange(Number(e.target.value))}
            className="w-full h-2.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-400 focus:outline-none"
          />
          <div className="flex justify-between text-[11px] font-mono text-zinc-400 pt-0.5">
            <span className="text-sky-400">0 ms (Strict Speed)</span>
            <span className="text-emerald-400">20 ms (Balanced Default)</span>
            <span className="text-amber-400">50 ms (Carbon Priority)</span>
            <span className="text-purple-400">100 ms (Max Green)</span>
          </div>
        </div>

        {/* Preset Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
          {presets.map((p) => {
            const isSelected = latencyToleranceMs === p.value;
            return (
              <button
                key={p.value}
                onClick={() => onToleranceChange(p.value)}
                className={`text-left p-3 rounded-xl border text-xs transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-950/30 border-emerald-500/50 text-white ring-1 ring-emerald-500/30 shadow-md shadow-emerald-950/30'
                    : 'bg-zinc-950/60 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                }`}
              >
                <div className="font-bold flex items-center justify-between">
                  <span className={isSelected ? 'text-emerald-300' : 'text-white'}>
                    {p.label}
                  </span>
                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                </div>
                <div className="text-zinc-400 text-[11px] mt-1">{p.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Decision Card */}
      <div
        className={`rounded-2xl border p-5 md:p-6 transition-all duration-300 ${
          isAccepted
            ? 'bg-gradient-to-b from-emerald-950/20 via-zinc-900/90 to-zinc-950/95 border-emerald-500/40 shadow-xl shadow-emerald-950/20'
            : isRejected
            ? 'bg-gradient-to-b from-rose-950/20 via-zinc-900/90 to-zinc-950/95 border-rose-500/40 shadow-xl shadow-rose-950/20'
            : 'bg-gradient-to-b from-zinc-900/90 to-zinc-950/95 border-zinc-800/80'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {isAccepted ? (
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <ShieldCheck className="w-6 h-6" />
              </div>
            ) : isRejected ? (
              <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
                <ShieldAlert className="w-6 h-6" />
              </div>
            ) : (
              <div className="p-2 rounded-xl bg-zinc-800 text-zinc-400 border border-zinc-700">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            )}

            <div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                MEKO RECOMMENDATION
              </div>
              <div
                className={`text-lg font-extrabold tracking-tight ${
                  isAccepted
                    ? 'text-emerald-400'
                    : isRejected
                    ? 'text-rose-400'
                    : 'text-zinc-300'
                }`}
              >
                {decision.status === 'ACCEPTED'
                  ? 'RECOMMENDED: SAFE GREEN RELOCATION'
                  : decision.status === 'REJECTED'
                  ? 'REJECTED: LATENCY BUDGET EXCEEDED'
                  : 'EQUILIBRIUM: NO CHANGE RECOMMENDED'}
              </div>
            </div>
          </div>

          <div className="text-xs font-mono text-zinc-400 bg-zinc-950/60 px-3 py-1 rounded-md border border-zinc-800 self-start sm:self-center">
            Evaluated at {decision.calculatedAt}
          </div>
        </div>

        {/* Source -> Target Route Graphic */}
        {decision.sourceRegion && decision.targetRegion && (
          <div className="mt-5 p-4 bg-zinc-950/80 rounded-xl border border-zinc-800/80 flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Source */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              <span className="text-3xl filter drop-shadow">{sourceRegionInfo?.flag}</span>
              <div>
                <div className="text-[11px] uppercase tracking-wider text-zinc-400 font-medium">Source Grid</div>
                <div className="text-base font-bold text-white">
                  {sourceRegionInfo?.name}
                </div>
                <div className="text-xs font-mono text-rose-400 font-semibold">
                  High Carbon Origin
                </div>
              </div>
            </div>

            {/* Migration Vector */}
            <div className="flex flex-col items-center justify-center px-4 py-2 bg-zinc-900/60 rounded-lg border border-zinc-800/60 w-full md:w-auto">
              <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 font-bold">
                <span>Relocate {decision.leadersToMove} Tablet Leaders</span>
                <ArrowRight className="w-4 h-4" />
              </div>
              <div className="text-[11px] text-zinc-400 mt-0.5">
                Non-critical tables (Catalog & Sessions)
              </div>
            </div>

            {/* Target */}
            <div className="flex items-center gap-3 w-full md:w-auto text-right md:flex-row-reverse">
              <span className="text-3xl filter drop-shadow">{targetRegionInfo?.flag}</span>
              <div>
                <div className="text-[11px] uppercase tracking-wider text-zinc-400 font-medium">Target Clean Grid</div>
                <div className="text-base font-bold text-white">
                  {targetRegionInfo?.name}
                </div>
                <div className="text-xs font-mono text-emerald-400 font-semibold">
                  Cleanest Energy
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Metrics Impact Grid */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 bg-zinc-950/70 rounded-xl border border-zinc-800/80">
            <div className="text-[11px] uppercase tracking-wider text-zinc-400 font-medium">Carbon Saved</div>
            <div className="mt-1 text-xl font-black font-mono text-emerald-400 tabular-nums">
              {decision.carbonSavedG > 0 ? `-${decision.carbonSavedG}g` : '0g'}
              <span className="text-xs text-zinc-400 ml-1 font-normal">/ hr</span>
            </div>
            <div className="text-xs text-zinc-400 font-mono mt-0.5">
              {decision.carbonSavedPercent > 0 ? `(-${decision.carbonSavedPercent}% cut)` : 'Baseline'}
            </div>
          </div>

          <div className="p-3.5 bg-zinc-950/70 rounded-xl border border-zinc-800/80">
            <div className="text-[11px] uppercase tracking-wider text-zinc-400 font-medium">Latency Impact</div>
            <div
              className={`mt-1 text-xl font-black font-mono tabular-nums ${
                decision.latencyDeltaMs > decision.toleranceLimitMs ? 'text-rose-400' : 'text-amber-400'
              }`}
            >
              +{decision.latencyDeltaMs} ms
            </div>
            <div className="text-xs text-zinc-400 font-mono mt-0.5">
              Budget: ≤ {decision.toleranceLimitMs} ms
            </div>
          </div>

          <div className="p-3.5 bg-zinc-950/70 rounded-xl border border-zinc-800/80">
            <div className="text-[11px] uppercase tracking-wider text-zinc-400 font-medium">Projected p99</div>
            <div className="mt-1 text-xl font-black font-mono text-white tabular-nums">
              {decision.projectedP99LatencyMs.toFixed(1)} ms
            </div>
            <div className="text-xs text-zinc-400 font-mono mt-0.5">
              Baseline: {decision.currentP99LatencyMs.toFixed(1)} ms
            </div>
          </div>

          <div className="p-3.5 bg-zinc-950/70 rounded-xl border border-zinc-800/80">
            <div className="text-[11px] uppercase tracking-wider text-zinc-400 font-medium">Candidate Tablets</div>
            <div className="mt-1 text-xl font-black font-mono text-white tabular-nums">
              {decision.leadersToMove}
            </div>
            <div className="text-xs text-zinc-400 font-mono mt-0.5">
              RF=3 consensus
            </div>
          </div>
        </div>

        {/* Explanation Rationale Box */}
        <div className="mt-4 p-4 bg-zinc-950/90 rounded-xl border border-zinc-800/90 text-xs text-zinc-300 leading-relaxed">
          <div className="font-bold text-white mb-1.5 flex items-center gap-1.5">
            <Info className="w-4 h-4 text-emerald-400" />
            <span>Meko Optimization Rationale:</span>
          </div>
          {decision.explanation}
        </div>

        {/* Memory Alert Banner if triggered */}
        {decision.memoryFactorsTriggered && decision.memoryFactorsTriggered.length > 0 && (
          <div className="mt-3 p-3.5 bg-amber-950/30 border border-amber-500/40 rounded-xl text-xs text-amber-200 space-y-1 shadow-md">
            <div className="font-bold flex items-center gap-2 text-amber-300">
              <Brain className="w-4 h-4" />
              <span>Meko Memory Factor Applied to Latency Model:</span>
            </div>
            {decision.memoryFactorsTriggered.map((factor, idx) => (
              <p key={idx} className="text-amber-200/90 leading-relaxed pl-6">
                {factor}
              </p>
            ))}
          </div>
        )}

        {/* Apply Action Button Bar */}
        <div className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-zinc-800/80">
          <div className="text-xs text-zinc-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Simulation Sandbox: Relocates virtual leader coordinates without modifying live databases.</span>
          </div>

          <button
            onClick={onApplyOptimization}
            disabled={!isAccepted || isApplied}
            className={`w-full sm:w-auto px-6 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg ${
              !isAccepted
                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700'
                : isApplied
                ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/50 shadow-emerald-950/50'
                : 'bg-emerald-400 hover:bg-emerald-300 text-zinc-950 shadow-emerald-950/50 hover:scale-[1.02]'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>
              {isApplied
                ? 'SIMULATION APPLIED ✓'
                : isAccepted
                ? 'APPLY SIMULATED OPTIMIZATION'
                : 'CANNOT APPLY (REJECTED)'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
