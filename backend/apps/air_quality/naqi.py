"""
Central Pollution Control Board (CPCB) National Air Quality Index (NAQI) Calculation Engine.
Pure Python implementation adhering strictly to official Indian CPCB guidelines (2014)
with piecewise linear interpolation, 3-pollutant validation rule, and prominent pollutant determination.
"""
from typing import Dict, Any, Optional, Tuple

POLLUTANT_DISPLAY_NAMES = {
    'pm25': 'PM2.5',
    'pm10': 'PM10',
    'no2': 'NO2',
    'so2': 'SO2',
    'co': 'CO',
    'o3': 'O3',
    'nh3': 'NH3',
    'pb': 'Pb',
}

# CPCB NAQI Category breakpoints: (I_LO, I_HI, Category, ColorHex)
INDEX_BANDS = [
    (0, 50, 'Good', '#00B050'),
    (51, 100, 'Satisfactory', '#92D050'),
    (101, 200, 'Moderate', '#E5B800'),
    (201, 300, 'Poor', '#FF7C80'),
    (301, 400, 'Very Poor', '#C00000'),
    (401, 500, 'Severe', '#7030A0'),
]

# Breakpoints for each pollutant corresponding to the 6 index bands:
# Each list has 6 tuples: (B_LO, B_HI) corresponding to (0-50, 51-100, 101-200, 201-300, 301-400, 401-500)
# As guided by Challenger 1:
# Severe category has explicit upper breakpoints: B_HI = 380 for PM2.5, B_HI = 500 for PM10, capped at 500.
POLLUTANT_BREAKPOINTS = {
    'pm25': [
        (0.0, 30.0),
        (30.0, 60.0),
        (60.0, 90.0),
        (90.0, 120.0),
        (120.0, 250.0),
        (250.0, 380.0),
    ],
    'pm10': [
        (0.0, 50.0),
        (50.0, 100.0),
        (100.0, 250.0),
        (250.0, 350.0),
        (350.0, 430.0),
        (430.0, 500.0),
    ],
    'no2': [
        (0.0, 40.0),
        (40.0, 80.0),
        (80.0, 180.0),
        (180.0, 280.0),
        (280.0, 400.0),
        (400.0, 800.0),
    ],
    'so2': [
        (0.0, 40.0),
        (40.0, 80.0),
        (80.0, 380.0),
        (380.0, 800.0),
        (800.0, 1600.0),
        (1600.0, 2400.0),
    ],
    'co': [
        (0.0, 1.0),
        (1.0, 2.0),
        (2.0, 10.0),
        (10.0, 17.0),
        (17.0, 34.0),
        (34.0, 50.0),
    ],
    'o3': [
        (0.0, 50.0),
        (50.0, 100.0),
        (100.0, 168.0),
        (168.0, 208.0),
        (208.0, 748.0),
        (748.0, 1000.0),
    ],
    'nh3': [
        (0.0, 200.0),
        (200.0, 400.0),
        (400.0, 800.0),
        (800.0, 1200.0),
        (1200.0, 1800.0),
        (1800.0, 2400.0),
    ],
    'pb': [
        (0.0, 0.5),
        (0.5, 1.0),
        (1.0, 2.0),
        (2.0, 3.0),
        (3.0, 3.5),
        (3.5, 5.0),
    ],
}


def calculate_sub_index(pollutant: str, concentration: float) -> Optional[int]:
    """
    Calculate the CPCB sub-index for a specific pollutant concentration
    using piecewise linear interpolation:
    I = I_LO + ((I_HI - I_LO) / (B_HI - B_LO)) * (C - B_LO)
    """
    if pollutant not in POLLUTANT_BREAKPOINTS or concentration is None or concentration < 0:
        return None

    breakpoints = POLLUTANT_BREAKPOINTS[pollutant]

    for band_idx, (b_lo, b_hi) in enumerate(breakpoints):
        i_lo, i_hi, _, _ = INDEX_BANDS[band_idx]

        # For the first band [0, B_HI], concentration 0 is included
        # For subsequent bands, check if concentration falls within range
        if band_idx == 0:
            if 0.0 <= concentration <= b_hi:
                if b_hi == b_lo:
                    return i_lo
                sub_index = i_lo + ((i_hi - i_lo) / (b_hi - b_lo)) * (concentration - b_lo)
                return max(0, min(500, int(round(sub_index))))
        else:
            if b_lo < concentration <= b_hi:
                sub_index = i_lo + ((i_hi - i_lo) / (b_hi - b_lo)) * (concentration - b_lo)
                return max(0, min(500, int(round(sub_index))))

    # If concentration exceeds the highest breakpoint (Severe band upper bound):
    # Cap sub-index at 500
    if concentration > breakpoints[-1][1]:
        return 500

    return None


def get_category_and_color(aqi: int) -> Tuple[str, str]:
    """Determine the health category and hex color for a given AQI score."""
    if aqi <= 50:
        return 'Good', '#00B050'
    elif aqi <= 100:
        return 'Satisfactory', '#92D050'
    elif aqi <= 200:
        return 'Moderate', '#E5B800'
    elif aqi <= 300:
        return 'Poor', '#FF7C80'
    elif aqi <= 400:
        return 'Very Poor', '#C00000'
    else:
        return 'Severe', '#7030A0'


class NAQICalculator:
    """
    Engine for Indian National Air Quality Index (NAQI) calculation.
    """

    @classmethod
    def calculate(cls, pollutants: Dict[str, Optional[float]]) -> Dict[str, Any]:
        """
        Calculate NAQI score, category, prominent pollutant, and sub-indices.
        Enforces:
        1. Minimum 3 valid pollutants.
        2. At least one must be PM2.5 or PM10.
        """
        sub_indices: Dict[str, int] = {}
        valid_pollutants: Dict[str, float] = {}

        for p_key, p_val in pollutants.items():
            norm_key = p_key.lower().replace('.', '')
            if norm_key in POLLUTANT_BREAKPOINTS and p_val is not None:
                try:
                    val = float(p_val)
                    if val >= 0:
                        valid_pollutants[norm_key] = val
                        idx = calculate_sub_index(norm_key, val)
                        if idx is not None:
                            sub_indices[norm_key] = idx
                except (ValueError, TypeError):
                    continue

        # Rule 1: At least 3 valid pollutants
        # Rule 2: At least one must be PM2.5 or PM10
        has_pm = ('pm25' in valid_pollutants or 'pm10' in valid_pollutants)
        is_valid = len(valid_pollutants) >= 3 and has_pm

        if not is_valid:
            error_reason = []
            if len(valid_pollutants) < 3:
                error_reason.append(f"insufficient pollutants ({len(valid_pollutants)}/3 provided)")
            if not has_pm:
                error_reason.append("neither PM2.5 nor PM10 present")

            return {
                'aqi': None,
                'category': None,
                'category_color': None,
                'prominent_pollutant': None,
                'sub_indices': sub_indices,
                'is_valid': False,
                'error': f"NAQI calculation requires at least 3 valid pollutants, including PM2.5 or PM10. ({'; '.join(error_reason)})",
            }

        # Overall AQI is the maximum of all computed sub-indices, capped at 500
        max_sub = -1
        prominent = None

        for p_key, idx in sub_indices.items():
            if idx > max_sub:
                max_sub = idx
                prominent = POLLUTANT_DISPLAY_NAMES.get(p_key, p_key.upper())

        overall_aqi = min(500, max_sub)
        category, color = get_category_and_color(overall_aqi)

        return {
            'aqi': overall_aqi,
            'category': category,
            'category_color': color,
            'prominent_pollutant': prominent,
            'sub_indices': sub_indices,
            'is_valid': True,
        }


def calculate_naqi(pollutants: Dict[str, Optional[float]]) -> Dict[str, Any]:
    """Functional convenience entrypoint for NAQI calculation."""
    return NAQICalculator.calculate(pollutants)
