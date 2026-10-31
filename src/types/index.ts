export type RegionId = 'mumbai' | 'frankfurt' | 'virginia';

export interface RegionInfo {
  id: RegionId;
  name: string;
  country: string;
  flag: string;
  code: string;
  cloudZone: string;
  basePowerKw: number; // Node baseline server power (kW)
  gridFuelMix: string;
  baseElectricityPrice: number; // $/MWh
}

export interface RegionHourlyData {
  hour: number;
  carbonIntensity: number; // gCO2 / kWh
  electricityPrice: number; // $/MWh
  solarFactor: number;
  windFactor: number;
}

export interface RegionState {
  id: RegionId;
  name: string;
  flag: string;
  code: string;
  cloudZone: string;
  carbonIntensity: number; // gCO2 / kWh
  electricityPrice: number; // $/MWh
  avgNetworkLatencyMs: number; // ms to global clients
  activeLeaders: number; // number of tablet leaders hosted
  totalReplicas: number; // total replicas in this region
  workloadEnergyKwh: number; // calculated hourly energy
  gridFuelMix: string;
  isCleanest: boolean;
}

export interface TabletInfo {
  id: string;
  tableName: string;
  keyspace: string;
  leaderRegion: RegionId;
  replicas: RegionId[];
  isLatencyCritical: boolean; // e.g., checkout/payments vs analytics/catalog
  readsPerSec: number;
  writesPerSec: number;
}

export interface MekoDecision {
  status: 'ACCEPTED' | 'REJECTED' | 'NO_CHANGE';
  sourceRegion: RegionId | null;
  targetRegion: RegionId | null;
  leadersToMove: number;
  candidateTabletIds: string[];
  currentHourlyCarbonG: number;
  projectedHourlyCarbonG: number;
  carbonSavedG: number;
  carbonSavedPercent: number;
  currentP99LatencyMs: number;
  projectedP99LatencyMs: number;
  latencyDeltaMs: number;
  toleranceLimitMs: number;
  explanation: string;
  memoryFactorsTriggered?: string[];
  assumptions: string[];
  calculatedAt: string;
}

export interface MemoryRecord {
  id: string;
  timestamp: string;
  simulatedHour: number;
  action: string;
  sourceRegion: RegionId;
  targetRegion: RegionId;
  leadersMoved: number;
  carbonSavedG: number;
  latencyDeltaMs: number;
  observedP99Ms: number;
  outcome: 'SUCCESS' | 'LATENCY_SPIKE' | 'REJECTED_BY_BUDGET' | 'REVERTED';
  lessonText: string;
  tags: string[];
}

export interface ClusterMetrics {
  hourlyCarbonGrams: number;
  carbonPer1kTxG: number;
  totalCarbonSavedKg: number;
  carbonSavedPercentage: number;
  currentP99LatencyMs: number;
  baselineP99LatencyMs: number;
  totalTransactionsPerHour: number;
  totalLeaders: number;
  optimizationStatus: 'OPTIMIZED' | 'OPPORTUNITY_DETECTED' | 'LATENCY_CONSTRAINED' | 'BALANCING';
}

export interface SimulationState {
  currentHour: number; // 0 to 23
  isPlaying: boolean;
  playbackSpeed: number; // ms per tick
  latencyToleranceMs: number; // 0 to 100 ms
  tablets: TabletInfo[];
  totalSavedCarbonAccumulatedG: number;
  activeOptimization: MekoDecision | null;
  lastAppliedHour: number | null;
}
