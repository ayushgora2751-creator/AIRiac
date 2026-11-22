from rest_framework import serializers
from apps.advice.models import Advisory


class AdvisorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Advisory
        fields = [
            'id', 'aqi_category', 'headline', 'general_public_advice',
            'vulnerable_group_advice', 'mask_guidance', 'indoor_air_guidance',
            'exercise_guidance',
        ]
