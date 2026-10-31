import { RegionId, RegionInfo, TabletInfo } from '../types';

export const REGIONS: Record<RegionId, RegionInfo> = {
  mumbai: {
    id: 'mumbai',
    name: 'Mumbai',
    country: 'India',
    flag: '🇮🇳',
    code: 'BOM',
    cloudZone: 'ap-south-1',
    basePowerKw: 2.4, // baseline server chassis & peripheral consumption
    gridFuelMix: 'Thermal Coal (68%), Solar (18%), Gas/Hydro (14%)',
    baseElectricityPrice: 78.5,
  },
  frankfurt: {
    id: 'frankfurt',
    name: 'Frankfurt',
    country: 'Germany',
    flag: '🇩🇪',
    code: 'FRA',
    cloudZone: 'eu-central-1',
    basePowerKw: 2.2,
    gridFuelMix: 'Wind/Solar (52%), Biomass (9%), Gas/Lignite (39%)',
    baseElectricityPrice: 95.0,
  },
  virginia: {
    id: 'virginia',
    name: 'N. Virginia',
    country: 'United States',
    flag: '🇺🇸',
    code: 'IAD',
    cloudZone: 'us-east-1',
    basePowerKw: 2.5,
    gridFuelMix: 'Nuclear (38%), Natural Gas (44%), Solar/Renewables (18%)',
    baseElectricityPrice: 52.0,
  },
};

// Inter-regional RTT Matrix (one-way ping / network delay in milliseconds)
export const NETWORK_RTT_MATRIX: Record<RegionId, Record<RegionId, number>> = {
  mumbai: {
    mumbai: 3,
    frankfurt: 112,
    virginia: 184,
  },
  frankfurt: {
    mumbai: 112,
    frankfurt: 4,
    virginia: 76,
  },
  virginia: {
    mumbai: 184,
    frankfurt: 76,
    virginia: 3,
  },
};

// 24-Hour Diurnal Carbon Profile (gCO2 / kWh)
// Hourly carbon curve incorporates solar generation peaks, industrial demand, and peak peaker plants
export const HOURLY_CARBON_PROFILES: Record<RegionId, number[]> = {
  // Mumbai: High reliance on coal baseload; daytime solar softens emissions between 11:00-14:00; evening dinner/cooling spike (17:00-21:00)
  mumbai: [
    590, 580, 570, 565, 570, 595, // 00:00 - 05:00
    610, 590, 570, 550, 520, 505, // 06:00 - 11:00 (550 at 9am, 500 at 12pm)
    500, 510, 530, 560, 580, 600, // 12:00 - 17:00 (600 at 6pm / 18:00)
    625, 630, 615, 610, 600, 595, // 18:00 - 23:00
  ],
  // Frankfurt: Substantial wind/solar penetration. European midday sees huge solar depression (180g at noon).
  frankfurt: [
    320, 310, 305, 300, 310, 330, // 00:00 - 05:00
    350, 340, 320, 300, 240, 200, // 06:00 - 11:00 (300 at 9am)
    180, 190, 215, 260, 310, 350, // 12:00 - 17:00 (180 at 12pm, 350 at 6pm)
    360, 355, 345, 335, 330, 325, // 18:00 - 23:00
  ],
  // Virginia: PJM interconnection; steady nuclear + gas with moderate solar curve
  virginia: [
    380, 375, 370, 370, 385, 410, // 00:00 - 05:00
    420, 415, 410, 400, 375, 360, // 06:00 - 11:00 (400 at 9am)
    350, 345, 355, 370, 395, 420, // 12:00 - 17:00 (350 at 12pm, 420 at 6pm)
    430, 425, 415, 400, 390, 385, // 18:00 - 23:00
  ],
};

// Simulated electricity prices ($/MWh) by hour
export const HOURLY_ELECTRICITY_PRICES: Record<RegionId, number[]> = {
  mumbai: [70, 68, 65, 65, 68, 72, 78, 82, 85, 84, 80, 76, 75, 78, 82, 88, 92, 95, 96, 92, 88, 82, 75, 72],
  frankfurt: [65, 60, 58, 55, 62, 75, 88, 98, 105, 92, 70, 52, 45, 48, 62, 78, 95, 110, 115, 108, 92, 80, 72, 68],
  virginia: [48, 46, 45, 45, 48, 52, 56, 60, 62, 58, 54, 50, 49, 50, 54, 58, 64, 68, 66, 62, 58, 54, 50, 48],
};

// Client traffic distribution by hour (% of global requests originating near each region)
export function getClientTrafficShare(hour: number): Record<RegionId, number> {
  // Peak daytime traffic follows local sun/business hours
  // Mumbai local time is UTC+5.5, Frankfurt is UTC+1, Virginia is UTC-5
  // We model regional user activity weights normalized to sum = 1.0
  if (hour >= 4 && hour < 12) {
    // Asian morning/daytime peak
    return { mumbai: 0.55, frankfurt: 0.30, virginia: 0.15 };
  } else if (hour >= 12 && hour < 18) {
    // European daytime & US morning
    return { mumbai: 0.25, frankfurt: 0.45, virginia: 0.30 };
  } else {
    // US afternoon / evening
    return { mumbai: 0.20, frankfurt: 0.25, virginia: 0.55 };
  }
}

// Initial 48 YugabyteDB Tablet Leaders across 4 critical tables
export const INITIAL_TABLETS: TabletInfo[] = [
  // 12 Checkout & Payment tablets (Latency-Critical)
  ...Array.from({ length: 12 }, (_, i) => ({
    id: `checkout_tbl_t${i + 1}`,
    tableName: 'checkout_ledger',
    keyspace: 'ecommerce_prod',
    leaderRegion: (i < 6 ? 'mumbai' : i < 9 ? 'frankfurt' : 'virginia') as RegionId,
    replicas: ['mumbai', 'frankfurt', 'virginia'] as RegionId[],
    isLatencyCritical: true,
    readsPerSec: 420 + (i * 25),
    writesPerSec: 180 + (i * 15),
  })),

  // 16 User Account & Session tablets (Moderate Latency)
  ...Array.from({ length: 16 }, (_, i) => ({
    id: `session_tbl_t${i + 1}`,
    tableName: 'user_sessions',
    keyspace: 'auth_prod',
    leaderRegion: (i < 6 ? 'mumbai' : i < 11 ? 'frankfurt' : 'virginia') as RegionId,
    replicas: ['mumbai', 'frankfurt', 'virginia'] as RegionId[],
    isLatencyCritical: false,
    readsPerSec: 680 + (i * 30),
    writesPerSec: 120 + (i * 10),
  })),

  // 12 Product Catalog & Inventory tablets (Flexible/Optimizable)
  ...Array.from({ length: 12 }, (_, i) => ({
    id: `catalog_tbl_t${i + 1}`,
    tableName: 'product_catalog',
    keyspace: 'inventory_prod',
    leaderRegion: (i < 5 ? 'mumbai' : i < 9 ? 'frankfurt' : 'virginia') as RegionId,
    replicas: ['mumbai', 'frankfurt', 'virginia'] as RegionId[],
    isLatencyCritical: false,
    readsPerSec: 850 + (i * 40),
    writesPerSec: 60 + (i * 5),
  })),

  // 8 Analytics & Telemetry Log tablets (High write, latency-insensitive)
  ...Array.from({ length: 8 }, (_, i) => ({
    id: `telemetry_tbl_t${i + 1}`,
    tableName: 'event_telemetry',
    keyspace: 'analytics_prod',
    leaderRegion: (i < 3 ? 'mumbai' : i < 6 ? 'frankfurt' : 'virginia') as RegionId,
    replicas: ['mumbai', 'frankfurt', 'virginia'] as RegionId[],
    isLatencyCritical: false,
    readsPerSec: 120 + (i * 10),
    writesPerSec: 450 + (i * 20),
  })),
];

// Baseline initial distribution count:
// Mumbai: 6 + 6 + 5 + 3 = 20 leaders
// Frankfurt: 3 + 5 + 4 + 3 = 15 leaders
// Virginia: 3 + 5 + 3 + 2 = 13 leaders
// Total = 48 leaders
