from rest_framework import serializers
from apps.planning.models import CleanRouteQuery, RouteOption


class RouteOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = RouteOption
        fields = ['id', 'route_type', 'route_geometry', 'estimated_duration_mins', 'average_aqi_exposure']


class CleanRouteQuerySerializer(serializers.ModelSerializer):
    options = RouteOptionSerializer(many=True, read_only=True)

    class Meta:
        model = CleanRouteQuery
        fields = ['id', 'origin', 'destination', 'departure_time', 'created_at', 'options']
