"""
OpenWeather Data Provider for AIRiac.
Fetches real-time ambient weather and air pollution forecast via OpenWeather API.
Includes resilient fallback to deterministic local simulations if network or API key fails.
"""
import os
import json
import logging
import urllib.request
import urllib.parse
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from providers.base import BaseDataProvider
from providers.weather import MockWeatherProvider

logger = logging.getLogger(__name__)


class OpenWeatherProvider(BaseDataProvider):
    """
    Integrates OpenWeather API (current weather + air pollution forecast).
    """

    BASE_URL = "https://api.openweathermap.org/data/2.5"

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.environ.get('OPENWEATHER_API_KEY')
        self.fallback_provider = MockWeatherProvider()

    def fetch_current(self, station_code: str = 'CH-SEC22-CAAQMS', lat: float = 30.7333, lon: float = 76.7794) -> Dict[str, Any]:
        """
        Fetch real-time temperature, humidity, wind, pressure from OpenWeather.
        """
        if not self.api_key:
            return self.fallback_provider.fetch_current(station_code)

        try:
            params = urllib.parse.urlencode({
                'lat': lat,
                'lon': lon,
                'appid': self.api_key,
                'units': 'metric',
            })
            url = f"{self.BASE_URL}/weather?{params}"
            req = urllib.request.Request(url, headers={'User-Agent': 'AIRiac-WeatherService/1.0'})

            with urllib.request.urlopen(req, timeout=6) as response:
                if response.status == 200:
                    data = json.loads(response.read().decode('utf-8'))
                    main = data.get('main', {})
                    wind = data.get('wind', {})
                    weather_desc = data.get('weather', [{}])[0].get('description', 'Clear')

                    return {
                        'provider': 'openweather',
                        'station_code': station_code,
                        'city': data.get('name', 'Chandigarh'),
                        'timestamp': datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ'),
                        'temperature_c': float(main.get('temp', 22.0)),
                        'feels_like_c': float(main.get('feels_like', 22.0)),
                        'relative_humidity_pct': float(main.get('humidity', 50)),
                        'surface_pressure_hpa': float(main.get('pressure', 1012)),
                        'wind_speed_kmh': round(float(wind.get('speed', 3.0)) * 3.6, 1),
                        'wind_direction_deg': float(wind.get('deg', 315)),
                        'conditions': weather_desc.title(),
                        'solar_radiation_wm2': 450.0,
                        'is_live': True,
                    }
        except Exception as exc:
            logger.warning("OpenWeather fetch_current failed (%s); falling back to deterministic model", exc)

        res = self.fallback_provider.fetch_current(station_code)
        res['provider'] = 'mock_openweather_fallback'
        res['is_live'] = False
        return res

    def fetch_pollution_forecast(self, lat: float = 30.7333, lon: float = 76.7794) -> List[Dict[str, Any]]:
        """
        Fetch 5-day hourly air pollution forecast from OpenWeather Air Pollution endpoint.
        """
        if not self.api_key:
            return []

        try:
            params = urllib.parse.urlencode({
                'lat': lat,
                'lon': lon,
                'appid': self.api_key,
            })
            url = f"{self.BASE_URL}/air_pollution/forecast?{params}"
            req = urllib.request.Request(url, headers={'User-Agent': 'AIRiac-WeatherService/1.0'})

            with urllib.request.urlopen(req, timeout=6) as response:
                if response.status == 200:
                    data = json.loads(response.read().decode('utf-8'))
                    forecast_list = []
                    for item in data.get('list', [])[:24]:  # Next 24 hours
                        comps = item.get('components', {})
                        dt = datetime.fromtimestamp(item.get('dt', 0), tz=timezone.utc)
                        forecast_list.append({
                            'timestamp': dt.strftime('%Y-%m-%dT%H:%M:%SZ'),
                            'hour': dt.strftime('%H:00'),
                            'aqi_index': item.get('main', {}).get('aqi', 1),
                            'pm2_5': comps.get('pm2_5', 0.0),
                            'pm10': comps.get('pm10', 0.0),
                            'no2': comps.get('no2', 0.0),
                            'so2': comps.get('so2', 0.0),
                            'o3': comps.get('o3', 0.0),
                            'co': comps.get('co', 0.0),
                        })
                    return forecast_list
        except Exception as exc:
            logger.warning("OpenWeather air pollution forecast failed (%s)", exc)

        return []

    def fetch_historical(self, station_code: str = 'CH-SEC22-CAAQMS', days: int = 7) -> List[Dict[str, Any]]:
        return self.fallback_provider.fetch_historical(station_code, days)

    def health_check(self) -> bool:
        return bool(self.api_key)
