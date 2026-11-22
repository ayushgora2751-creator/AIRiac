from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from providers.weather import MockWeatherProvider


class CurrentWeatherView(APIView):
    """Retrieve current surface meteorological observation for Chandigarh."""
    permission_classes = [AllowAny]

    def get(self, request):
        station_code = request.query_params.get('station_code', 'CH-SEC22-CAAQMS')
        provider = MockWeatherProvider()
        data = provider.fetch_current(station_code=station_code)
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
