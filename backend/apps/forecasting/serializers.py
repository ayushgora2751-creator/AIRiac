from rest_framework import serializers
from apps.forecasting.models import AQIForecast, TrendAnalysis


class AQIForecastSerializer(serializers.ModelSerializer):
    station_code = serializers.CharField(source='station.code', read_only=True)

    class Meta:
        model = AQIForecast
        fields = [
            'id', 'station', 'station_code', 'forecast_generated_at',
            'target_timestamp', 'predicted_aqi', 'predicted_category',
            'confidence_interval_low', 'confidence_interval_high',
            'primary_pollutant', 'model_version',
        ]


class TrendAnalysisSerializer(serializers.ModelSerializer):
    station_code = serializers.CharField(source='station.code', read_only=True)

    class Meta:
        model = TrendAnalysis
        fields = [
            'id', 'station', 'station_code', 'period',
            'date', 'avg_aqi', 'dominant_pollutant', 'peak_hour',
        ]
