from rest_framework import serializers
from apps.impact.models import VulnerableGroup, HealthImpactMatrix


class VulnerableGroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = VulnerableGroup
        fields = ['id', 'code', 'name', 'description']


class HealthImpactMatrixSerializer(serializers.ModelSerializer):
    group_code = serializers.CharField(source='vulnerable_group.code', read_only=True)
    group_name = serializers.CharField(source='vulnerable_group.name', read_only=True)

    class Meta:
        model = HealthImpactMatrix
        fields = [
            'id', 'aqi_category', 'vulnerable_group', 'group_code',
            'group_name', 'risk_level', 'symptoms', 'recommended_precautions',
        ]
