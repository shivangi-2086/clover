import React, { useState } from 'react';
import { RegionState, MekoDecision } from '../types';
import { Globe, Activity, ArrowRight, Zap, Shield, Sparkles } from 'lucide-react';

interface NetworkTopologyMapProps {
  regions: RegionState[];
  currentHour: number;
  activeDecision: MekoDecision | null;
  onSelectRegion?: (regionId: string) => void;
}

export const NetworkTopologyMap: React.FC<NetworkTopologyMapProps> = ({
  regions,
  currentHour,
  activeDecision,
}) => {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  // SVG Coordinates for the 3 data centers in a wide projection container
  const nodeCoords: Record<string, { x: number; y: number; label: string; code: string; flag: string }> = {
    virginia: { x: 190, y: 125, label: 'N. Virginia', code: 'us-east-1', flag: '🇺🇸' },
    frankfurt: { x: 500, y: 95, label: 'Frankfurt', code: 'eu-central-1', flag: '🇩🇪' },
    mumbai: { x: 790, y: 155, label: 'Mumbai', code: 'ap-south-1', flag: '🇮🇳' },
  };

  const isMigrating = activeDecision?.status === 'ACCEPTED' && activeDecision.sourceRegion && activeDecision.targetRegion;
  const source = activeDecision?.sourceRegion;
  const target = activeDecision?.targetRegion;

  const getRegionState = (id: string) => regions.find((r) => r.id === id);

  return (
    <div className="relative rounded-2xl bg-zinc-950/80 border border-zinc-800/80 p-5 overflow-hidden backdrop-blur-xl">
      {/* Background Subtle Ambient Glow */}
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 right-10 w-72 h-40 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header of Map Component */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800/70 relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Globe className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-sm font-bold text-white tracking-wide uppercase">
              Global Inter-Region Raft Consensus & Traffic Grid
            </h3>
            <span className="text-[11px] font-mono font-medium text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2 py-0.5 rounded">
              RF=3 MESH · LIVE TOPOLOGY
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Real-time visualization of cross-continental network links, round-trip latencies, and green leader migrations.
          </p>
        </div>

        {/* Live Legend */}
        <div className="flex items-center gap-4 text-xs font-mono text-zinc-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-emerald-500/30" />
            <span>Cleanest Grid</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
            <span>Raft Consensus Link</span>
          </div>
          {isMigrating && (
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <Sparkles className="w-3 h-3" />
              <span>Migration Active</span>
            </div>
          )}
        </div>
      </div>

      {/* Interactive SVG World Wireframe Map & Network Arc Canvas */}
      <div className="relative w-full h-72 sm:h-80 select-none mt-2">
        <svg
          viewBox="0 0 1000 270"
          className="w-full h-full overflow-visible"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* Gradient for standard connections */}
            <linearGradient id="linkGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.3" />
              <stop offset="50%" stopColor="#818cf8" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.3" />
            </linearGradient>

            {/* Gradient for active green migration */}
            <linearGradient id="migrationGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#eab308" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="1" />
            </linearGradient>

            {/* Radial glow filter */}
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Grid Pattern Lines */}
          <g opacity="0.15">
            <line x1="50" y1="60" x2="950" y2="60" stroke="#64748b" strokeDasharray="3 6" />
            <line x1="50" y1="135" x2="950" y2="135" stroke="#64748b" strokeDasharray="3 6" />
            <line x1="50" y1="210" x2="950" y2="210" stroke="#64748b" strokeDasharray="3 6" />
            <line x1="190" y1="30" x2="190" y2="240" stroke="#64748b" strokeDasharray="3 6" />
            <line x1="500" y1="30" x2="500" y2="240" stroke="#64748b" strokeDasharray="3 6" />
            <line x1="790" y1="30" x2="790" y2="240" stroke="#64748b" strokeDasharray="3 6" />
          </g>

          {/* Geodesic Connection Arcs */}
          {/* Arc 1: Virginia <-> Frankfurt (76ms) */}
          <path
            d="M 190 125 Q 345 50 500 95"
            fill="none"
            stroke={source === 'virginia' && target === 'frankfurt' ? 'url(#migrationGradient)' : 'url(#linkGradient)'}
            strokeWidth={source === 'virginia' && target === 'frankfurt' ? '3.5' : '1.5'}
            className={source === 'virginia' && target === 'frankfurt' ? 'animate-dash-wave' : ''}
          />

          {/* Arc 2: Frankfurt <-> Mumbai (112ms) */}
          <path
            d="M 500 95 Q 645 60 790 155"
            fill="none"
            stroke={
              (source === 'mumbai' && target === 'frankfurt') || (source === 'frankfurt' && target === 'mumbai')
                ? 'url(#migrationGradient)'
                : 'url(#linkGradient)'
            }
            strokeWidth={
              (source === 'mumbai' && target === 'frankfurt') || (source === 'frankfurt' && target === 'mumbai')
                ? '3.5'
                : '1.5'
            }
            className={
              (source === 'mumbai' && target === 'frankfurt') || (source === 'frankfurt' && target === 'mumbai')
                ? 'animate-dash-wave'
                : ''
            }
          />

          {/* Arc 3: Virginia <-> Mumbai (184ms) - Transatlantic/Transpacific */}
          <path
            d="M 190 125 Q 490 230 790 155"
            fill="none"
            stroke={
              (source === 'mumbai' && target === 'virginia') || (source === 'virginia' && target === 'mumbai')
                ? 'url(#migrationGradient)'
                : 'url(#linkGradient)'
            }
            strokeWidth={
              (source === 'mumbai' && target === 'virginia') || (source === 'virginia' && target === 'mumbai')
                ? '3.5'
                : '1.2'
            }
            strokeDasharray="4 4"
            opacity="0.6"
          />

          {/* Latency Chips over Connection Arcs */}
          {/* Virginia <-> Frankfurt Latency Badge */}
          <g transform="translate(330, 68)">
            <rect x="0" y="0" width="60" height="18" rx="4" fill="#090d16" stroke="#334155" strokeWidth="1" />
            <text x="30" y="12" fill="#94a3b8" fontSize="10" fontFamily="JetBrains Mono, monospace" textAnchor="middle">
              76 ms RTT
            </text>
          </g>

          {/* Frankfurt <-> Mumbai Latency Badge */}
          <g transform="translate(620, 85)">
            <rect
              x="0"
              y="0"
              width="68"
              height="18"
              rx="4"
              fill={source === 'mumbai' && target === 'frankfurt' ? '#064e3b' : '#090d16'}
              stroke={source === 'mumbai' && target === 'frankfurt' ? '#10b981' : '#334155'}
              strokeWidth="1"
            />
            <text
              x="34"
              y="12"
              fill={source === 'mumbai' && target === 'frankfurt' ? '#34d399' : '#94a3b8'}
              fontSize="10"
              fontFamily="JetBrains Mono, monospace"
              textAnchor="middle"
              fontWeight="bold"
            >
              112 ms RTT
            </text>
          </g>

          {/* Mumbai <-> Virginia Latency Badge */}
          <g transform="translate(460, 205)">
            <rect x="0" y="0" width="68" height="18" rx="4" fill="#090d16" stroke="#334155" strokeWidth="1" opacity="0.8" />
            <text x="34" y="12" fill="#64748b" fontSize="9" fontFamily="JetBrains Mono, monospace" textAnchor="middle">
              184 ms RTT
            </text>
          </g>

          {/* Migration Animated Indicator Badge if active */}
          {isMigrating && source && target && (
            <g transform="translate(615, 115)">
              <rect x="0" y="0" width="135" height="22" rx="6" fill="#022c22" stroke="#10b981" strokeWidth="1.5" filter="url(#glow)" />
              <text x="67" y="15" fill="#a7f3d0" fontSize="10" fontFamily="Plus Jakarta Sans, sans-serif" fontWeight="bold" textAnchor="middle">
                ⚡ SHIFTING LEADERS
              </text>
            </g>
          )}

          {/* Regional Data Center Nodes */}
          {Object.entries(nodeCoords).map(([id, pos]) => {
            const reg = getRegionState(id);
            if (!reg) return null;
            const isCleanest = reg.isCleanest;
            const isTarget = target === id;
            const isSource = source === id;

            return (
              <g
                key={id}
                transform={`translate(${pos.x}, ${pos.y})`}
                className="cursor-pointer group"
                onMouseEnter={() => setHoveredNode(id)}
                onMouseLeave={() => setHoveredNode(null)}
              >
                {/* Outer Pulsing Aura for Cleanest Grid */}
                {isCleanest && (
                  <circle
                    r="34"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                    opacity="0.7"
                    className="animate-spin"
                    style={{ animationDuration: '12s' }}
                  />
                )}

                {/* Node Outer Ring */}
                <circle
                  r="24"
                  fill={isCleanest ? '#064e3b' : isSource ? '#450a0a' : '#0f172a'}
                  stroke={isCleanest ? '#10b981' : isSource ? '#ef4444' : '#38bdf8'}
                  strokeWidth={isCleanest ? '2.5' : '1.5'}
                  filter="url(#glow)"
                />

                {/* Regional Flag Icon Center */}
                <text x="0" y="7" fontSize="18" textAnchor="middle">
                  {pos.flag}
                </text>

                {/* Label Box below Node */}
                <g transform="translate(0, 36)">
                  <rect
                    x="-65"
                    y="0"
                    width="130"
                    height="42"
                    rx="8"
                    fill="#090d16"
                    stroke={isCleanest ? '#10b981' : '#1e293b'}
                    strokeWidth={isCleanest ? '1.5' : '1'}
                  />
                  <text
                    x="0"
                    y="15"
                    fill="#ffffff"
                    fontSize="11"
                    fontFamily="Plus Jakarta Sans, sans-serif"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {pos.label}
                  </text>
                  <text
                    x="0"
                    y="30"
                    fill={isCleanest ? '#34d399' : '#94a3b8'}
                    fontSize="10"
                    fontFamily="JetBrains Mono, monospace"
                    fontWeight="500"
                    textAnchor="middle"
                  >
                    {reg.carbonIntensity} gCO2 · {reg.activeLeaders} LDRS
                  </text>
                </g>

                {/* Top Badge: Cleanest or Leaders */}
                {isCleanest && (
                  <g transform="translate(0, -32)">
                    <rect x="-48" y="0" width="96" height="18" rx="4" fill="#10b981" />
                    <text
                      x="0"
                      y="12"
                      fill="#022c22"
                      fontSize="9"
                      fontFamily="JetBrains Mono, monospace"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      ★ CLEANEST GRID
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Bottom Informational Bar inside Map */}
      <div className="mt-3 pt-3 border-t border-zinc-800/60 flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-400">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            Distributed Quorum: All 3 regions retain 100% data copies (RF=3). Clover relocates write coordinator leaders without data migration risk.
          </span>
        </div>
        <div className="flex items-center gap-2 font-mono text-[11px] text-zinc-400 bg-zinc-900/80 px-2.5 py-1 rounded border border-zinc-800">
          <span>Active Coordinator Protocol: Raft v1.4</span>
        </div>
      </div>
    </div>
  );
};
