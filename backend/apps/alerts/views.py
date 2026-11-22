from rest_framework import generics, permissions, status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from apps.alerts.models import AlertThreshold, AlertNotification
from apps.alerts.serializers import AlertThresholdSerializer, AlertNotificationSerializer
from apps.alerts.mailercloud import MailercloudService
from apps.alerts.shipday import ShipdayService


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


class MailercloudTestAlertView(APIView):
    """
    Triggers a live transactional pollution alert email via Mailercloud API.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        recipient_email = request.data.get('email', 'subscriber@example.com')
        recipient_name = request.data.get('name', 'Community Citizen')
        city = request.data.get('city', 'Chandigarh')
        try:
            raw_aqi = request.data.get('aqi', 184)
            aqi = int(raw_aqi) if raw_aqi is not None else 184
        except (ValueError, TypeError):
            aqi = 184
        category = request.data.get('category', 'Moderate')

        mailer = MailercloudService()
        result = mailer.send_pollution_alert(
            recipient_email=recipient_email,
            recipient_name=recipient_name,
            city=city,
            current_aqi=aqi,
            category=category,
        )

        return Response(result, status=status.HTTP_200_OK)


class ShipdayDispatchView(APIView):
    """
    Creates an on-demand logistics dispatch via Shipday API.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        order_number = request.data.get('order_number', 'ORD-AIRIAC-001')
        customer_name = request.data.get('customer_name', 'Citizen')
        customer_address = request.data.get('address', 'Sector 17, Chandigarh')
        customer_phone = request.data.get('phone', '+919876543210')
        item_name = request.data.get('item', 'N95 Anti-Pollution Respirator Pack')
        city = request.data.get('city', 'Chandigarh')

        shipday = ShipdayService()
        result = shipday.create_order(
            order_number=order_number,
            customer_name=customer_name,
            customer_address=customer_address,
            customer_phone=customer_phone,
            item_name=item_name,
            city=city,
        )

        return Response(result, status=status.HTTP_200_OK)
