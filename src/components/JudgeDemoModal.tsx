import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  CheckCircle2,
  Brain,
  ShieldAlert,
  ArrowRight,
  TrendingDown,
  Layers,
  Clock,
  X,
} from 'lucide-react';

interface JudgeDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJumpToHour: (hour: number) => void;
  onSetTolerance: (val: number) => void;
  onRunOptimization: () => void;
  onApplyOptimization: () => void;
  onNavigateSection: (section: string) => void;
}

interface DemoStep {
  step: number;
  title: string;
  tagline: string;
  durationSec: number;
  explanation: string;
  actionSummary: string;
  targetSection: string;
}

const DEMO_STEPS: DemoStep[] = [
  {
    step: 1,
    title: 'Multi-Region Carbon Divergence',
    tagline: 'Step 1 of 8: Regional Grid Disparity',
    durationSec: 12,
    targetSection: 'regions',
    explanation:
      'We monitor 3 global cloud regions running YugabyteDB. At 12:00 PM UTC, Mumbai relies heavily on coal (500 gCO2/kWh), while Frankfurt is in peak solar production (180 gCO2/kWh) and Virginia sits at 350 gCO2/kWh.',
    actionSummary: 'Simulating 12:00 PM UTC diurnal electricity grid mix.',
  },
  {
    step: 2,
    title: 'Cleanest Region Identification',
    tagline: 'Step 2 of 8: Meko Renewable Detection',
    durationSec: 10,
    targetSection: 'regions',
    explanation:
      'MEKO continuously scans the grid mix. It flags Frankfurt (eu-central-1) as the currently greenest region with an emissions delta of 320 gCO2/kWh relative to Mumbai.',
    actionSummary: 'Frankfurt identified as prime recipient for leader migrations.',
  },
  {
    step: 3,
    title: 'Network & SLA Evaluation',
    tagline: 'Step 3 of 8: Latency Tolerance Budgeting',
    durationSec: 12,
    targetSection: 'optimizer',
    explanation:
      'Meko cannot blindly relocate database leaders—cross-regional network round trips (Mumbai <-> Frankfurt = 112ms) could breach SLAs. The user configured a 20ms latency tolerance.',
    actionSummary: 'Tolerance budget set to 20ms. Meko models client traffic weight.',
  },
  {
    step: 4,
    title: 'Optimal Relocation Recommendation',
    tagline: 'Step 4 of 8: Rule-Based Recommendation',
    durationSec: 12,
    targetSection: 'optimizer',
    explanation:
      'Meko calculates that relocating 10 non-critical Catalog & Session tablet leaders from Mumbai to Frankfurt will save ~1,240g CO2/hr, while predicted p99 latency increases by only +11.2ms—well within the 20ms budget!',
    actionSummary: 'Decision ACCEPTED. Relocation plan generated with math proof.',
  },
  {
    step: 5,
    title: 'Applying Simulated Green Placement',
    tagline: 'Step 5 of 8: Rebalancing Raft Leaders',
    durationSec: 12,
    targetSection: 'cluster',
    explanation:
      'The simulated optimization is applied. YugabyteDB updates its preferred leader policy. Replicas remain in all 3 regions (zero data loss, RF=3), but active write coordination shifts to Frankfurt.',
    actionSummary: '10 tablet leaders shifted from Mumbai to Frankfurt.',
  },
  {
    step: 6,
    title: 'Carbon-Performance Trade-off Realized',
    tagline: 'Step 6 of 8: Real-Time Dynamic Metrics',
    durationSec: 12,
    targetSection: 'overview',
    explanation:
      'The dashboard updates dynamically! Total emissions drop by 28.4%, carbon intensity per 1k transactions declines from 162g to 118g, while p99 latency rises modestly from 28ms to 39ms.',
    actionSummary: 'Measurable carbon reduction achieved within strict SLA envelope.',
  },
  {
    step: 7,
    title: 'Meko Memory Commitment',
    tagline: 'Step 7 of 8: Storing the Decision Memory',
    durationSec: 12,
    targetSection: 'memory',
    explanation:
      'Meko commits this optimization event to its persistent local memory: "12:00 PM: Shifted 10 catalog leaders Mumbai -> Frankfurt, saved 1240g CO2 with +11.2ms latency." This memory persists across browser sessions.',
    actionSummary: 'Knowledge buffer updated with verified successful placement.',
  },
  {
    step: 8,
    title: 'Experience-Based Rejection (Evening Peak)',
    tagline: 'Step 8 of 8: Memory Prevents a Latency Disaster',
    durationSec: 16,
    targetSection: 'optimizer',
    explanation:
      'Simulation advances to 18:00 (evening peak). Meko evaluates moving remaining checkout leaders. BUT Meko recalls a previous recorded memory: checkout moves at 18:00 caused a 45ms latency spike! Meko injects an empirical risk penalty and REJECTS the move to protect production SLAs.',
    actionSummary: 'Meko memory prevented SLA violation! System balanced safely.',
  },
];

export const JudgeDemoModal: React.FC<JudgeDemoModalProps> = ({
  isOpen,
  onClose,
  onJumpToHour,
  onSetTolerance,
  onRunOptimization,
  onApplyOptimization,
  onNavigateSection,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [stepSecondsLeft, setStepSecondsLeft] = useState(DEMO_STEPS[0].durationSec);

  const step = DEMO_STEPS[currentStepIndex];

  // Execute step effects when step changes
  useEffect(() => {
    if (!isOpen) return;

    onNavigateSection(step.targetSection);

    if (step.step === 1 || step.step === 2) {
      onJumpToHour(12);
      onSetTolerance(20);
    } else if (step.step === 3 || step.step === 4) {
      onJumpToHour(12);
      onSetTolerance(20);
      onRunOptimization();
    } else if (step.step === 5 || step.step === 6) {
      onJumpToHour(12);
      onApplyOptimization();
    } else if (step.step === 7) {
      onJumpToHour(12);
    } else if (step.step === 8) {
      onJumpToHour(18); // Jump to evening peak
      onSetTolerance(15); // Stricter tolerance
      onRunOptimization();
    }
  }, [currentStepIndex, isOpen]);

  // Timer loop for auto playback
  useEffect(() => {
    if (!isOpen || !isAutoPlaying) return;

    setStepSecondsLeft(DEMO_STEPS[currentStepIndex].durationSec);

    const interval = setInterval(() => {
      setStepSecondsLeft((prev) => {
        if (prev <= 1) {
          if (currentStepIndex < DEMO_STEPS.length - 1) {
            setCurrentStepIndex((idx) => idx + 1);
            return DEMO_STEPS[currentStepIndex + 1].durationSec;
          } else {
            setIsAutoPlaying(false);
            return 0;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentStepIndex, isAutoPlaying, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 sm:p-6">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Top Bar */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-mono font-semibold text-emerald-400 uppercase tracking-wider">
                Hackathon Presentation Mode
              </div>
              <h2 className="text-base font-bold text-white">
                Clover: Complete Evaluation Demo
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="w-full bg-slate-950 flex border-b border-slate-800">
          {DEMO_STEPS.map((s, idx) => (
            <button
              key={s.step}
              onClick={() => {
                setCurrentStepIndex(idx);
                setStepSecondsLeft(s.durationSec);
              }}
              className={`flex-1 py-2 text-center text-xs font-mono font-bold transition-all border-b-2 cursor-pointer ${
                idx === currentStepIndex
                  ? 'border-emerald-400 bg-emerald-950/40 text-emerald-300'
                  : idx < currentStepIndex
                  ? 'border-emerald-600/40 text-slate-400'
                  : 'border-transparent text-slate-600 hover:text-slate-400'
              }`}
            >
              Step {s.step}
            </button>
          ))}
        </div>

        {/* Step Content */}
        <div className="p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-xs font-mono text-emerald-400 font-semibold uppercase">
              {step.tagline}
            </span>
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <Clock className="w-3.5 h-3.5" />
              <span>
                {isAutoPlaying ? `Auto-advancing in ${stepSecondsLeft}s` : 'Paused'}
              </span>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold text-white tracking-tight">
              {step.title}
            </h3>
            <p className="mt-3 text-sm text-slate-300 leading-relaxed bg-slate-950/70 p-4 rounded-xl border border-slate-800/80">
              {step.explanation}
            </p>
          </div>

          {/* Action Callout */}
          <div className="flex items-center gap-2.5 p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-xs text-emerald-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-mono">
              Live Application State: <strong>{step.actionSummary}</strong>
            </span>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="bg-slate-950 px-6 py-4 border-t border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (currentStepIndex > 0) {
                  setCurrentStepIndex((i) => i - 1);
                }
              }}
              disabled={currentStepIndex === 0}
              className="p-2 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded-lg hover:border-slate-700 transition-colors disabled:opacity-30 cursor-pointer"
              title="Previous Step"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsAutoPlaying(!isAutoPlaying)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                isAutoPlaying
                  ? 'bg-amber-400 text-slate-950 hover:bg-amber-300'
                  : 'bg-emerald-400 text-slate-950 hover:bg-emerald-300'
              }`}
            >
              {isAutoPlaying ? (
                <>
                  <Pause className="w-3.5 h-3.5 fill-slate-950" />
                  <span>Pause Walkthrough</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-slate-950" />
                  <span>Resume Auto-Play</span>
                </>
              )}
            </button>

            <button
              onClick={() => {
                if (currentStepIndex < DEMO_STEPS.length - 1) {
                  setCurrentStepIndex((i) => i + 1);
                }
              }}
              disabled={currentStepIndex === DEMO_STEPS.length - 1}
              className="p-2 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded-lg hover:border-slate-700 transition-colors disabled:opacity-30 cursor-pointer"
              title="Next Step"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            {currentStepIndex === DEMO_STEPS.length - 1 ? (
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow-sm transition-all cursor-pointer"
              >
                Complete Demo & Explore Dashboard
              </button>
            ) : (
              <button
                onClick={() => {
                  setCurrentStepIndex((i) => i + 1);
                }}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
              >
                <span>Next Step</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
