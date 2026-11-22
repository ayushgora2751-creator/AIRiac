/**
 * CPCB (Central Pollution Control Board) National Air Quality Index (NAQI) Calculation Engine.
 * Adheres strictly to official Indian CPCB guidelines (2014) with piecewise linear interpolation:
 * I = I_LO + ((I_HI - I_LO) / (B_HI - B_LO)) * (C - B_LO)
 */

export interface IndexBand {
  iLo: number;
  iHi: number;
  category: string;
  color: string;
}

export const CPCB_INDEX_BANDS: IndexBand[] = [
  { iLo: 0, iHi: 50, category: 'Good', color: '#00B050' },
  { iLo: 51, iHi: 100, category: 'Satisfactory', color: '#92D050' },
  { iLo: 101, iHi: 200, category: 'Moderate', color: '#E5B800' },
  { iLo: 201, iHi: 300, category: 'Poor', color: '#FF7C80' },
  { iLo: 301, iHi: 400, category: 'Very Poor', color: '#C00000' },
  { iLo: 401, iHi: 500, category: 'Severe', color: '#7030A0' },
];

export const CPCB_BREAKPOINTS: Record<string, [number, number][]> = {
  pm25: [
    [0.0, 30.0],
    [30.0, 60.0],
    [60.0, 90.0],
    [90.0, 120.0],
    [120.0, 250.0],
    [250.0, 380.0],
  ],
  pm10: [
    [0.0, 50.0],
    [50.0, 100.0],
    [100.0, 250.0],
    [250.0, 350.0],
    [350.0, 430.0],
    [430.0, 500.0],
  ],
  no2: [
    [0.0, 40.0],
    [40.0, 80.0],
    [80.0, 180.0],
    [180.0, 280.0],
    [280.0, 400.0],
    [400.0, 800.0],
  ],
  so2: [
    [0.0, 40.0],
    [40.0, 80.0],
    [80.0, 380.0],
    [380.0, 800.0],
    [800.0, 1600.0],
    [1600.0, 2400.0],
  ],
  co: [
    [0.0, 1.0],
    [1.0, 2.0],
    [2.0, 10.0],
    [10.0, 17.0],
    [17.0, 34.0],
    [34.0, 50.0],
  ],
  o3: [
    [0.0, 50.0],
    [50.0, 100.0],
    [100.0, 168.0],
    [168.0, 208.0],
    [208.0, 748.0],
    [748.0, 1000.0],
  ],
  nh3: [
    [0.0, 200.0],
    [200.0, 400.0],
    [400.0, 800.0],
    [800.0, 1200.0],
    [1200.0, 1800.0],
    [1800.0, 2400.0],
  ],
  pb: [
    [0.0, 0.5],
    [0.5, 1.0],
    [1.0, 2.0],
    [2.0, 3.0],
    [3.0, 3.5],
    [3.5, 5.0],
  ],
};

/**
 * Calculate the CPCB sub-index for a specific pollutant concentration
 * using piecewise linear interpolation:
 * I = I_LO + ((I_HI - I_LO) / (B_HI - B_LO)) * (C - B_LO)
 */
export function calculateSubIndex(pollutant: string, concentration: number | null | undefined): number | null {
  if (concentration === null || concentration === undefined || isNaN(concentration) || concentration < 0) {
    return null;
  }

  const normKey = pollutant.toLowerCase().replace(/[^a-z0-9]/g, '');
  const breakpoints = CPCB_BREAKPOINTS[normKey];
  if (!breakpoints) {
    return null;
  }

  for (let bandIdx = 0; bandIdx < breakpoints.length; bandIdx++) {
    const [bLo, bHi] = breakpoints[bandIdx];
    const { iLo, iHi } = CPCB_INDEX_BANDS[bandIdx];

    if (bandIdx === 0) {
      if (concentration >= 0 && concentration <= bHi) {
        if (bHi === bLo) return iLo;
        const subIndex = iLo + ((iHi - iLo) / (bHi - bLo)) * (concentration - bLo);
        return Math.max(0, Math.min(500, Math.round(subIndex)));
      }
    } else {
      if (concentration > bLo && concentration <= bHi) {
        const subIndex = iLo + ((iHi - iLo) / (bHi - bLo)) * (concentration - bLo);
        return Math.max(0, Math.min(500, Math.round(subIndex)));
      }
    }
  }

  // If concentration exceeds the highest breakpoint (Severe band upper bound):
  if (concentration > breakpoints[breakpoints.length - 1][1]) {
    return 500;
  }

  return null;
}

/**
 * Given an AQI value, return its category and official hex color
 */
export function getCategoryAndColor(aqi: number): { category: string; color: string } {
  if (aqi <= 50) return { category: 'Good', color: '#00B050' };
  if (aqi <= 100) return { category: 'Satisfactory', color: '#92D050' };
  if (aqi <= 200) return { category: 'Moderate', color: '#E5B800' };
  if (aqi <= 300) return { category: 'Poor', color: '#FF7C80' };
  if (aqi <= 400) return { category: 'Very Poor', color: '#C00000' };
  return { category: 'Severe', color: '#7030A0' };
}

/**
 * Calculate overall NAQI from a map of pollutant concentrations or pollutant items.
 * Overall AQI is the MAXIMUM of all valid sub-indices.
 */
export function calculateOverallAQI(
  pollutants: Record<string, number | { value?: number; concentration?: number }>
): {
  overallAqi: number;
  dominantPollutant: string;
  category: string;
  subIndices: Record<string, number>;
} {
  const subIndices: Record<string, number> = {};
  let maxSubIndex = 0;
  let dominant = 'PM2.5';

  const displayNames: Record<string, string> = {
    pm25: 'PM2.5',
    pm10: 'PM10',
    no2: 'NO2',
    so2: 'SO2',
    co: 'CO',
    o3: 'O3',
    nh3: 'NH3',
    pb: 'Pb',
  };

  for (const [rawKey, item] of Object.entries(pollutants)) {
    const key = rawKey.toLowerCase().replace(/[^a-z0-9]/g, '');
    let conc: number | undefined;

    if (typeof item === 'number') {
      conc = item;
    } else if (item && typeof item === 'object') {
      conc = item.value ?? item.concentration;
    }

    if (conc !== undefined && !isNaN(conc)) {
      const subIdx = calculateSubIndex(key, conc);
      if (subIdx !== null) {
        subIndices[key] = subIdx;
        if (subIdx > maxSubIndex) {
          maxSubIndex = subIdx;
          dominant = displayNames[key] || rawKey.toUpperCase();
        }
      }
    }
  }

  const { category } = getCategoryAndColor(maxSubIndex);

  return {
    overallAqi: maxSubIndex,
    dominantPollutant: dominant,
    category,
    subIndices,
  };
}
