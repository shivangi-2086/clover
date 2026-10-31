import React from 'react';
import {
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  RefreshCw,
  Clock,
  Sun,
  Moon,
  Sunrise,
  Sunset,
  Zap,
} from 'lucide-react';

interface SimulationControlsProps {
  currentHour: number;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onNextHour: () => void;
  onReplay24h: () => void;
  onResetSimulation: () => void;
  onHourChange: (hour: number) => void;
}

export const SimulationControls: React.FC<SimulationControlsProps> = ({
  currentHour,
  isPlaying,
  onTogglePlay,
  onNextHour,
  onReplay24h,
  onResetSimulation,
  onHourChange,
}) => {
  const getTimeIcon = (hour: number) => {
    if (hour >= 6 && hour < 10) return <Sunrise className="w-4 h-4 text-amber-400" />;
    if (hour >= 10 && hour < 17) return <Sun className="w-4 h-4 text-yellow-400" />;
    if (hour >= 17 && hour < 20) return <Sunset className="w-4 h-4 text-orange-400" />;
    return <Moon className="w-4 h-4 text-indigo-400" />;
  };

  const quickJumpHours = [
    { hour: 9, label: '09:00 AM', desc: 'Morning ramp / Asia daylight peak' },
    { hour: 12, label: '12:00 PM', desc: 'Peak European Solar (Greenest Frankfurt)' },
    { hour: 18, label: '06:00 PM', desc: 'Evening Peak (High Mumbai Coal & Latency Spike)' },
    { hour: 23, label: '11:00 PM', desc: 'Night Grid Baseline' },
  ];

  return (
    <div className="rounded-2xl bg-zinc-950/80 border border-zinc-800/80 p-5 space-y-4 backdrop-blur-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800/80">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800 shadow-sm">
            {getTimeIcon(currentHour)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-wide uppercase">
                24-Hour Diurnal Grid Simulator
              </h3>
              <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/50 border border-emerald-500/30 px-2 py-0.5 rounded">
                SIMULATION DECK
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Simulates dynamic solar generation, peaker gas ramp-up, and regional grid carbon differentials across time.
            </p>
          </div>
        </div>

        {/* Current Time Display */}
        <div className="flex items-center gap-2 bg-zinc-900 px-3.5 py-1.5 rounded-xl border border-zinc-800 self-start sm:self-auto">
          <Clock className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-xs text-zinc-400 font-mono">SIMULATION TIME:</span>
          <span className="text-base font-extrabold font-mono text-emerald-400 tabular-nums">
            {String(currentHour).padStart(2, '0')}:00 UTC
          </span>
        </div>
      </div>

      {/* Primary Timeline Slider */}
      <div className="space-y-1.5 pt-1">
        <div className="flex justify-between items-center text-xs font-mono text-zinc-400">
          <span>00:00 Midnight</span>
          <span className="text-emerald-400 font-bold bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-500/30">
            T+{String(currentHour).padStart(2, '0')}:00
          </span>
          <span>23:00 Night</span>
        </div>
        <input
          type="range"
          min="0"
          max="23"
          step="1"
          value={currentHour}
          onChange={(e) => onHourChange(Number(e.target.value))}
          className="w-full h-2.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-400 focus:outline-none"
        />
      </div>

      {/* Primary Simulator Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-zinc-800/80">
        {/* Playback Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={onTogglePlay}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm ${
              isPlaying
                ? 'bg-amber-400 hover:bg-amber-300 text-zinc-950'
                : 'bg-emerald-400 hover:bg-emerald-300 text-zinc-950 shadow-emerald-950/40'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-zinc-950" />
                <span>PAUSE SIMULATION</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-zinc-950" />
                <span>START SIMULATION</span>
              </>
            )}
          </button>

          <button
            onClick={onNextHour}
            disabled={isPlaying}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-zinc-300 hover:text-white bg-zinc-900 border border-zinc-800 rounded-xl hover:border-zinc-700 transition-colors disabled:opacity-40 cursor-pointer"
            title="Advance timeline by 1 hour"
          >
            <SkipForward className="w-3.5 h-3.5" />
            <span>+1 HOUR</span>
          </button>

          <button
            onClick={onReplay24h}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-zinc-300 hover:text-white bg-zinc-900 border border-zinc-800 rounded-xl hover:border-zinc-700 transition-colors cursor-pointer"
            title="Cycle smoothly through full 24-hour cycle"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>REPLAY 24H</span>
          </button>

          <button
            onClick={onResetSimulation}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-rose-400 hover:text-rose-300 bg-rose-950/20 border border-rose-500/30 rounded-xl transition-colors cursor-pointer"
            title="Reset simulation hour to 12:00 PM"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>RESET</span>
          </button>
        </div>

        {/* Quick Jump Scenario Presets */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-zinc-400 font-mono mr-1">Jump to Event:</span>
          {quickJumpHours.map((preset) => (
            <button
              key={preset.hour}
              onClick={() => onHourChange(preset.hour)}
              className={`px-2.5 py-1 text-xs font-mono rounded-lg border transition-all cursor-pointer ${
                currentHour === preset.hour
                  ? 'bg-emerald-950 text-emerald-400 border-emerald-500/50 font-bold shadow-sm shadow-emerald-950/50'
                  : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white hover:border-zinc-700'
              }`}
              title={preset.desc}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
