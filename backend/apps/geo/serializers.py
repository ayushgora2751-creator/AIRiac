from rest_framework import serializers
from apps.geo.models import GeoBoundary


class GeoBoundarySerializer(serializers.ModelSerializer):
    class Meta:
        model = GeoBoundary
        fields = '__all__'
