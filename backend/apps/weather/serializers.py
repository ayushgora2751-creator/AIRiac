from rest_framework import serializers
from apps.weather.models import WeatherObservation


class WeatherObservationSerializer(serializers.ModelSerializer):
    station_code = serializers.CharField(source='station.code', read_only=True)

    class Meta:
        model = WeatherObservation
        fields = [
            'id', 'station', 'station_code', 'timestamp',
            'temperature', 'relative_humidity', 'wind_speed', 'wind_direction',
            'surface_pressure', 'solar_radiation', 'precipitation',
        ]
