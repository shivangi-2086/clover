import React, { useState } from 'react';
import { RegionId, TabletInfo } from '../types';
import { REGIONS } from '../utils/carbonData';
import {
  Database,
  Crown,
  Layers,
  Server,
  ShieldCheck,
  Info,
  Terminal,
  Activity,
  CheckCircle2,
} from 'lucide-react';

interface YugabyteClusterViewProps {
  tablets: TabletInfo[];
  currentHour: number;
}

export const YugabyteClusterView: React.FC<YugabyteClusterViewProps> = ({
  tablets,
  currentHour,
}) => {
  const [selectedTableFilter, setSelectedTableFilter] = useState<string>('all');
  const [hoveredTablet, setHoveredTablet] = useState<TabletInfo | null>(null);

  const tableGroups = Array.from(new Set(tablets.map((t) => t.tableName)));

  const filteredTablets =
    selectedTableFilter === 'all'
      ? tablets
      : tablets.filter((t) => t.tableName === selectedTableFilter);

  const regionLeaderCounts: Record<RegionId, number> = {
    mumbai: tablets.filter((t) => t.leaderRegion === 'mumbai').length,
    frankfurt: tablets.filter((t) => t.leaderRegion === 'frankfurt').length,
    virginia: tablets.filter((t) => t.leaderRegion === 'virginia').length,
  };

  return (
    <div className="rounded-2xl bg-zinc-950/80 border border-zinc-800/80 p-5 md:p-6 space-y-6 backdrop-blur-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800/80">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-sm shadow-indigo-500/20">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight uppercase">
                  YUGABYTEDB CLUSTER TOPOLOGY
                </h2>
                <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2 py-0.5 rounded">
                  SIMULATION CONNECTED
                </span>
              </div>
            </div>
          </div>
          <p className="text-xs text-zinc-400 mt-1 max-w-2xl">
            YugabyteDB is the distributed SQL database that manages the actual tablet leaders. Meko is the optimization intelligence that evaluates carbon and performance data and recommends preferred leader placement.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 bg-zinc-900 px-3.5 py-1.5 rounded-xl border border-zinc-800">
          <Server className="w-3.5 h-3.5 text-indigo-400" />
          <span>Cluster: 3 Regions · RF=3 · 48 Tablets</span>
        </div>
      </div>

      {/* Architecture Concept Explainer */}
      <div className="p-4 bg-zinc-900/60 border border-zinc-800/80 rounded-xl text-xs space-y-2 text-zinc-300">
        <div className="flex items-center gap-2 font-bold text-white">
          <Info className="w-4 h-4 text-emerald-400" />
          <span>Understanding YugabyteDB Preferred Leader Placement (Clover Engine):</span>
        </div>
        <p className="leading-relaxed">
          Tables in YugabyteDB are sharded into discrete <strong>Tablets</strong>. With Replication Factor <strong>RF=3</strong>, every tablet maintains 3 synchronous copies (one replica in Mumbai, one in Frankfurt, one in Virginia) with Raft consensus. Data is never moved across regions during optimization; instead, only the <strong>Active Leader</strong> role is transferred using YugabyteDB&apos;s <code className="text-emerald-400 font-mono bg-zinc-950 px-1.5 py-0.5 rounded border border-zinc-800">yb-admin set_preferred_leader_provider</code> policy, safely shifting write coordination compute to cleaner power grids.
        </p>
      </div>

      {/* 3 Distributed Region Nodes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {(['mumbai', 'frankfurt', 'virginia'] as RegionId[]).map((regionId) => {
          const region = REGIONS[regionId];
          const leaderCount = regionLeaderCounts[regionId];
          const percentage = Math.round((leaderCount / tablets.length) * 100);

          return (
            <div
              key={regionId}
              className="bg-gradient-to-b from-zinc-900/90 to-zinc-950/95 border border-zinc-800/80 rounded-2xl p-4 flex flex-col justify-between shadow-lg"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl filter drop-shadow">{region.flag}</span>
                    <div>
                      <h4 className="text-sm font-bold text-white">{region.name}</h4>
                      <div className="text-[11px] font-mono text-zinc-400">
                        {region.cloudZone} · TServer
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-950/40 border border-indigo-500/30 px-2 py-0.5 rounded-md">
                    {leaderCount} Leaders ({percentage}%)
                  </span>
                </div>

                {/* Leader Allocation Bar */}
                <div className="mt-3">
                  <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-sky-400 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>

                {/* Tablet Leader Grid */}
                <div className="mt-4 space-y-1.5">
                  <div className="text-xs font-semibold text-zinc-400 flex items-center justify-between">
                    <span className="text-[11px] uppercase tracking-wider">Active Tablet Leaders:</span>
                    <span className="font-mono text-indigo-400">{leaderCount} active</span>
                  </div>

                  <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-4 gap-1.5 max-h-36 overflow-y-auto p-1.5 bg-zinc-950/70 rounded-xl border border-zinc-800/70">
                    {tablets
                      .filter((t) => t.leaderRegion === regionId)
                      .map((t) => (
                        <div
                          key={t.id}
                          onMouseEnter={() => setHoveredTablet(t)}
                          className="bg-indigo-950/40 border border-indigo-500/30 rounded-md p-1.5 text-center hover:border-emerald-400 hover:scale-105 transition-all cursor-pointer"
                          title={`Tablet: ${t.id} (${t.tableName})\nLeader: ${region.name}\nReads: ${t.readsPerSec}/s, Writes: ${t.writesPerSec}/s`}
                        >
                          <Crown className="w-2.5 h-2.5 text-amber-400 mx-auto" />
                          <div className="text-[10px] font-mono text-zinc-300 truncate mt-0.5">
                            {t.id.replace(/^[a-z]+_tbl_/, '')}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              {/* Replica summary */}
              <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400 font-mono">
                <span className="text-[11px]">Raft Quorum:</span>
                <span className="text-white font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  100% Synced (RF=3)
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tablet Inspector Table */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            <span>Tablet Placement Matrix (Active Sample)</span>
          </div>

          {/* Table filter buttons */}
          <div className="flex items-center gap-1 p-0.5 bg-zinc-900 rounded-xl border border-zinc-800 overflow-x-auto">
            <button
              onClick={() => setSelectedTableFilter('all')}
              className={`px-3 py-1 text-xs rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                selectedTableFilter === 'all'
                  ? 'bg-zinc-800 text-white font-bold shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              All Tables (48)
            </button>
            {tableGroups.map((group) => (
              <button
                key={group}
                onClick={() => setSelectedTableFilter(group)}
                className={`px-3 py-1 text-xs font-mono rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                  selectedTableFilter === group
                    ? 'bg-zinc-800 text-white font-bold shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {group}
              </button>
            ))}
          </div>
        </div>

        {/* Dense Table */}
        <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-950/70">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-900/90 text-zinc-400 uppercase font-mono text-[10px] border-b border-zinc-800">
              <tr>
                <th className="px-4 py-3">Tablet ID</th>
                <th className="px-4 py-3">Table Name</th>
                <th className="px-4 py-3">Keyspace</th>
                <th className="px-4 py-3">Active Leader Region</th>
                <th className="px-4 py-3">Follower Replicas (RF=3)</th>
                <th className="px-4 py-3">SLA Class</th>
                <th className="px-4 py-3 text-right">Throughput</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-mono text-xs">
              {filteredTablets.slice(0, 8).map((tablet) => {
                const leaderInfo = REGIONS[tablet.leaderRegion];

                return (
                  <tr key={tablet.id} className="hover:bg-zinc-900/50 transition-colors">
                    <td className="px-4 py-2.5 text-white font-semibold">
                      {tablet.id}
                    </td>
                    <td className="px-4 py-2.5 text-zinc-300">{tablet.tableName}</td>
                    <td className="px-4 py-2.5 text-zinc-400">{tablet.keyspace}</td>
                    <td className="px-4 py-2.5">
                      <span className="inline-flex items-center gap-1.5 text-emerald-400 font-bold bg-emerald-950/30 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                        <Crown className="w-3 h-3 text-amber-400" />
                        <span>
                          {leaderInfo.flag} {leaderInfo.name}
                        </span>
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-zinc-400">
                      🇮🇳 BOM · 🇩🇪 FRA · 🇺🇸 IAD
                    </td>
                    <td className="px-4 py-2.5">
                      {tablet.isLatencyCritical ? (
                        <span className="text-rose-400 bg-rose-950/30 border border-rose-500/30 px-2 py-0.5 rounded-md text-[11px] font-bold">
                          Latency-Critical
                        </span>
                      ) : (
                        <span className="text-zinc-400 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded-md text-[11px]">
                          Flexible Green
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-right text-zinc-300 font-bold">
                      {tablet.readsPerSec + tablet.writesPerSec} ops/s
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Production Readiness & Safety Disclaimer */}
      <div className="flex items-start gap-3 p-4 bg-zinc-900/60 border border-zinc-800/80 rounded-xl text-xs text-zinc-400">
        <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-bold text-white text-xs">
            Production Safety Boundary
          </div>
          <p>
            In production environments, Meko invokes YugabyteDB Master REST/gRPC APIs to adjust preferred leader weights gradually, ensuring write latencies smoothly settle. Direct cluster configuration modification remains disabled in this hackathon demonstration.
          </p>
        </div>
      </div>
    </div>
  );
};
