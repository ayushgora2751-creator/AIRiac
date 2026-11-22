from rest_framework import serializers
from apps.fires.models import FireIncident


class FireIncidentSerializer(serializers.ModelSerializer):
    class Meta:
        model = FireIncident
        fields = [
            'id', 'source_id', 'location', 'brightness_temperature',
            'frp', 'confidence', 'satellite', 'district', 'state', 'detected_at',
        ]
