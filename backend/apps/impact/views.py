from rest_framework import generics, status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from apps.air_quality.naqi import get_category_and_color
from apps.impact.models import VulnerableGroup
from apps.impact.serializers import VulnerableGroupSerializer


class VulnerableGroupListView(generics.ListAPIView):
    """List demographic vulnerable groups (asthma, elderly, children, pregnant, outdoor workers)."""
    queryset = VulnerableGroup.objects.all()
    serializer_class = VulnerableGroupSerializer
    permission_classes = [AllowAny]


class HealthImpactAssessmentView(APIView):
    """Assess physiological health risk based on AQI value and vulnerable group."""
    permission_classes = [AllowAny]

    def get(self, request):
        try:
            aqi = int(request.query_params.get('aqi', 180))
        except ValueError:
            aqi = 180

        group_code = request.query_params.get('group', 'general')
        category, color = get_category_and_color(aqi)

        risk_level = 'moderate'
        symptoms = 'Minor breathing discomfort to sensitive individuals.'
        precautions = 'Avoid prolonged exertion outdoors. Consider wearing an N95 mask.'

        if aqi <= 50:
            risk_level = 'low'
            symptoms = 'Air quality is satisfactory; minimal health impact.'
            precautions = 'Enjoy normal outdoor activities.'
        elif aqi <= 100:
            risk_level = 'low'
            symptoms = 'Minor breathing discomfort to sensitive individuals.'
            precautions = 'Sensitive individuals should monitor symptoms.'
        elif aqi <= 200:
            risk_level = 'moderate'
            symptoms = 'Breathing discomfort to people with asthma and cardiovascular diseases.'
            precautions = 'Wear N95 mask outdoors; limit morning runs.'
        elif aqi <= 300:
            risk_level = 'high'
            symptoms = 'Breathing discomfort to most people on prolonged exposure.'
            precautions = 'Keep windows closed; run HEPA air purifiers; wear N95 mask.'
        elif aqi <= 400:
            risk_level = 'severe'
            symptoms = 'Respiratory illness on prolonged exposure; pronounced effect on vulnerable groups.'
            precautions = 'Avoid all outdoor physical activity; vulnerable individuals stay indoors.'
        else:
            risk_level = 'critical'
            symptoms = 'Affects healthy people and seriously impacts those with existing diseases.'
            precautions = 'Complete outdoor ban for schools/elderly; seek immediate medical advice if breathless.'

        return Response({
            'aqi': aqi,
            'category': category,
            'category_color': color,
            'vulnerable_group': group_code,
            'risk_level': risk_level,
            'symptoms': symptoms,
            'recommended_precautions': precautions,
        }, status=status.HTTP_200_OK)
