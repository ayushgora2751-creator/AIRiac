import { describe, it, expect } from 'vitest';
import {
  calculateSubIndex,
  calculateOverallAQI,
  getCategoryAndColor,
} from '../../utils/cpcbAqi';

describe('CPCB NAQI Calculation Utility', () => {
  describe('calculateSubIndex', () => {
    it('correctly calculates PM2.5 sub-index for 114.8 µg/m³ (Poor band ~283)', () => {
      // 90-120 maps to 201-300
      // 201 + ((300 - 201) / (120 - 90)) * (114.8 - 90) = 201 + 3.3 * 24.8 = 282.84 -> 283
      const subIdx = calculateSubIndex('pm25', 114.8);
      expect(subIdx).toBe(283);
    });

    it('calculates PM2.5 in Good and Satisfactory bands', () => {
      // 0-30 -> 0-50: 15 / 30 * 50 = 25
      expect(calculateSubIndex('pm25', 15.0)).toBe(25);
      // 30-60 -> 51-100: 51 + (49 / 30) * 15 = 51 + 24.5 = 75.5 -> 76
      expect(calculateSubIndex('pm25', 45.0)).toBe(76);
    });

    it('calculates PM2.5 in Moderate and Very Poor bands', () => {
      // 60-90 -> 101-200: 101 + (99 / 30) * 15 = 101 + 49.5 = 150.5 -> 151
      expect(calculateSubIndex('pm25', 75.0)).toBe(151);
      // 120-250 -> 301-400: 185 -> 301 + (99 / 130) * 65 = 301 + 49.5 = 350.5 -> 351
      expect(calculateSubIndex('pm25', 185.0)).toBe(351);
    });

    it('caps sub-index at 500 when concentration exceeds Severe breakpoint', () => {
      expect(calculateSubIndex('pm25', 380.0)).toBe(500);
      expect(calculateSubIndex('pm25', 450.0)).toBe(500);
      expect(calculateSubIndex('pm10', 500.0)).toBe(500);
      expect(calculateSubIndex('pm10', 650.0)).toBe(500);
    });

    it('calculates PM10 and NO2 sub-indices correctly', () => {
      // PM10 at 210: 100-250 -> 101-200: 101 + (99 / 150) * 110 = 101 + 72.6 = 173.6 -> 174
      expect(calculateSubIndex('pm10', 210.0)).toBe(174);
      // NO2 at 59: 40-80 -> 51-100: 51 + (49 / 40) * 19 = 51 + 23.275 = 74.275 -> 74
      expect(calculateSubIndex('no2', 59.0)).toBe(74);
    });

    it('returns null for negative concentrations or unknown pollutants', () => {
      expect(calculateSubIndex('pm25', -10)).toBeNull();
      expect(calculateSubIndex('unknown_gas', 50)).toBeNull();
      expect(calculateSubIndex('pm25', null)).toBeNull();
    });
  });

  describe('getCategoryAndColor', () => {
    it('returns the correct CPCB category and color for each range', () => {
      expect(getCategoryAndColor(45).category).toBe('Good');
      expect(getCategoryAndColor(80).category).toBe('Satisfactory');
      expect(getCategoryAndColor(150).category).toBe('Moderate');
      expect(getCategoryAndColor(250).category).toBe('Poor');
      expect(getCategoryAndColor(350).category).toBe('Very Poor');
      expect(getCategoryAndColor(450).category).toBe('Severe');
    });
  });

  describe('calculateOverallAQI', () => {
    it('determines overall AQI as the maximum of all pollutant sub-indices', () => {
      const pollutants = {
        pm25: 114.8, // sub-index 283
        pm10: 80.0,  // sub-index 80
        no2: 59.0,   // sub-index 74
      };

      const result = calculateOverallAQI(pollutants);
      expect(result.overallAqi).toBe(283);
      expect(result.dominantPollutant).toBe('PM2.5');
      expect(result.category).toBe('Poor');
      expect(result.subIndices.pm25).toBe(283);
      expect(result.subIndices.no2).toBe(74);
    });
  });
});
