import React, { useState, useEffect, useMemo } from 'react';
import {
  SimulationState,
  MemoryRecord,
  MekoDecision,
} from './types';
import {
  loadSimulationState,
  saveSimulationState,
  loadMemoryRecords,
  saveMemoryRecords,
  addMemoryRecord,
  clearMemoryRecords,
  resetToSeedMemory,
} from './utils/storage';
import {
  calculateClusterMetrics,
  getRegionalStates,
  evaluateMekoOptimization,
  generate24HourTimelineData,
} from './utils/engine';
import { INITIAL_TABLETS } from './utils/carbonData';
import { TopNav } from './components/TopNav';
import { KpiMetrics } from './components/KpiMetrics';
import { RegionalMonitor } from './components/RegionalMonitor';
import { NetworkTopologyMap } from './components/NetworkTopologyMap';
import { MekoDecisionPanel } from './components/MekoDecisionPanel';
import { TradeoffChart } from './components/TradeoffChart';
import { MekoMemory } from './components/MekoMemory';
import { SimulationControls } from './components/SimulationControls';
import { YugabyteClusterView } from './components/YugabyteClusterView';
import { JudgeDemoModal } from './components/JudgeDemoModal';
import { MethodologyModal } from './components/MethodologyModal';
import { Sparkles, Activity, ShieldCheck, Database, Layers } from 'lucide-react';

export default function App() {
  // Initialize persistent states
  const [simState, setSimState] = useState<SimulationState>(() => loadSimulationState());
  const [memories, setMemories] = useState<MemoryRecord[]>(() => loadMemoryRecords());

  // UI state
  const [activeSection, setActiveSection] = useState<string>('overview');
  const [isJudgeDemoOpen, setIsJudgeDemoOpen] = useState<boolean>(false);
  const [isMethodologyOpen, setIsMethodologyOpen] = useState<boolean>(false);
  const [isApplied, setIsApplied] = useState<boolean>(false);

  // Sync state to local storage
  useEffect(() => {
    saveSimulationState(simState);
  }, [simState]);

  useEffect(() => {
    saveMemoryRecords(memories);
  }, [memories]);

  // Simulation timer loop
  useEffect(() => {
    if (!simState.isPlaying) return;

    const timer = setInterval(() => {
      setSimState((prev) => {
        const nextHour = (prev.currentHour + 1) % 24;
        return {
          ...prev,
          currentHour: nextHour,
        };
      });
      setIsApplied(false);
    }, simState.playbackSpeed);

    return () => clearInterval(timer);
  }, [simState.isPlaying, simState.playbackSpeed]);

  // Real-time calculations derived from current simulation state
  const regionalStates = useMemo(() => {
    return getRegionalStates(simState.currentHour, simState.tablets);
  }, [simState.currentHour, simState.tablets]);

  const clusterMetrics = useMemo(() => {
    return calculateClusterMetrics(
      simState.currentHour,
      simState.tablets,
      simState.latencyToleranceMs,
      simState.totalSavedCarbonAccumulatedG / 1000,
      memories
    );
  }, [simState.currentHour, simState.tablets, simState.latencyToleranceMs, simState.totalSavedCarbonAccumulatedG, memories]);

  const mekoDecision = useMemo(() => {
    return evaluateMekoOptimization(
      simState.currentHour,
      simState.tablets,
      simState.latencyToleranceMs,
      memories
    );
  }, [simState.currentHour, simState.tablets, simState.latencyToleranceMs, memories]);

  const timelineData = useMemo(() => {
    return generate24HourTimelineData(
      simState.tablets,
      simState.latencyToleranceMs,
      memories
    );
  }, [simState.tablets, simState.latencyToleranceMs, memories]);

  // Handlers
  const handleToleranceChange = (val: number) => {
    setSimState((prev) => ({
      ...prev,
      latencyToleranceMs: val,
    }));
    setIsApplied(false);
  };

  const handleHourChange = (hour: number) => {
    setSimState((prev) => ({
      ...prev,
      currentHour: hour,
    }));
    setIsApplied(false);
  };

  const handleTogglePlay = () => {
    setSimState((prev) => ({
      ...prev,
      isPlaying: !prev.isPlaying,
    }));
  };

  const handleNextHour = () => {
    setSimState((prev) => ({
      ...prev,
      currentHour: (prev.currentHour + 1) % 24,
    }));
    setIsApplied(false);
  };

  const handleReplay24h = () => {
    setSimState((prev) => ({
      ...prev,
      currentHour: 0,
      isPlaying: true,
      playbackSpeed: 1500,
    }));
    setIsApplied(false);
  };

  const handleResetSimulation = () => {
    setSimState((prev) => ({
      ...prev,
      currentHour: 12,
      isPlaying: false,
    }));
    setIsApplied(false);
  };

  const handleApplyOptimization = () => {
    if (mekoDecision.status !== 'ACCEPTED' || !mekoDecision.targetRegion) return;

    const candidateIds = mekoDecision.candidateTabletIds;
    const target = mekoDecision.targetRegion;
    const source = mekoDecision.sourceRegion || 'mumbai';

    // Update tablet placements
    const updatedTablets = simState.tablets.map((t) => {
      if (candidateIds.includes(t.id)) {
        return { ...t, leaderRegion: target };
      }
      return t;
    });

    // Record decision in Meko persistent memory
    addMemoryRecord({
      simulatedHour: simState.currentHour,
      action: `Relocated ${candidateIds.length} Leaders: ${source.toUpperCase()} -> ${target.toUpperCase()}`,
      sourceRegion: source,
      targetRegion: target,
      leadersMoved: candidateIds.length,
      carbonSavedG: mekoDecision.carbonSavedG,
      latencyDeltaMs: mekoDecision.latencyDeltaMs,
      observedP99Ms: mekoDecision.projectedP99LatencyMs,
      outcome: 'SUCCESS',
      lessonText: `Applied green shift at T+${simState.currentHour}:00 UTC. Reduced hourly carbon by ${mekoDecision.carbonSavedG}g (${mekoDecision.carbonSavedPercent}%) while keeping p99 latency increase to +${mekoDecision.latencyDeltaMs}ms within the ${simState.latencyToleranceMs}ms budget.`,
      tags: ['green_relocation', `${source}_to_${target}`, 'optimized'],
    });

    setMemories(loadMemoryRecords());

    setSimState((prev) => ({
      ...prev,
      tablets: updatedTablets,
      totalSavedCarbonAccumulatedG: prev.totalSavedCarbonAccumulatedG + mekoDecision.carbonSavedG,
      lastAppliedHour: prev.currentHour,
    }));

    setIsApplied(true);
  };

  const handleRebalanceEqual = () => {
    setSimState((prev) => ({
      ...prev,
      tablets: INITIAL_TABLETS,
    }));
    setIsApplied(false);
  };

  const handleResetMemory = () => {
    const cleared = clearMemoryRecords();
    setMemories(cleared);
  };

  const handleRestoreSeeds = () => {
    const restored = resetToSeedMemory();
    setMemories(restored);
  };

  const handleAddCustomIncident = (incident: Omit<MemoryRecord, 'id' | 'timestamp'>) => {
    addMemoryRecord(incident);
    setMemories(loadMemoryRecords());
  };

  // Scroll to section helper
  const handleNavigate = (sectionId: string) => {
    setActiveSection(sectionId);
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] text-zinc-100 flex flex-col font-sans selection:bg-emerald-500/20 selection:text-emerald-300">
      {/* Top Navigation */}
      <TopNav
        activeSection={activeSection}
        onNavigate={handleNavigate}
        onOpenJudgeDemo={() => setIsJudgeDemoOpen(true)}
        onOpenMethodology={() => setIsMethodologyOpen(true)}
        currentHour={simState.currentHour}
      />

      {/* Hero Header */}
      <section className="border-b border-zinc-800/80 bg-gradient-to-b from-zinc-950 via-zinc-900/60 to-[#030712] px-4 sm:px-6 lg:px-8 py-8 relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-96 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2.5 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-3 py-0.5 rounded-full shadow-sm">
                Multi-Region Carbon-Aware Database Optimizer
              </span>
              <span className="text-xs font-mono text-zinc-400">
                YugabyteDB · 3 Clouds · RF=3
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
              FOLLOW-THE-GREEN LEADERS
            </h1>
            <p className="text-sm sm:text-base text-zinc-300 font-medium">
              Smarter Database Placement. Lower Carbon. Controlled Latency.
            </p>
            <p className="text-xs text-zinc-400 leading-relaxed pt-0.5">
              MEKO continuously tracks electricity grid carbon intensities across Mumbai, Frankfurt, and Virginia, dynamically relocating YugabyteDB tablet leaders toward cleaner energy while strictly enforcing user-defined p99 latency SLAs.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0">
            <button
              onClick={() => setIsJudgeDemoOpen(true)}
              className="flex items-center justify-center gap-2 px-5 py-3 text-xs font-bold text-zinc-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl shadow-lg shadow-emerald-950/40 transition-all cursor-pointer hover:scale-[1.02]"
            >
              <Sparkles className="w-4 h-4 fill-zinc-950" />
              <span>START JUDGE DEMO (8 STEPS)</span>
            </button>

            <div className="flex items-center justify-between sm:justify-start gap-3 bg-zinc-900/90 border border-zinc-800 rounded-xl p-3 text-xs backdrop-blur-md">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-mono text-zinc-300 font-semibold">
                  SIMULATION ACTIVE
                </span>
              </div>
              <span className="text-zinc-400 font-mono">
                T+{String(simState.currentHour).padStart(2, '0')}:00 UTC
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Viewport Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 flex-1 w-full">
        {/* KPI Cards Strip */}
        <section id="overview" className="scroll-mt-24 space-y-3">
          <KpiMetrics metrics={clusterMetrics} />
        </section>

        {/* Global Network Topology Map */}
        <section id="topology" className="scroll-mt-24 space-y-3">
          <NetworkTopologyMap
            regions={regionalStates}
            currentHour={simState.currentHour}
            activeDecision={mekoDecision}
          />
        </section>

        {/* 24-Hour Simulation Controls Toolbar */}
        <section className="space-y-3">
          <SimulationControls
            currentHour={simState.currentHour}
            isPlaying={simState.isPlaying}
            onTogglePlay={handleTogglePlay}
            onNextHour={handleNextHour}
            onReplay24h={handleReplay24h}
            onResetSimulation={handleResetSimulation}
            onHourChange={handleHourChange}
          />
        </section>

        {/* Regional Grid Monitors */}
        <section id="regions" className="scroll-mt-24 space-y-3">
          <RegionalMonitor
            regions={regionalStates}
            currentHour={simState.currentHour}
          />
        </section>

        {/* Meko AI Decision Engine & Interactive Latency Slider */}
        <section id="optimizer" className="scroll-mt-24 space-y-3">
          <MekoDecisionPanel
            decision={mekoDecision}
            latencyToleranceMs={simState.latencyToleranceMs}
            onToleranceChange={handleToleranceChange}
            onRunOptimization={() => setIsApplied(false)}
            onApplyOptimization={handleApplyOptimization}
            onRebalanceEqual={handleRebalanceEqual}
            isApplied={isApplied}
          />
        </section>

        {/* The Carbon-Performance Trade-off Dynamic Chart */}
        <section id="tradeoff" className="scroll-mt-24 space-y-3">
          <TradeoffChart
            timelineData={timelineData}
            currentHour={simState.currentHour}
            carbonPer1kTx={clusterMetrics.carbonPer1kTxG}
            onSelectHour={handleHourChange}
          />
        </section>

        {/* Meko Memory & Learning Section */}
        <section id="memory" className="scroll-mt-24 space-y-3">
          <MekoMemory
            memories={memories}
            onResetMemory={handleResetMemory}
            onRestoreSeeds={handleRestoreSeeds}
            onAddCustomIncident={handleAddCustomIncident}
          />
        </section>

        {/* YugabyteDB Cluster Architecture & Placement Topology */}
        <section id="cluster" className="scroll-mt-24 space-y-3">
          <YugabyteClusterView
            tablets={simState.tablets}
            currentHour={simState.currentHour}
          />
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-[#030712] px-4 sm:px-6 lg:px-8 py-8 text-xs text-zinc-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-zinc-300">FOLLOW-THE-GREEN LEADERS</span>
            <span>·</span>
            <span>AI Decision Assistant: MEKO</span>
            <span>·</span>
            <span className="text-emerald-400 font-mono">Hackathon Prototype</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMethodologyOpen(true)}
              className="hover:text-zinc-300 transition-colors cursor-pointer"
            >
              Methodology & Formulas
            </button>
            <span>·</span>
            <button
              onClick={() => setIsJudgeDemoOpen(true)}
              className="text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer font-bold"
            >
              Run Judge Demo
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <JudgeDemoModal
        isOpen={isJudgeDemoOpen}
        onClose={() => setIsJudgeDemoOpen(false)}
        onJumpToHour={handleHourChange}
        onSetTolerance={handleToleranceChange}
        onRunOptimization={() => setIsApplied(false)}
        onApplyOptimization={handleApplyOptimization}
        onNavigateSection={handleNavigate}
      />

      <MethodologyModal
        isOpen={isMethodologyOpen}
        onClose={() => setIsMethodologyOpen(false)}
      />
    </div>
  );
}
