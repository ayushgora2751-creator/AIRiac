from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from providers.fires import MockFIRMSProvider


class ActiveFiresView(APIView):
    """List active agricultural stubble fires affecting Chandigarh hinterland."""
    permission_classes = [AllowAny]

    def get(self, request):
        provider = MockFIRMSProvider()
        data = provider.fetch_current()
        return Response(data, status=status.HTTP_200_OK)


class FireSummaryView(APIView):
    """Retrieve district-wise stubble fire incident summary and total FRP."""
    permission_classes = [AllowAny]

    def get(self, request):
        provider = MockFIRMSProvider()
        history = provider.fetch_historical(days=7)
        return Response({
            'period': '7_days',
            'summary': history,
        }, status=status.HTTP_200_OK)
