from rest_framework import serializers
from apps.air_quality.models import PollutantReading


class PollutantReadingSerializer(serializers.ModelSerializer):
    station_code = serializers.CharField(source='station.code', read_only=True)
    station_name = serializers.CharField(source='station.name', read_only=True)

    class Meta:
        model = PollutantReading
        fields = [
            'id', 'station', 'station_code', 'station_name', 'timestamp',
            'pm25', 'pm10', 'no2', 'so2', 'co', 'o3', 'nh3', 'pb',
            'aqi', 'aqi_category', 'prominent_pollutant', 'sub_indices',
        ]


class NAQICalculateRequestSerializer(serializers.Serializer):
    pm25 = serializers.FloatField(required=False, allow_null=True, min_value=0.0)
    pm10 = serializers.FloatField(required=False, allow_null=True, min_value=0.0)
    no2 = serializers.FloatField(required=False, allow_null=True, min_value=0.0)
    so2 = serializers.FloatField(required=False, allow_null=True, min_value=0.0)
    co = serializers.FloatField(required=False, allow_null=True, min_value=0.0)
    o3 = serializers.FloatField(required=False, allow_null=True, min_value=0.0)
    nh3 = serializers.FloatField(required=False, allow_null=True, min_value=0.0)
    pb = serializers.FloatField(required=False, allow_null=True, min_value=0.0)


class NAQICalculateResponseSerializer(serializers.Serializer):
    aqi = serializers.IntegerField(allow_null=True)
    category = serializers.CharField(allow_null=True)
    category_color = serializers.CharField(allow_null=True)
    prominent_pollutant = serializers.CharField(allow_null=True)
    is_valid = serializers.BooleanField()
    sub_indices = serializers.DictField(child=serializers.IntegerField(), required=False)
    error = serializers.CharField(required=False, allow_null=True)
