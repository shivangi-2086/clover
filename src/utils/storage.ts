import { MemoryRecord, SimulationState } from '../types';
import { INITIAL_TABLETS } from './carbonData';

const STORAGE_KEYS = {
  SIMULATION: 'clover_simulation_state_v1',
  MEMORY: 'clover_meko_memory_v1',
};

// Seed realistic initial memories that demonstrate Meko's previous learnings
export const SEED_MEMORIES: MemoryRecord[] = [
  {
    id: 'mem_init_01',
    timestamp: '2026-10-28 18:14:02',
    simulatedHour: 18,
    action: 'Migrate 6 Checkout Tablet Leaders Mumbai -> Frankfurt',
    sourceRegion: 'mumbai',
    targetRegion: 'frankfurt',
    leadersMoved: 6,
    carbonSavedG: 480,
    latencyDeltaMs: 44.8,
    observedP99Ms: 78.2,
    outcome: 'LATENCY_SPIKE',
    lessonText:
      'Moving checkout leaders from Mumbai to Frankfurt at 18:00 (peak European + Asian evening transactions) increased p99 latency by ~45ms. Avoid moving latency-critical tables across intercontinental boundaries during peak transaction hours.',
    tags: ['checkout_ledger', 'evening_peak', 'latency_penalty'],
  },
  {
    id: 'mem_init_02',
    timestamp: '2026-10-29 12:05:30',
    simulatedHour: 12,
    action: 'Migrate 10 Catalog & Session Leaders Mumbai -> Frankfurt',
    sourceRegion: 'mumbai',
    targetRegion: 'frankfurt',
    leadersMoved: 10,
    carbonSavedG: 1240,
    latencyDeltaMs: 11.2,
    observedP99Ms: 38.6,
    outcome: 'SUCCESS',
    lessonText:
      'Mid-day European solar surge (180 gCO2/kWh in Frankfurt) yielded 34% carbon reduction on catalog tablets. Network overhead stayed within 12ms tolerance.',
    tags: ['solar_peak', 'catalog', 'high_efficiency'],
  },
  {
    id: 'mem_init_03',
    timestamp: '2026-10-30 08:30:15',
    simulatedHour: 8,
    action: 'Proposed 8 Telemetry Leaders Virginia -> Frankfurt',
    sourceRegion: 'virginia',
    targetRegion: 'frankfurt',
    leadersMoved: 8,
    carbonSavedG: 310,
    latencyDeltaMs: 24.5,
    observedP99Ms: 56.5,
    outcome: 'REJECTED_BY_BUDGET',
    lessonText:
      'Meko rejected relocation under strict 15ms tolerance preset. Estimated carbon saving was insufficient to justify transatlantic transit latency during US morning hours.',
    tags: ['tolerance_limit', 'rejected', 'us_morning'],
  },
];

export const INITIAL_SIM_STATE: SimulationState = {
  currentHour: 12, // Default to noon where solar disparity is clearest
  isPlaying: false,
  playbackSpeed: 2500,
  latencyToleranceMs: 20, // 20ms balanced preset default
  tablets: INITIAL_TABLETS,
  totalSavedCarbonAccumulatedG: 3420,
  activeOptimization: null,
  lastAppliedHour: null,
};

export function loadSimulationState(): SimulationState {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SIMULATION) || localStorage.getItem('ftg_simulation_state_v1');
    if (!raw) return INITIAL_SIM_STATE;
    const parsed = JSON.parse(raw);
    return {
      ...INITIAL_SIM_STATE,
      ...parsed,
      tablets: parsed.tablets && parsed.tablets.length > 0 ? parsed.tablets : INITIAL_TABLETS,
    };
  } catch (e) {
    console.error('Error loading simulation state from storage:', e);
    return INITIAL_SIM_STATE;
  }
}

export function saveSimulationState(state: SimulationState): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SIMULATION, JSON.stringify(state));
  } catch (e) {
    console.error('Error saving simulation state to storage:', e);
  }
}

export function loadMemoryRecords(): MemoryRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MEMORY) || localStorage.getItem('ftg_meko_memory_v1');
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.MEMORY, JSON.stringify(SEED_MEMORIES));
      return SEED_MEMORIES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : SEED_MEMORIES;
  } catch (e) {
    console.error('Error loading memory records from storage:', e);
    return SEED_MEMORIES;
  }
}

export function saveMemoryRecords(records: MemoryRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.MEMORY, JSON.stringify(records));
  } catch (e) {
    console.error('Error saving memory records to storage:', e);
  }
}

export function addMemoryRecord(record: Omit<MemoryRecord, 'id' | 'timestamp'>): MemoryRecord {
  const current = loadMemoryRecords();
  const newRecord: MemoryRecord = {
    ...record,
    id: `mem_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
  };
  const updated = [newRecord, ...current];
  saveMemoryRecords(updated);
  return newRecord;
}

export function clearMemoryRecords(): MemoryRecord[] {
  try {
    localStorage.removeItem(STORAGE_KEYS.MEMORY);
    // When reset, keep clean baseline empty array or seed fresh
    localStorage.setItem(STORAGE_KEYS.MEMORY, JSON.stringify([]));
    return [];
  } catch (e) {
    console.error('Error clearing memory records:', e);
    return [];
  }
}

export function resetToSeedMemory(): MemoryRecord[] {
  try {
    localStorage.setItem(STORAGE_KEYS.MEMORY, JSON.stringify(SEED_MEMORIES));
    return SEED_MEMORIES;
  } catch (e) {
    console.error('Error resetting to seed memory:', e);
    return SEED_MEMORIES;
  }
}
