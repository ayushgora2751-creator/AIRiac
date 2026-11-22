"""
Mock India Meteorological Department (IMD) / Chandigarh Weather Data Provider.
Generates deterministic surface meteorological observations without network calls.
"""
import math
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, List
from providers.base import BaseDataProvider


class MockWeatherProvider(BaseDataProvider):
    """
    Simulates ambient temperature, relative humidity, wind speed, wind direction,
    and surface pressure for Chandigarh.
    """

    def _generate_weather(self, station_code: str, dt: datetime) -> Dict[str, Any]:
        hour = dt.hour + (dt.minute / 60.0)

        # Diurnal temperature cycle: lowest at dawn (05:00), highest at mid-afternoon (15:00)
        temp_cycle = math.sin((hour - 9.0) * math.pi / 12.0)
        temperature = round(22.0 + 8.0 * temp_cycle, 1)

        # Relative humidity inversely correlated with temperature
        humidity = round(58.0 - 20.0 * temp_cycle, 1)
        humidity = max(20.0, min(95.0, humidity))

        # Wind speed higher in afternoon, calm at night
        wind_speed = round(5.0 + 4.0 * math.sin((hour - 11.0) * math.pi / 12.0), 1)
        wind_speed = max(1.5, wind_speed)

        # Prevailing northwest wind in northern plains (approx 315 degrees)
        wind_direction = round(315.0 + 15.0 * math.sin(hour * 0.5), 1) % 360.0
        surface_pressure = round(1012.0 - 2.0 * math.sin((hour - 10.0) * math.pi / 12.0), 1)

        return {
            'station_code': station_code,
            'timestamp': dt.strftime('%Y-%m-%dT%H:%M:%SZ'),
            'temperature_c': temperature,
            'relative_humidity_pct': humidity,
            'wind_speed_kmh': wind_speed,
            'wind_direction_deg': wind_direction,
            'surface_pressure_hpa': surface_pressure,
            'solar_radiation_wm2': round(max(0.0, 650.0 * math.sin((hour - 6.0) * math.pi / 12.0)), 1),
            'precipitation_mm': 0.0,
        }

    def fetch_current(self, station_code: str = 'CH-SEC22-CAAQMS') -> Dict[str, Any]:
        now = datetime.now(timezone.utc)
        return self._generate_weather(station_code, now)

    def fetch_historical(self, station_code: str = 'CH-SEC22-CAAQMS', days: int = 7) -> List[Dict[str, Any]]:
        now = datetime.now(timezone.utc)
        results = []
        for i in range(days * 24):
            dt = now - timedelta(hours=i)
            results.append(self._generate_weather(station_code, dt))
        return results

    def health_check(self) -> bool:
        return True
