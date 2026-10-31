import React, { useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ReferenceLine,
} from 'recharts';
import { Leaf, Activity, ArrowDownRight, Layers, Sparkles } from 'lucide-react';

interface TradeoffChartProps {
  timelineData: Array<{
    hour: number;
    timeLabel: string;
    currentCarbonG: number;
    optimizedCarbonG: number;
    carbonSavingsG: number;
    currentP99Ms: number;
    optimizedP99Ms: number;
  }>;
  currentHour: number;
  carbonPer1kTx: number;
  onSelectHour: (hour: number) => void;
}

export const TradeoffChart: React.FC<TradeoffChartProps> = ({
  timelineData,
  currentHour,
  carbonPer1kTx,
  onSelectHour,
}) => {
  const [activeMetric, setActiveMetric] = useState<'both' | 'carbon' | 'latency'>('both');

  // Calculate day total savings
  const totalDayCurrentCarbonKg =
    timelineData.reduce((acc, d) => acc + d.currentCarbonG, 0) / 1000;
  const totalDayOptimizedCarbonKg =
    timelineData.reduce((acc, d) => acc + d.optimizedCarbonG, 0) / 1000;
  const daySavingsKg = Math.max(0, totalDayCurrentCarbonKg - totalDayOptimizedCarbonKg);
  const daySavingsPercent =
    totalDayCurrentCarbonKg > 0 ? (daySavingsKg / totalDayCurrentCarbonKg) * 100 : 0;

  return (
    <div className="rounded-2xl bg-zinc-950/80 border border-zinc-800/80 p-5 md:p-6 space-y-5 backdrop-blur-xl">
      {/* Header and Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-zinc-800/80">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg font-bold text-white tracking-tight uppercase">
              THE CARBON-PERFORMANCE TRADE-OFF
            </h2>
            <span className="text-[11px] font-mono font-semibold text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2 py-0.5 rounded">
              24-HOUR DIURNAL TIMELINE
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1 max-w-2xl">
            Every optimization decision has a carbon benefit and a performance cost. Meko finds the best balance within your acceptable latency limit.
          </p>
        </div>

        {/* Metric Selector Tabs */}
        <div className="flex items-center gap-1 p-1 bg-zinc-900 rounded-xl border border-zinc-800 self-start lg:self-center">
          <button
            onClick={() => setActiveMetric('both')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeMetric === 'both'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Combined Telemetry
          </button>
          <button
            onClick={() => setActiveMetric('carbon')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeMetric === 'carbon'
                ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30 shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Leaf className="w-3.5 h-3.5 text-emerald-400" />
            <span>Carbon Only</span>
          </button>
          <button
            onClick={() => setActiveMetric('latency')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeMetric === 'latency'
                ? 'bg-sky-950 text-sky-400 border border-sky-500/30 shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-sky-400" />
            <span>p99 Latency</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-1">
        <div className="bg-zinc-900/60 p-3 rounded-xl border border-zinc-800/80">
          <div className="text-[11px] uppercase tracking-wider text-zinc-400 font-medium">Daily Carbon Savings</div>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-xl font-black font-mono text-emerald-400 tabular-nums">
              -{daySavingsKg.toFixed(1)} kg
            </span>
            <span className="text-xs text-emerald-500 font-mono font-semibold">
              (-{daySavingsPercent.toFixed(1)}%)
            </span>
          </div>
        </div>

        <div className="bg-zinc-900/60 p-3 rounded-xl border border-zinc-800/80">
          <div className="text-[11px] uppercase tracking-wider text-zinc-400 font-medium">Carbon / 1k Tx</div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-black font-mono text-white tabular-nums">
              {carbonPer1kTx}
            </span>
            <span className="text-xs text-zinc-400 font-mono">gCO2</span>
          </div>
        </div>

        <div className="bg-zinc-900/60 p-3 rounded-xl border border-zinc-800/80">
          <div className="text-[11px] uppercase tracking-wider text-zinc-400 font-medium">Simulation Hour</div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-black font-mono text-emerald-400 tabular-nums">
              T+{String(currentHour).padStart(2, '0')}:00
            </span>
            <span className="text-xs text-zinc-400 font-mono">UTC</span>
          </div>
        </div>

        <div className="bg-zinc-900/60 p-3 rounded-xl border border-zinc-800/80">
          <div className="text-[11px] uppercase tracking-wider text-zinc-400 font-medium">SLA State</div>
          <div className="flex items-center gap-1.5 mt-1 text-emerald-400 text-xs font-mono font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Optimal Trade-off</span>
          </div>
        </div>
      </div>

      {/* Main Chart Area */}
      <div className="h-80 w-full pt-1">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={timelineData}
            margin={{ top: 10, right: 20, left: 0, bottom: 5 }}
            onClick={(e: any) => {
              if (e && e.activePayload && e.activePayload.length > 0) {
                const hour = e.activePayload[0].payload?.hour;
                if (typeof hour === 'number') {
                  onSelectHour(hour);
                }
              }
            }}
          >
            <defs>
              <linearGradient id="carbonOptimizedGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="carbonBaselineGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#64748b" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#64748b" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
            <XAxis
              dataKey="timeLabel"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#374151' }}
            />
            {/* Left Y-Axis: Carbon emissions (grams CO2) */}
            {(activeMetric === 'both' || activeMetric === 'carbon') && (
              <YAxis
                yAxisId="carbon"
                stroke="#10b981"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                domain={['dataMin - 400', 'dataMax + 400']}
                tickFormatter={(v) => `${(v / 1000).toFixed(1)}k g`}
              />
            )}
            {/* Right Y-Axis: p99 Latency (ms) */}
            {(activeMetric === 'both' || activeMetric === 'latency') && (
              <YAxis
                yAxisId="latency"
                orientation="right"
                stroke="#38bdf8"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                domain={[0, 90]}
                tickFormatter={(v) => `${v}ms`}
              />
            )}

            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-zinc-950/95 border border-zinc-700/80 p-3.5 rounded-xl shadow-2xl text-xs space-y-2 font-mono backdrop-blur-xl">
                      <div className="text-white font-bold border-b border-zinc-800 pb-1 flex items-center justify-between">
                        <span>Time: {label}</span>
                        <span className="text-[10px] text-zinc-400">Click to scrub</span>
                      </div>
                      <div className="flex justify-between gap-5 text-zinc-400">
                        <span>Baseline Carbon:</span>
                        <span className="text-zinc-200">{data.currentCarbonG} gCO2</span>
                      </div>
                      <div className="flex justify-between gap-5 text-emerald-400 font-semibold">
                        <span>Optimized Carbon:</span>
                        <span>{data.optimizedCarbonG} gCO2</span>
                      </div>
                      <div className="flex justify-between gap-5 text-sky-400 font-semibold">
                        <span>Resulting p99:</span>
                        <span>{data.optimizedP99Ms} ms</span>
                      </div>
                      {data.carbonSavingsG > 0 && (
                        <div className="text-emerald-400 font-bold pt-1.5 border-t border-zinc-800 flex items-center justify-between">
                          <span>Carbon Saved:</span>
                          <span>-{data.carbonSavingsG}g CO2/hr</span>
                        </div>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />

            <Legend
              wrapperStyle={{ fontSize: '11px', paddingTop: '12px' }}
              iconType="circle"
            />

            {/* Current Hour Reference Marker */}
            <ReferenceLine
              x={`${String(currentHour).padStart(2, '0')}:00`}
              yAxisId={activeMetric === 'latency' ? 'latency' : 'carbon'}
              stroke="#10b981"
              strokeDasharray="4 4"
              strokeWidth={2}
              label={{
                value: 'CURRENT',
                fill: '#10b981',
                fontSize: 10,
                position: 'top',
                fontWeight: 'bold',
              }}
            />

            {/* Carbon Baseline */}
            {(activeMetric === 'both' || activeMetric === 'carbon') && (
              <Area
                yAxisId="carbon"
                type="monotone"
                dataKey="currentCarbonG"
                name="Baseline Carbon (gCO2)"
                stroke="#64748b"
                strokeDasharray="3 3"
                strokeWidth={1.5}
                fill="url(#carbonBaselineGradient)"
              />
            )}

            {/* Carbon Optimized Area */}
            {(activeMetric === 'both' || activeMetric === 'carbon') && (
              <Area
                yAxisId="carbon"
                type="monotone"
                dataKey="optimizedCarbonG"
                name="Meko Optimized Carbon (gCO2)"
                stroke="#10b981"
                strokeWidth={2.5}
                fill="url(#carbonOptimizedGradient)"
                activeDot={{ r: 6, fill: '#10b981', stroke: '#ffffff', strokeWidth: 2 }}
              />
            )}

            {/* p99 Latency Line */}
            {(activeMetric === 'both' || activeMetric === 'latency') && (
              <Line
                yAxisId="latency"
                type="monotone"
                dataKey="optimizedP99Ms"
                name="Resulting p99 Latency (ms)"
                stroke="#38bdf8"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 6, fill: '#38bdf8', stroke: '#ffffff', strokeWidth: 2 }}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between text-xs text-zinc-400 pt-2 border-t border-zinc-800">
        <span className="flex items-center gap-1.5 text-zinc-400">
          <Layers className="w-3.5 h-3.5" />
          Interactive timeline: Click any point on the chart to scrub the simulation hour.
        </span>
        <span className="font-mono text-zinc-400">
          Workload: 150,000 tx/hr · 48 Tablet Leaders
        </span>
      </div>
    </div>
  );
};
