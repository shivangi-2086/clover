import {
  ClusterMetrics,
  MekoDecision,
  MemoryRecord,
  RegionId,
  RegionState,
  TabletInfo,
} from '../types';
import {
  getClientTrafficShare,
  HOURLY_CARBON_PROFILES,
  HOURLY_ELECTRICITY_PRICES,
  NETWORK_RTT_MATRIX,
  REGIONS,
} from './carbonData';

// Constants for transparent energy modeling
export const MODEL_CONSTANTS = {
  NODE_IDLE_KW: 1.8, // 1.8 kW base power per regional cluster node
  KW_PER_ACTIVE_LEADER: 0.045, // Leader coordination and Raft heartbeats
  KW_PER_REPLICA: 0.015, // Raft follower disk flush and replication
  MIGRATION_ENERGY_OVERHEAD_KWH: 0.02, // Amortized transition rebalance penalty
  TX_PER_HOUR_TOTAL: 150000, // 150k simulated database transactions per hour
  BASE_INTERNAL_LATENCY_MS: 8.5, // Intra-cluster engine query execution time
};

// Calculate hourly energy consumed in a region given active leaders and replicas
export function calculateRegionEnergyKwh(
  regionId: RegionId,
  activeLeaders: number,
  totalReplicas: number,
  migrationCount: number = 0
): number {
  const baseKw = REGIONS[regionId].basePowerKw;
  const leaderEnergy = activeLeaders * MODEL_CONSTANTS.KW_PER_ACTIVE_LEADER;
  const replicaEnergy = totalReplicas * MODEL_CONSTANTS.KW_PER_REPLICA;
  const migrationPenalty = migrationCount * MODEL_CONSTANTS.MIGRATION_ENERGY_OVERHEAD_KWH;
  return Number((baseKw + leaderEnergy + replicaEnergy + migrationPenalty).toFixed(3));
}

// Calculate hourly carbon emissions (in grams CO2) for a region
export function calculateRegionCarbonG(
  regionId: RegionId,
  hour: number,
  energyKwh: number
): number {
  const intensity = HOURLY_CARBON_PROFILES[regionId][hour];
  return Math.round(energyKwh * intensity);
}

// Calculate predicted p99 latency for current tablet placement and hour
export function calculateP99Latency(
  tablets: TabletInfo[],
  hour: number,
  memoryRecords: MemoryRecord[] = []
): { p99Ms: number; memoryPenaltyMs: number; memoryPenaltyNote?: string } {
  const trafficShare = getClientTrafficShare(hour);

  let totalWeightedRtt = 0;
  let totalWeight = 0;

  for (const tablet of tablets) {
    const leaderLoc = tablet.leaderRegion;
    // Calculate network round trip from all client origins to this leader
    let tabletRtt = 0;
    (Object.keys(trafficShare) as RegionId[]).forEach((clientRegion) => {
      const share = trafficShare[clientRegion];
      const rtt = NETWORK_RTT_MATRIX[clientRegion][leaderLoc];
      tabletRtt += share * rtt;
    });

    // Latency-critical tablets (like checkout) have a steeper p99 multiplier
    const criticalityWeight = tablet.isLatencyCritical ? 1.45 : 1.0;
    const writeWeight = tablet.writesPerSec / 100;
    const itemWeight = criticalityWeight * (1 + writeWeight);

    totalWeightedRtt += tabletRtt * itemWeight;
    totalWeight += itemWeight;
  }

  const avgNetworkRtt = totalWeight > 0 ? totalWeightedRtt / totalWeight : 15;
  let p99 = MODEL_CONSTANTS.BASE_INTERNAL_LATENCY_MS + avgNetworkRtt * 0.42;

  // Memory Recall: Check if any previous memory recorded a severe latency spike in this hour or route
  let memoryPenaltyMs = 0;
  let memoryPenaltyNote: string | undefined;

  const relevantMemories = memoryRecords.filter(
    (m) =>
      m.outcome === 'LATENCY_SPIKE' &&
      Math.abs(m.simulatedHour - hour) <= 1
  );

  if (relevantMemories.length > 0) {
    const spike = relevantMemories[0];
    memoryPenaltyMs = 12.5; // Empirical risk adjustment derived from memory
    p99 += memoryPenaltyMs;
    memoryPenaltyNote = `Empirical latency penalty (+${memoryPenaltyMs}ms) factored from past incident: "${spike.action}" at ${spike.simulatedHour}:00.`;
  }

  return {
    p99Ms: Number(p99.toFixed(1)),
    memoryPenaltyMs,
    memoryPenaltyNote,
  };
}

// Build regional states for dashboard cards
export function getRegionalStates(
  hour: number,
  tablets: TabletInfo[]
): RegionState[] {
  const carbonMap: Record<RegionId, number> = {
    mumbai: HOURLY_CARBON_PROFILES.mumbai[hour],
    frankfurt: HOURLY_CARBON_PROFILES.frankfurt[hour],
    virginia: HOURLY_CARBON_PROFILES.virginia[hour],
  };

  const minCarbon = Math.min(...Object.values(carbonMap));
  const trafficShare = getClientTrafficShare(hour);

  return (Object.keys(REGIONS) as RegionId[]).map((id) => {
    const info = REGIONS[id];
    const activeLeaders = tablets.filter((t) => t.leaderRegion === id).length;
    const totalReplicas = tablets.filter((t) => t.replicas.includes(id)).length;
    const energy = calculateRegionEnergyKwh(id, activeLeaders, totalReplicas);

    // Approximate average latency to traffic centers
    const avgLatency = Math.round(
      trafficShare.mumbai * NETWORK_RTT_MATRIX.mumbai[id] +
      trafficShare.frankfurt * NETWORK_RTT_MATRIX.frankfurt[id] +
      trafficShare.virginia * NETWORK_RTT_MATRIX.virginia[id]
    );

    return {
      id,
      name: info.name,
      flag: info.flag,
      code: info.code,
      cloudZone: info.cloudZone,
      carbonIntensity: carbonMap[id],
      electricityPrice: HOURLY_ELECTRICITY_PRICES[id][hour],
      avgNetworkLatencyMs: avgLatency,
      activeLeaders,
      totalReplicas,
      workloadEnergyKwh: energy,
      gridFuelMix: info.gridFuelMix,
      isCleanest: carbonMap[id] === minCarbon,
    };
  });
}

// Calculate cluster-wide KPI metrics
export function calculateClusterMetrics(
  hour: number,
  tablets: TabletInfo[],
  toleranceMs: number,
  accumulatedSavingsKg: number = 0,
  memoryRecords: MemoryRecord[] = []
): ClusterMetrics {
  const regionalStates = getRegionalStates(hour, tablets);
  let totalHourlyCarbonG = 0;

  for (const reg of regionalStates) {
    totalHourlyCarbonG += calculateRegionCarbonG(reg.id, hour, reg.workloadEnergyKwh);
  }

  const { p99Ms } = calculateP99Latency(tablets, hour, memoryRecords);

  // Theoretical default equal placement baseline (16 leaders per region)
  const baselineEnergy =
    calculateRegionEnergyKwh('mumbai', 16, 48) * HOURLY_CARBON_PROFILES.mumbai[hour] +
    calculateRegionEnergyKwh('frankfurt', 16, 48) * HOURLY_CARBON_PROFILES.frankfurt[hour] +
    calculateRegionEnergyKwh('virginia', 16, 48) * HOURLY_CARBON_PROFILES.virginia[hour];

  const hourlySavingsG = Math.max(0, baselineEnergy - totalHourlyCarbonG);
  const carbonSavedPercentage = baselineEnergy > 0 ? (hourlySavingsG / baselineEnergy) * 100 : 0;

  const carbonPer1kTxG = Number(
    ((totalHourlyCarbonG / MODEL_CONSTANTS.TX_PER_HOUR_TOTAL) * 1000).toFixed(1)
  );

  let optimizationStatus: ClusterMetrics['optimizationStatus'] = 'OPTIMIZED';
  const cleanest = regionalStates.find((r) => r.isCleanest);
  const dirtiest = [...regionalStates].sort((a, b) => b.carbonIntensity - a.carbonIntensity)[0];

  if (dirtiest.activeLeaders > 10 && cleanest && cleanest.carbonIntensity < dirtiest.carbonIntensity - 100) {
    optimizationStatus = toleranceMs < 10 ? 'LATENCY_CONSTRAINED' : 'OPPORTUNITY_DETECTED';
  }

  return {
    hourlyCarbonGrams: Math.round(totalHourlyCarbonG),
    carbonPer1kTxG,
    totalCarbonSavedKg: Number((accumulatedSavingsKg + hourlySavingsG / 1000).toFixed(2)),
    carbonSavedPercentage: Number(carbonSavedPercentage.toFixed(1)),
    currentP99LatencyMs: p99Ms,
    baselineP99LatencyMs: 28.5,
    totalTransactionsPerHour: MODEL_CONSTANTS.TX_PER_HOUR_TOTAL,
    totalLeaders: tablets.length,
    optimizationStatus,
  };
}

// MEKO AI Rule-Based Decision Engine
export function evaluateMekoOptimization(
  hour: number,
  tablets: TabletInfo[],
  toleranceLimitMs: number,
  memoryRecords: MemoryRecord[] = []
): MekoDecision {
  const regionalStates = getRegionalStates(hour, tablets);
  const sortedByCleanliness = [...regionalStates].sort((a, b) => a.carbonIntensity - b.carbonIntensity);
  const cleanest = sortedByCleanliness[0];
  const dirtiest = sortedByCleanliness[sortedByCleanliness.length - 1];

  // Current baseline carbon & latency
  let currentHourlyCarbonG = 0;
  for (const reg of regionalStates) {
    currentHourlyCarbonG += calculateRegionCarbonG(reg.id, hour, reg.workloadEnergyKwh);
  }
  const currentLatency = calculateP99Latency(tablets, hour, memoryRecords);

  // If carbon intensity gap is trivial, no change needed
  const carbonDelta = dirtiest.carbonIntensity - cleanest.carbonIntensity;
  if (carbonDelta < 60 || dirtiest.activeLeaders === 0) {
    return {
      status: 'NO_CHANGE',
      sourceRegion: null,
      targetRegion: null,
      leadersToMove: 0,
      candidateTabletIds: [],
      currentHourlyCarbonG,
      projectedHourlyCarbonG: currentHourlyCarbonG,
      carbonSavedG: 0,
      carbonSavedPercent: 0,
      currentP99LatencyMs: currentLatency.p99Ms,
      projectedP99LatencyMs: currentLatency.p99Ms,
      latencyDeltaMs: 0,
      toleranceLimitMs,
      explanation: `Regional carbon intensities are balanced (delta: ${carbonDelta} gCO2/kWh). Leader migration would consume overhead without meaningful carbon abatement.`,
      assumptions: [
        'Inter-region carbon differential < 60 gCO2/kWh threshold.',
        'Current leader allocation is energy-balanced.',
      ],
      calculatedAt: new Date().toLocaleTimeString(),
    };
  }

  // Find candidate leaders to move from dirtiest region to cleanest region
  // Strategy: prioritize non-latency-critical tablets first (catalog, telemetry, sessions)
  const movableCandidates = tablets.filter(
    (t) => t.leaderRegion === dirtiest.id && !t.isLatencyCritical
  );

  // If no non-critical remain, consider critical only if tolerance is very generous (>40ms)
  const candidatePool =
    movableCandidates.length > 0
      ? movableCandidates
      : toleranceLimitMs >= 40
      ? tablets.filter((t) => t.leaderRegion === dirtiest.id)
      : [];

  if (candidatePool.length === 0) {
    return {
      status: 'NO_CHANGE',
      sourceRegion: dirtiest.id,
      targetRegion: cleanest.id,
      leadersToMove: 0,
      candidateTabletIds: [],
      currentHourlyCarbonG,
      projectedHourlyCarbonG: currentHourlyCarbonG,
      carbonSavedG: 0,
      carbonSavedPercent: 0,
      currentP99LatencyMs: currentLatency.p99Ms,
      projectedP99LatencyMs: currentLatency.p99Ms,
      latencyDeltaMs: 0,
      toleranceLimitMs,
      explanation: `All remaining ${dirtiest.name} leaders are marked latency-critical (e.g., checkout ledger). Latency tolerance limit (${toleranceLimitMs}ms) protects transaction SLAs.`,
      assumptions: [
        'Protected partition rule: checkout_ledger tablets reserved to local region.',
      ],
      calculatedAt: new Date().toLocaleTimeString(),
    };
  }

  // Determine optimal batch size (between 6 and 12 leaders)
  const batchCount = Math.min(candidatePool.length, 10);
  const selectedCandidates = candidatePool.slice(0, batchCount);
  const selectedIds = selectedCandidates.map((c) => c.id);

  // Simulate proposed placement
  const simulatedTablets = tablets.map((t) => {
    if (selectedIds.includes(t.id)) {
      return { ...t, leaderRegion: cleanest.id };
    }
    return t;
  });

  // Calculate projected carbon
  const projectedRegionalStates = getRegionalStates(hour, simulatedTablets);
  let projectedHourlyCarbonG = 0;
  for (const reg of projectedRegionalStates) {
    projectedHourlyCarbonG += calculateRegionCarbonG(reg.id, hour, reg.workloadEnergyKwh);
  }
  // Add migration overhead
  projectedHourlyCarbonG += Math.round(
    batchCount * MODEL_CONSTANTS.MIGRATION_ENERGY_OVERHEAD_KWH * cleanest.carbonIntensity
  );

  const carbonSavedG = Math.max(0, currentHourlyCarbonG - projectedHourlyCarbonG);
  const carbonSavedPercent = Number(
    ((carbonSavedG / (currentHourlyCarbonG || 1)) * 100).toFixed(1)
  );

  // Projected Latency
  const projectedLatency = calculateP99Latency(simulatedTablets, hour, memoryRecords);
  let latencyDeltaMs = Number((projectedLatency.p99Ms - currentLatency.p99Ms).toFixed(1));

  // Memory Check for specific risk pattern:
  // Did a previous run at this hour with this source/target cause a spike?
  const memoryAlerts: string[] = [];
  const pastIncident = memoryRecords.find(
    (m) =>
      m.sourceRegion === dirtiest.id &&
      m.targetRegion === cleanest.id &&
      Math.abs(m.simulatedHour - hour) <= 2 &&
      m.outcome === 'LATENCY_SPIKE'
  );

  if (pastIncident) {
    const memoryRiskPenalty = 18.0;
    latencyDeltaMs = Number((latencyDeltaMs + memoryRiskPenalty).toFixed(1));
    memoryAlerts.push(
      `Historical Lesson Recalled: At ${pastIncident.simulatedHour}:00, shifting leaders from ${pastIncident.sourceRegion} to ${pastIncident.targetRegion} caused a ${pastIncident.latencyDeltaMs}ms p99 spike. Applied +${memoryRiskPenalty}ms risk penalty.`
    );
  }

  const isWithinBudget = latencyDeltaMs <= toleranceLimitMs;
  const isAccepted = isWithinBudget && carbonSavedG > 50;

  let explanation = '';
  if (isAccepted) {
    explanation = `${cleanest.name} offers significantly cleaner power (${cleanest.carbonIntensity} gCO2/kWh vs ${dirtiest.carbonIntensity} in ${dirtiest.name}). Moving ${batchCount} tablet leaders saves ~${carbonSavedG}g CO2/hr (-${carbonSavedPercent}%) while latency increase (+${latencyDeltaMs}ms) remains strictly within your ${toleranceLimitMs}ms tolerance.`;
  } else if (!isWithinBudget) {
    explanation = `Rejected proposal: Relocating ${batchCount} tablet leaders from ${dirtiest.name} to ${cleanest.name} would increase p99 latency by +${latencyDeltaMs}ms, exceeding your strict ${toleranceLimitMs}ms tolerance limit. Meko prioritizes client SLA stability.`;
  } else {
    explanation = `Marginal carbon savings (${carbonSavedG}g) do not justify consensus coordination overhead. No migration recommended.`;
  }

  return {
    status: isAccepted ? 'ACCEPTED' : 'REJECTED',
    sourceRegion: dirtiest.id,
    targetRegion: cleanest.id,
    leadersToMove: batchCount,
    candidateTabletIds: selectedIds,
    currentHourlyCarbonG,
    projectedHourlyCarbonG,
    carbonSavedG,
    carbonSavedPercent,
    currentP99LatencyMs: currentLatency.p99Ms,
    projectedP99LatencyMs: Number((currentLatency.p99Ms + latencyDeltaMs).toFixed(1)),
    latencyDeltaMs,
    toleranceLimitMs,
    explanation,
    memoryFactorsTriggered: memoryAlerts.length > 0 ? memoryAlerts : undefined,
    assumptions: [
      `Cleanest grid: ${cleanest.name} (${cleanest.carbonIntensity} gCO2/kWh).`,
      `Highest grid: ${dirtiest.name} (${dirtiest.carbonIntensity} gCO2/kWh).`,
      `Migration rebalance energy overhead: ${batchCount * MODEL_CONSTANTS.MIGRATION_ENERGY_OVERHEAD_KWH} kWh factored in.`,
      `Client traffic distribution at ${hour}:00 accounted for in network RTT.`,
    ],
    calculatedAt: new Date().toLocaleTimeString(),
  };
}

// Generate 24-hour baseline vs optimized time series data for Recharts
export function generate24HourTimelineData(
  tablets: TabletInfo[],
  toleranceMs: number,
  memoryRecords: MemoryRecord[] = []
) {
  const result = [];

  for (let h = 0; h < 24; h++) {
    const formattedHour = `${String(h).padStart(2, '0')}:00`;
    const regionalStates = getRegionalStates(h, tablets);

    // Current emissions for hour h
    let currentCarbonG = 0;
    for (const reg of regionalStates) {
      currentCarbonG += calculateRegionCarbonG(reg.id, h, reg.workloadEnergyKwh);
    }

    const { p99Ms } = calculateP99Latency(tablets, h, memoryRecords);

    // Theoretical optimized state at hour h
    const decision = evaluateMekoOptimization(h, tablets, toleranceMs, memoryRecords);
    const optimizedCarbonG =
      decision.status === 'ACCEPTED' ? decision.projectedHourlyCarbonG : currentCarbonG;
    const optimizedP99Ms =
      decision.status === 'ACCEPTED'
        ? decision.projectedP99LatencyMs
        : p99Ms;

    result.push({
      hour: h,
      timeLabel: formattedHour,
      currentCarbonG: Math.round(currentCarbonG),
      optimizedCarbonG: Math.round(optimizedCarbonG),
      carbonSavingsG: Math.max(0, Math.round(currentCarbonG - optimizedCarbonG)),
      currentP99Ms: p99Ms,
      optimizedP99Ms,
      mumbaiCarbon: HOURLY_CARBON_PROFILES.mumbai[h],
      frankfurtCarbon: HOURLY_CARBON_PROFILES.frankfurt[h],
      virginiaCarbon: HOURLY_CARBON_PROFILES.virginia[h],
    });
  }

  return result;
}
