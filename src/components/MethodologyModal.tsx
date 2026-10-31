import React from 'react';
import { X, BookOpen, CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';
import { MODEL_CONSTANTS } from '../utils/engine';

interface MethodologyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MethodologyModal: React.FC<MethodologyModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 sm:p-6">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Carbon & Performance Estimation Methodology
              </h2>
              <p className="text-xs text-slate-400">
                Mathematical formulas, energy assumptions, and prototype disclosure
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto text-xs text-slate-300 leading-relaxed">
          {/* Primary Formula Box */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-2">
            <span className="font-mono text-emerald-400 text-xs font-bold uppercase tracking-wider">
              Primary Carbon Equation
            </span>
            <div className="p-3 bg-slate-900 rounded-lg font-mono text-xs text-emerald-300 border border-slate-800">
              Estimated Carbon Emissions (gCO2) = Energy Consumption (kWh) × Carbon Intensity (gCO2/kWh)
            </div>
            <p className="text-slate-400">
              Total cluster emissions represent the sum of regional host energy multiplied by each region&apos;s real-time electricity grid carbon intensity at the simulated hour.
            </p>
          </div>

          {/* Energy Model Breakdown */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Documented Energy Consumption Assumptions</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/80">
                <div className="font-semibold text-white">Base Node Idle Power</div>
                <div className="text-lg font-bold font-mono text-emerald-400 mt-0.5">
                  {MODEL_CONSTANTS.NODE_IDLE_KW} kW
                </div>
                <p className="text-slate-400 text-[11px] mt-1">
                  Chassis, RAM, motherboard, and peripheral power per regional server instance.
                </p>
              </div>

              <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/80">
                <div className="font-semibold text-white">Active Tablet Leader Factor</div>
                <div className="text-lg font-bold font-mono text-indigo-400 mt-0.5">
                  {MODEL_CONSTANTS.KW_PER_ACTIVE_LEADER} kW / leader
                </div>
                <p className="text-slate-400 text-[11px] mt-1">
                  CPU cycles spent coordinating distributed consensus, write locks, and Raft heartbeats.
                </p>
              </div>

              <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/80">
                <div className="font-semibold text-white">Raft Follower Replica Factor</div>
                <div className="text-lg font-bold font-mono text-sky-400 mt-0.5">
                  {MODEL_CONSTANTS.KW_PER_REPLICA} kW / replica
                </div>
                <p className="text-slate-400 text-[11px] mt-1">
                  WAL journal persistence, background compaction, and replication acknowledgements.
                </p>
              </div>

              <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/80">
                <div className="font-semibold text-white">Migration Overhead Penalty</div>
                <div className="text-lg font-bold font-mono text-amber-400 mt-0.5">
                  +{MODEL_CONSTANTS.MIGRATION_ENERGY_OVERHEAD_KWH} kWh / move
                </div>
                <p className="text-slate-400 text-[11px] mt-1">
                  Energy overhead for leader rebalancing handovers and temporary synchronization.
                </p>
              </div>
            </div>
          </div>

          {/* Critical Caveat */}
          <div className="p-3.5 bg-amber-950/25 border border-amber-500/30 rounded-xl space-y-1 text-amber-200">
            <div className="font-bold flex items-center gap-1.5 text-amber-400">
              <AlertCircle className="w-4 h-4" />
              <span>Realistic Energy Physics Caveat:</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Moving tablet leaders does NOT automatically reduce emissions! Relocation consumes transition energy and incurs network transmission round-trips. Meko only recommends a relocation when the grid carbon differential is large enough to exceed the migration energy penalty and client latency limits.
            </p>
          </div>

          {/* Prototype Disclosure */}
          <div className="p-3.5 bg-slate-950/90 border border-slate-800 rounded-xl space-y-1">
            <div className="font-bold text-white flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Hackathon Prototype Transparency Disclosure:</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-400 text-[11px]">
              <li>All grid carbon intensities and electricity prices use illustrative 24-hour diurnal models.</li>
              <li>Calculations are real mathematical functions executing client-side with persistent storage.</li>
              <li>No production database cluster configurations are modified from this demonstration app.</li>
            </ul>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-950 px-6 py-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg cursor-pointer"
          >
            Close Methodology
          </button>
        </div>
      </div>
    </div>
  );
};
