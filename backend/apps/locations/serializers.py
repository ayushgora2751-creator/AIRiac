from rest_framework import serializers
from apps.locations.models import Sector, MonitoringStation


class SectorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sector
        fields = ['id', 'sector_number', 'name', 'zone', 'center_point', 'boundary']


class MonitoringStationSerializer(serializers.ModelSerializer):
    sector_number = serializers.CharField(source='sector.sector_number', read_only=True, default=None)

    class Meta:
        model = MonitoringStation
        fields = [
            'id', 'code', 'name', 'station_type', 'operator',
            'location', 'sector', 'sector_number', 'elevation_m', 'is_active',
        ]
