from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from providers.openweather import OpenWeatherProvider
from providers.weather import MockWeatherProvider


class CurrentWeatherView(APIView):
    """
    Retrieve current surface meteorological observation.
    Powered by OpenWeather API with resilient fallback.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        station_code = request.query_params.get('station_code', 'CH-SEC22-CAAQMS')
        try:
            lat = float(request.query_params.get('lat', 30.7333))
            lon = float(request.query_params.get('lon', 76.7794))
        except ValueError:
            lat, lon = 30.7333, 76.7794

        provider = OpenWeatherProvider()
        data = provider.fetch_current(station_code=station_code, lat=lat, lon=lon)
        return Response(data, status=status.HTTP_200_OK)


class HistoricalWeatherView(APIView):
    """Retrieve historical meteorological series for Chandigarh."""
    permission_classes = [AllowAny]

    def get(self, request):
        station_code = request.query_params.get('station_code', 'CH-SEC22-CAAQMS')
        try:
            days = int(request.query_params.get('days', 7))
        except ValueError:
            days = 7
        provider = MockWeatherProvider()
        data = provider.fetch_historical(station_code=station_code, days=days)
        return Response(data, status=status.HTTP_200_OK)


class OpenWeatherPollutionForecastView(APIView):
    """
    Retrieve 24-hour hourly air pollution forecast from OpenWeather Air Pollution API.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        try:
            lat = float(request.query_params.get('lat', 30.7333))
            lon = float(request.query_params.get('lon', 76.7794))
        except ValueError:
            lat, lon = 30.7333, 76.7794

        provider = OpenWeatherProvider()
        forecast = provider.fetch_pollution_forecast(lat=lat, lon=lon)
        return Response({'forecast': forecast}, status=status.HTTP_200_OK)
