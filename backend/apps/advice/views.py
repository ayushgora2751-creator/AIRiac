from rest_framework import generics, status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from apps.advice.models import Advisory
from apps.advice.serializers import AdvisorySerializer
from apps.air_quality.naqi import get_category_and_color
from providers.cpcb import MockCPCBProvider


class CurrentAdvisoryView(APIView):
    """Retrieve actionable health advisory for the current city-wide average AQI."""
    permission_classes = [AllowAny]

    def get(self, request):
        provider = MockCPCBProvider()
        summary = provider.get_latest_summary()
        avg_aqi = summary['city_summary']['average_aqi']
        category, color = get_category_and_color(avg_aqi)

        return Response({
            'current_aqi': avg_aqi,
            'category': category,
            'category_color': color,
            'headline': f"Air Quality is {category} in Chandigarh",
            'general_public_advice': 'Sensitive individuals should reduce prolonged outdoor exertion.',
            'vulnerable_group_advice': 'Elderly and asthmatics should avoid morning outdoor runs at Sukhna Lake.',
            'mask_guidance': 'N95 / FFP2 mask recommended for extended outdoor commuting.',
            'indoor_air_guidance': 'Keep windows closed during peak morning traffic (08:00-10:00).',
            'exercise_guidance': 'Shift vigorous cardiovascular exercise indoors.',
        }, status=status.HTTP_200_OK)


class AdvisoryCategoriesView(generics.ListAPIView):
    """List advisory templates across all 6 CPCB NAQI bands."""
    queryset = Advisory.objects.all()
    serializer_class = AdvisorySerializer
    permission_classes = [AllowAny]
