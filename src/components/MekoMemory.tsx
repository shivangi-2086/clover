import React, { useState } from 'react';
import { MemoryRecord } from '../types';
import {
  Brain,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RotateCcw,
  PlusCircle,
  Search,
  Filter,
  Bookmark,
  Calendar,
} from 'lucide-react';

interface MekoMemoryProps {
  memories: MemoryRecord[];
  onResetMemory: () => void;
  onRestoreSeeds: () => void;
  onAddCustomIncident: (incident: Omit<MemoryRecord, 'id' | 'timestamp'>) => void;
}

export const MekoMemory: React.FC<MekoMemoryProps> = ({
  memories,
  onResetMemory,
  onRestoreSeeds,
  onAddCustomIncident,
}) => {
  const [filter, setFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form state for custom incident injection
  const [newAction, setNewAction] = useState('Relocate 8 Checkout Leaders to Frankfurt');
  const [newHour, setNewHour] = useState(18);
  const [newOutcome, setNewOutcome] = useState<MemoryRecord['outcome']>('LATENCY_SPIKE');
  const [newLesson, setNewLesson] = useState(
    'Moving checkout tablets across regions during local peak transaction windows created unacceptable p99 tail latency (+42ms).'
  );
  const [newLatencyDelta, setNewLatencyDelta] = useState(42.0);

  const filteredMemories = memories.filter((m) => {
    if (filter !== 'ALL' && m.outcome !== filter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        m.action.toLowerCase().includes(q) ||
        m.lessonText.toLowerCase().includes(q) ||
        m.sourceRegion.toLowerCase().includes(q) ||
        m.targetRegion.toLowerCase().includes(q) ||
        m.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const getOutcomeVisual = (outcome: MemoryRecord['outcome']) => {
    switch (outcome) {
      case 'SUCCESS':
        return {
          label: 'OPTIMIZATION SUCCESS',
          badge: 'text-emerald-400 border-emerald-500/30 bg-emerald-950/40',
          icon: CheckCircle2,
        };
      case 'LATENCY_SPIKE':
        return {
          label: 'LATENCY SPIKE RECORDED',
          badge: 'text-rose-400 border-rose-500/30 bg-rose-950/40',
          icon: AlertTriangle,
        };
      case 'REJECTED_BY_BUDGET':
        return {
          label: 'REJECTED BY TOLERANCE',
          badge: 'text-amber-400 border-amber-500/30 bg-amber-950/40',
          icon: XCircle,
        };
      default:
        return {
          label: 'POLICY UPDATE',
          badge: 'text-slate-400 border-slate-700 bg-slate-900',
          icon: Bookmark,
        };
    }
  };

  const handleAddIncident = (e: React.FormEvent) => {
    e.preventDefault();
    onAddCustomIncident({
      simulatedHour: Number(newHour),
      action: newAction,
      sourceRegion: 'mumbai',
      targetRegion: 'frankfurt',
      leadersMoved: 8,
      carbonSavedG: 450,
      latencyDeltaMs: Number(newLatencyDelta),
      observedP99Ms: 76.5,
      outcome: newOutcome,
      lessonText: newLesson,
      tags: ['user_injected', 'learning_feedback'],
    });
    setShowAddModal(false);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Brain className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              MEKO MEMORY & LEARNING
            </h2>
            <span className="text-xs font-mono font-medium text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2 py-0.5 rounded">
              Active Experience Buffer
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Meko remembers previous optimization outcomes, successful migrations, and empirical latency spikes. Past lessons automatically bias future recommendation safety margins.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-400 hover:text-emerald-300 bg-emerald-950/40 border border-emerald-500/30 rounded-lg transition-colors cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Record Incident</span>
          </button>

          <button
            onClick={() => setShowResetConfirm(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-400 hover:text-rose-300 bg-rose-950/20 border border-rose-500/30 rounded-lg transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Memory</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search learned lessons, tables, or regions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-slate-700"
          />
        </div>

        {/* Filter Segmented Control */}
        <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800 overflow-x-auto">
          {[
            { id: 'ALL', label: 'All Records' },
            { id: 'SUCCESS', label: 'Successes' },
            { id: 'LATENCY_SPIKE', label: 'Latency Spikes' },
            { id: 'REJECTED_BY_BUDGET', label: 'Rejected' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                filter === tab.id
                  ? 'bg-slate-800 text-white font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Memory Cards Grid */}
      <div className="space-y-3">
        {filteredMemories.length === 0 ? (
          <div className="text-center py-10 bg-slate-950/40 rounded-xl border border-slate-800/60 p-6">
            <Brain className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-slate-300">No memory records found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              No previous optimization events match your current filter. Run optimizations or inject a test incident to build Meko's knowledge base.
            </p>
            <button
              onClick={onRestoreSeeds}
              className="mt-4 px-3 py-1.5 text-xs font-medium text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 rounded-lg hover:bg-emerald-900/50 transition-colors cursor-pointer"
            >
              Restore Seed Memories
            </button>
          </div>
        ) : (
          filteredMemories.map((mem) => {
            const visual = getOutcomeVisual(mem.outcome);
            const Icon = visual.icon;

            return (
              <div
                key={mem.id}
                className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-4 hover:border-slate-700 transition-all space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded border flex items-center gap-1 ${visual.badge}`}
                    >
                      <Icon className="w-3 h-3" />
                      <span>{visual.label}</span>
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      T+{String(mem.simulatedHour).padStart(2, '0')}:00 UTC
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{mem.timestamp}</span>
                  </div>
                </div>

                {/* Primary Action Description */}
                <div className="text-sm font-semibold text-white">
                  {mem.action}
                </div>

                {/* Lesson & Empirical Insight */}
                <div className="p-3 bg-slate-900/80 border border-slate-800/80 rounded-lg text-xs text-slate-300 leading-relaxed">
                  <span className="font-semibold text-emerald-400">Previous lesson: </span>
                  {mem.lessonText}
                </div>

                {/* Quantitative Footprint */}
                <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400 pt-1">
                  <div>
                    <span>Carbon Delta: </span>
                    <span
                      className={`font-semibold ${
                        mem.carbonSavedG > 0 ? 'text-emerald-400' : 'text-slate-300'
                      }`}
                    >
                      {mem.carbonSavedG > 0 ? `-${mem.carbonSavedG}g` : '0g'}
                    </span>
                  </div>
                  <div>
                    <span>Latency Impact: </span>
                    <span
                      className={`font-semibold ${
                        mem.latencyDeltaMs > 25 ? 'text-rose-400' : 'text-amber-400'
                      }`}
                    >
                      +{mem.latencyDeltaMs}ms
                    </span>
                  </div>
                  <div>
                    <span>Observed p99: </span>
                    <span className="text-white font-semibold">{mem.observedP99Ms}ms</span>
                  </div>
                  <div className="flex items-center gap-1.5 ml-auto">
                    {mem.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-slate-400 bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded text-xs"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Confirmation Modal: Reset Memory */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-rose-400 font-bold">
              <AlertTriangle className="w-5 h-5" />
              <span>Reset Meko Memory Knowledge Base?</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              This will clear all recorded optimization lessons, empirical latency penalties, and history from local storage. Meko will restart with zero historical bias.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white bg-slate-800 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onResetMemory();
                  setShowResetConfirm(false);
                }}
                className="px-4 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-lg cursor-pointer"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Inject Custom Learning Incident */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Brain className="w-4 h-4 text-emerald-400" />
                <span>Inject Optimization Incident into Memory</span>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-500 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddIncident} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Simulated Action</label>
                <input
                  type="text"
                  value={newAction}
                  onChange={(e) => setNewAction(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">Hour (0-23)</label>
                  <input
                    type="number"
                    min="0"
                    max="23"
                    value={newHour}
                    onChange={(e) => setNewHour(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Outcome</label>
                  <select
                    value={newOutcome}
                    onChange={(e) => setNewOutcome(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200"
                  >
                    <option value="LATENCY_SPIKE">LATENCY_SPIKE</option>
                    <option value="SUCCESS">SUCCESS</option>
                    <option value="REJECTED_BY_BUDGET">REJECTED_BY_BUDGET</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Latency Delta (ms)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newLatencyDelta}
                    onChange={(e) => setNewLatencyDelta(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Learned Lesson Text</label>
                <textarea
                  rows={3}
                  value={newLesson}
                  onChange={(e) => setNewLesson(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-slate-400 hover:text-white bg-slate-800 rounded cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded cursor-pointer"
                >
                  Save to Meko Memory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
