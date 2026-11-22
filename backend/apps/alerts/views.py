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
        if not isinstance(request.data, dict):
            return Response(
                {"error": "Invalid request body: expected a JSON object"},
                status=status.HTTP_400_BAD_REQUEST
            )
        recipient_email = request.data.get('email') or 'subscriber@example.com'
        if not isinstance(recipient_email, str):
            recipient_email = 'subscriber@example.com'
        recipient_name = request.data.get('name') or 'Community Citizen'
        if not isinstance(recipient_name, str):
            recipient_name = 'Community Citizen'
        city = request.data.get('city') or 'Chandigarh'
        if not isinstance(city, str):
            city = 'Chandigarh'
        try:
            raw_aqi = request.data.get('aqi', 184)
            aqi = int(raw_aqi) if raw_aqi is not None else 184
        except (ValueError, TypeError):
            aqi = 184
        category = request.data.get('category') or 'Moderate'
        if not isinstance(category, str):
            category = 'Moderate'

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
        if not isinstance(request.data, dict):
            return Response(
                {"error": "Invalid request body: expected a JSON object"},
                status=status.HTTP_400_BAD_REQUEST
            )
        order_number = request.data.get('order_number') or 'ORD-AIRIAC-001'
        if not isinstance(order_number, str):
            order_number = 'ORD-AIRIAC-001'
        customer_name = request.data.get('customer_name') or 'Citizen'
        if not isinstance(customer_name, str):
            customer_name = 'Citizen'
        customer_address = request.data.get('address') or 'Sector 17, Chandigarh'
        if not isinstance(customer_address, str):
            customer_address = 'Sector 17, Chandigarh'
        customer_phone = request.data.get('phone') or '+919876543210'
        if not isinstance(customer_phone, str):
            customer_phone = '+919876543210'
        item_name = request.data.get('item') or 'N95 Anti-Pollution Respirator Pack'
        if not isinstance(item_name, str):
            item_name = 'N95 Anti-Pollution Respirator Pack'
        city = request.data.get('city') or 'Chandigarh'
        if not isinstance(city, str):
            city = 'Chandigarh'

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
