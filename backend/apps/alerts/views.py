from rest_framework import generics, permissions
from apps.alerts.models import AlertThreshold, AlertNotification
from apps.alerts.serializers import AlertThresholdSerializer, AlertNotificationSerializer


class AlertSubscriptionsView(generics.ListCreateAPIView):
    """List or create air quality alert threshold subscriptions for authenticated user."""
    serializer_class = AlertThresholdSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return AlertThreshold.objects.filter(user=self.request.user)


class AlertNotificationsView(generics.ListAPIView):
    """List notifications dispatched to authenticated user."""
    serializer_class = AlertNotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return AlertNotification.objects.filter(user=self.request.user)
