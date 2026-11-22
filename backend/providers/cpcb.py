"""
Mock Central Pollution Control Board (CPCB) CAAQMS Data Provider for Chandigarh.
Generates deterministic, time-seeded air quality observations using realistic diurnal atmospheric curves
with zero external network dependencies.
"""
import json
import math
from datetime import datetime, timezone, timedelta
from pathlib import Path
from typing import Dict, Any, List, Optional

from apps.air_quality.naqi import calculate_naqi, calculate_sub_index
from providers.base import BaseDataProvider

FIXTURE_PATH = Path(__file__).resolve().parent / 'fixtures' / 'chandigarh_stations.json'


class MockCPCBProvider(BaseDataProvider):
    """
    Deterministic mock provider simulating Chandigarh CAAQMS monitoring stations.
    Follows Indo-Gangetic boundary layer diurnal physics:
    - High concentrations during morning (07:00-09:00) and evening (19:00-22:00) ground inversions.
    - Dilution during mid-day boundary layer convective expansion (13:00-16:00).
    - Ozone photochemical peak in afternoon (14:00-16:00).
    """

    def __init__(self, fixture_path: Optional[Path] = None):
        path = fixture_path or FIXTURE_PATH
        with open(path, 'r', encoding='utf-8') as f:
            self.stations_data = json.load(f)
        self.stations_by_code = {s['code']: s for s in self.stations_data}

    def _get_diurnal_factor(self, dt: datetime) -> float:
        """Calculates diurnal scaling multiplier based on hour of day (0.75 to 1.35)."""
        hour = dt.hour + (dt.minute / 60.0)
        # Dual-peak curve: peaks at ~8.0h and ~20.0h, dip at ~14.0h
        # Using harmonic sum
        base_curve = 0.25 * math.cos((hour - 8.0) * math.pi / 6.0)
        evening_bump = 0.15 * math.exp(-0.5 * ((hour - 20.0) / 2.5) ** 2)
        factor = 1.0 + base_curve + evening_bump
        return max(0.65, min(1.45, factor))

    def _generate_observation(self, station: Dict[str, Any], dt: datetime) -> Dict[str, Any]:
        """Generates deterministic pollutant readings for a specific station and time."""
        factor = self._get_diurnal_factor(dt)
        base_pm25 = station.get('base_pm25', 80.0)
        base_pm10 = station.get('base_pm10', 145.0)

        # Hour of day influences ozone photochemistry
        hour = dt.hour
        o3_factor = max(0.2, math.sin(max(0, (hour - 6)) * math.pi / 14.0))

        pm25 = round(base_pm25 * factor, 1)
        pm10 = round(base_pm10 * factor, 1)
        no2 = round(42.0 * factor, 1)
        so2 = round(14.0 * (0.9 + 0.2 * factor), 1)
        co = round(0.85 * factor, 1)
        o3 = round(15.0 + 45.0 * o3_factor, 1)
        nh3 = round(32.0 * factor, 1)
        pb = round(0.35 * factor, 2)

        pollutants_input = {
            'pm25': pm25,
            'pm10': pm10,
            'no2': no2,
            'so2': so2,
            'co': co,
            'o3': o3,
            'nh3': nh3,
            'pb': pb,
        }

        naqi_res = calculate_naqi(pollutants_input)

        sub_indices = naqi_res.get('sub_indices', {})
        pollutants_dict = {
            'pm25': {'concentration': pm25, 'unit': 'µg/m³', 'sub_index': sub_indices.get('pm25')},
            'pm10': {'concentration': pm10, 'unit': 'µg/m³', 'sub_index': sub_indices.get('pm10')},
            'no2': {'concentration': no2, 'unit': 'µg/m³', 'sub_index': sub_indices.get('no2')},
            'so2': {'concentration': so2, 'unit': 'µg/m³', 'sub_index': sub_indices.get('so2')},
            'co': {'concentration': co, 'unit': 'mg/m³', 'sub_index': sub_indices.get('co')},
            'o3': {'concentration': o3, 'unit': 'µg/m³', 'sub_index': sub_indices.get('o3')},
            'nh3': {'concentration': nh3, 'unit': 'µg/m³', 'sub_index': sub_indices.get('nh3')},
            'pb': {'concentration': pb, 'unit': 'µg/m³', 'sub_index': sub_indices.get('pb')},
        }

        return {
            'station_code': station['code'],
            'station_name': station['name'],
            'location': {
                'latitude': station['latitude'],
                'longitude': station['longitude'],
            },
            'timestamp': dt.strftime('%Y-%m-%dT%H:%M:%SZ'),
            'aqi': naqi_res['aqi'],
            'category': naqi_res['category'],
            'category_color': naqi_res['category_color'],
            'prominent_pollutant': naqi_res['prominent_pollutant'],
            'sub_indices': sub_indices,
            'pollutants': pollutants_dict,
        }

    def fetch_current(self, station_code: str) -> Dict[str, Any]:
        """Fetch latest pollutant observations for a specific CAAQMS station."""
        station = self.stations_by_code.get(station_code)
        if not station:
            station = self.stations_data[0]
        now = datetime.now(timezone.utc)
        return self._generate_observation(station, now)

    def fetch_historical(self, station_code: str, days: int = 7) -> List[Dict[str, Any]]:
        """Fetch historical daily/hourly pollutant observations."""
        station = self.stations_by_code.get(station_code, self.stations_data[0])
        now = datetime.now(timezone.utc)
        results = []
        for i in range(days * 24):
            dt = now - timedelta(hours=i)
            results.append(self._generate_observation(station, dt))
        return results

    def fetch_hourly_series(self, station_code: str, hours: int = 24) -> List[Dict[str, Any]]:
        """Fetch simplified hourly series for dashboard trend charts."""
        station = self.stations_by_code.get(station_code, self.stations_data[0])
        now = datetime.now(timezone.utc)
        series = []
        for h in range(hours, 0, -1):
            dt = now - timedelta(hours=h)
            obs = self._generate_observation(station, dt)
            series.append({
                'timestamp': obs['timestamp'],
                'aqi': obs['aqi'],
                'pm25': obs['pollutants']['pm25']['concentration'],
                'pm10': obs['pollutants']['pm10']['concentration'],
                'no2': obs['pollutants']['no2']['concentration'],
            })
        return series

    def get_latest_summary(self, station_filter: Optional[str] = None) -> Dict[str, Any]:
        """Returns city-wide summary and all reporting stations' latest observations."""
        now = datetime.now(timezone.utc)
        station_readings = []
        total_aqi = 0

        target_stations = (
            [self.stations_by_code[station_filter]]
            if station_filter and station_filter in self.stations_by_code
            else self.stations_data
        )

        for s in target_stations:
            reading = self._generate_observation(s, now)
            station_readings.append(reading)
            if reading['aqi'] is not None:
                total_aqi += reading['aqi']

        reporting_count = len(station_readings)
        avg_aqi = int(round(total_aqi / reporting_count)) if reporting_count > 0 else 0
        from apps.air_quality.naqi import get_category_and_color
        category, color = get_category_and_color(avg_aqi)

        return {
            'city_summary': {
                'city': 'Chandigarh',
                'average_aqi': avg_aqi,
                'category': category,
                'category_color': color,
                'prominent_pollutant': 'PM2.5',
                'reporting_stations': reporting_count,
                'last_updated': now.strftime('%Y-%m-%dT%H:%M:%SZ'),
            },
            'stations': station_readings,
        }

    def health_check(self) -> bool:
        """Verify fixture accessibility and calculation health."""
        return len(self.stations_data) > 0
