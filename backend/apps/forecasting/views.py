from datetime import datetime, timezone, timedelta
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from apps.air_quality.naqi import get_category_and_color
from providers.cpcb import MockCPCBProvider


class StationForecastView(APIView):
    """Retrieve 24-hour and 72-hour projected AQI forecasts for a station."""
    permission_classes = [AllowAny]

    def get(self, request, station_id=None):
        station_code = request.query_params.get('station_code', 'CH-SEC22-CAAQMS')
        provider = MockCPCBProvider()
        now = datetime.now(timezone.utc)
        forecasts = []

        for h in range(1, 25):
            target_dt = now + timedelta(hours=h)
            factor = provider._get_diurnal_factor(target_dt)
            pred_aqi = int(round(165 * factor))
            pred_cat, _ = get_category_and_color(pred_aqi)
            forecasts.append({
                'target_timestamp': target_dt.strftime('%Y-%m-%dT%H:%M:%SZ'),
                'predicted_aqi': pred_aqi,
                'predicted_category': pred_cat,
                'confidence_interval_low': max(0, pred_aqi - 15),
                'confidence_interval_high': min(500, pred_aqi + 20),
                'primary_pollutant': 'PM2.5',
                'model_version': 'v1.0-mock-baseline',
            })

        return Response({
            'station_code': station_code,
            'generated_at': now.strftime('%Y-%m-%dT%H:%M:%SZ'),
            'forecasts': forecasts,
        }, status=status.HTTP_200_OK)


class TrendAnalysisView(APIView):
    """Retrieve aggregated diurnal trend statistics."""
    permission_classes = [AllowAny]

    def get(self, request):
        station_code = request.query_params.get('station_code', 'CH-SEC22-CAAQMS')
        return Response({
            'station_code': station_code,
            'daily_average_aqi': 178.4,
            'peak_morning_hour': 8,
            'peak_evening_hour': 20,
            'dominant_pollutant': 'PM2.5',
            'trend_direction': 'improving_daytime',
        }, status=status.HTTP_200_OK)
