from rest_framework import serializers
from apps.alerts.models import AlertThreshold, AlertNotification


class AlertThresholdSerializer(serializers.ModelSerializer):
    sector_number = serializers.CharField(source='sector.sector_number', read_only=True)

    class Meta:
        model = AlertThreshold
        fields = ['id', 'user', 'sector', 'sector_number', 'threshold_aqi', 'notify_email', 'is_active']
        read_only_fields = ['user']

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class AlertNotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = AlertNotification
        fields = ['id', 'user', 'threshold', 'aqi_recorded', 'message', 'sent_at', 'read']
