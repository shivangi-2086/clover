import React from 'react';
import { RegionState } from '../types';
import { Sparkles, DollarSign, Wifi, Database, BatteryCharging, Factory, Zap } from 'lucide-react';

interface RegionalMonitorProps {
  regions: RegionState[];
  currentHour: number;
}

export const RegionalMonitor: React.FC<RegionalMonitorProps> = ({
  regions,
  currentHour,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white tracking-tight">
              Regional Grid & Database Telemetry
            </h2>
            <span className="text-[11px] font-mono text-zinc-400 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded">
              SIMULATED DATA · T+{String(currentHour).padStart(2, '0')}:00 UTC
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Real-time tracking of regional electricity carbon intensity, network round-trip delays, and YugabyteDB tablet leader allocation.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {regions.map((region) => {
          const isCleanest = region.isCleanest;
          const carbonPercent = Math.min(100, Math.round((region.carbonIntensity / 700) * 100));

          return (
            <div
              key={region.id}
              className={`relative rounded-2xl border transition-all duration-300 p-5 overflow-hidden backdrop-blur-xl ${
                isCleanest
                  ? 'bg-gradient-to-b from-emerald-950/20 via-zinc-900/90 to-zinc-950/95 border-emerald-500/40 shadow-xl shadow-emerald-950/20 ring-1 ring-emerald-500/30'
                  : 'bg-gradient-to-b from-zinc-900/90 to-zinc-950/95 border-zinc-800/80 hover:border-zinc-700/80'
              }`}
            >
              {/* Top Cleanest Glowing Ribbon */}
              {isCleanest && (
                <div className="absolute top-0 right-0 bg-emerald-400 text-emerald-950 text-[10px] font-extrabold px-3 py-1 rounded-bl-xl shadow-md flex items-center gap-1 uppercase tracking-wider font-mono">
                  <Sparkles className="w-3 h-3 fill-emerald-950" />
                  <span>Cleanest Grid Right Now</span>
                </div>
              )}

              {/* Card Header */}
              <div className="flex items-start justify-between pt-1">
                <div className="flex items-center gap-3">
                  <div className="text-3xl filter drop-shadow-sm" role="img" aria-label={region.name}>
                    {region.flag}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
                      <span>{region.name}</span>
                    </h3>
                    <div className="text-xs font-mono text-zinc-400">
                      {region.cloudZone} · {region.code}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[11px] uppercase tracking-wider text-zinc-400 font-medium">Carbon Intensity</div>
                  <div className="flex items-baseline justify-end gap-1 mt-0.5">
                    <span
                      className={`text-2xl font-black font-mono tabular-nums tracking-tight ${
                        isCleanest ? 'text-emerald-400' : 'text-white'
                      }`}
                    >
                      {region.carbonIntensity}
                    </span>
                    <span className="text-[11px] font-mono text-zinc-400">gCO2/kWh</span>
                  </div>
                </div>
              </div>

              {/* Carbon Intensity Visual Dial/Bar */}
              <div className="mt-4 p-3 bg-zinc-950/70 rounded-xl border border-zinc-800/60">
                <div className="flex justify-between items-center text-xs font-mono mb-1.5">
                  <span className="text-zinc-400">Grid Emissions Level</span>
                  <span
                    className={`font-semibold ${
                      region.carbonIntensity < 250
                        ? 'text-emerald-400'
                        : region.carbonIntensity < 450
                        ? 'text-amber-400'
                        : 'text-rose-400'
                    }`}
                  >
                    {region.carbonIntensity < 250 ? '● Low Carbon Grid' : region.carbonIntensity < 450 ? '▲ Moderate Mix' : '■ High Carbon'}
                  </span>
                </div>

                <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden p-0.5 border border-zinc-800">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      region.carbonIntensity < 250
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-sm shadow-emerald-500/50'
                        : region.carbonIntensity < 450
                        ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                        : 'bg-gradient-to-r from-rose-500 to-red-600'
                    }`}
                    style={{ width: `${carbonPercent}%` }}
                  />
                </div>
              </div>

              {/* Detailed 4-Metric Grid */}
              <div className="mt-4 grid grid-cols-2 gap-2.5">
                {/* Active Leaders */}
                <div className="bg-zinc-950/80 p-2.5 rounded-xl border border-zinc-800/80 flex flex-col justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                    <Database className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="text-[11px] uppercase tracking-wider">Active Leaders</span>
                  </div>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-lg font-bold font-mono text-white tabular-nums">
                      {region.activeLeaders}
                    </span>
                    <span className="text-xs text-zinc-400 font-mono">/ 48</span>
                  </div>
                </div>

                {/* Network Latency */}
                <div className="bg-zinc-950/80 p-2.5 rounded-xl border border-zinc-800/80 flex flex-col justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                    <Wifi className="w-3.5 h-3.5 text-sky-400" />
                    <span className="text-[11px] uppercase tracking-wider">Client Latency</span>
                  </div>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-lg font-bold font-mono text-white tabular-nums">
                      ~{region.avgNetworkLatencyMs}
                    </span>
                    <span className="text-xs text-zinc-400 font-mono">ms</span>
                  </div>
                </div>

                {/* Energy Consumption */}
                <div className="bg-zinc-950/80 p-2.5 rounded-xl border border-zinc-800/80 flex flex-col justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                    <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-[11px] uppercase tracking-wider">Node Power</span>
                  </div>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-lg font-bold font-mono text-white tabular-nums">
                      {region.workloadEnergyKwh.toFixed(2)}
                    </span>
                    <span className="text-xs text-zinc-400 font-mono">kWh/hr</span>
                  </div>
                </div>

                {/* Electricity Price */}
                <div className="bg-zinc-950/80 p-2.5 rounded-xl border border-zinc-800/80 flex flex-col justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                    <DollarSign className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-[11px] uppercase tracking-wider">Spot Price</span>
                  </div>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-lg font-bold font-mono text-white tabular-nums">
                      ${region.electricityPrice}
                    </span>
                    <span className="text-xs text-zinc-400 font-mono">/MWh</span>
                  </div>
                </div>
              </div>

              {/* Grid Fuel Mix Note */}
              <div className="mt-3.5 flex items-start gap-2 text-xs text-zinc-400 bg-zinc-950/50 p-2.5 rounded-lg border border-zinc-800/50">
                <Factory className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
                <span className="truncate text-[11px]" title={region.gridFuelMix}>
                  {region.gridFuelMix}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
