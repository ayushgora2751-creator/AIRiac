from rest_framework import generics, status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from apps.advice.models import Advisory
from apps.advice.serializers import AdvisorySerializer
from apps.air_quality.naqi import get_category_and_color
from providers.cpcb import MockCPCBProvider
from apps.advice.gemini_service import GeminiAssistantService


class CurrentAdvisoryView(APIView):
    """Retrieve actionable health advisory for the current city-wide average AQI."""
    permission_classes = [AllowAny]

    def get(self, request):
        provider = MockCPCBProvider()
        city = request.query_params.get('city', 'Chandigarh')
        summary = provider.get_latest_summary(city=city)
        avg_aqi = summary['city_summary']['average_aqi']
        category, color = get_category_and_color(avg_aqi)

        return Response({
            'city': city,
            'current_aqi': avg_aqi,
            'category': category,
            'category_color': color,
            'headline': f"Air Quality is {category} in {city}",
            'general_public_advice': 'Sensitive individuals should reduce prolonged outdoor exertion.',
            'vulnerable_group_advice': 'Elderly and asthmatics should avoid morning outdoor runs.',
            'mask_guidance': 'N95 / FFP2 mask recommended for extended outdoor commuting.',
            'indoor_air_guidance': 'Keep windows closed during peak morning traffic (08:00-10:00).',
            'exercise_guidance': 'Shift vigorous cardiovascular exercise indoors.',
        }, status=status.HTTP_200_OK)


class AdvisoryCategoriesView(generics.ListAPIView):
    """List advisory templates across all 6 CPCB NAQI bands."""
    queryset = Advisory.objects.all()
    serializer_class = AdvisorySerializer
    permission_classes = [AllowAny]


class GeminiChatAssistantView(APIView):
    """
    Chat endpoint for the AI Air Quality Assistant.
    Powered by Google Gemini API with CPCB NAQI grounding and explainability.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        if not isinstance(request.data, dict):
            return Response(
                {"error": "Invalid request body: expected a JSON object"},
                status=status.HTTP_400_BAD_REQUEST
            )

        question = request.data.get('question')
        if not isinstance(question, str) or not question.strip():
            return Response(
                {"error": "Question is required and must be a non-empty string"},
                status=status.HTTP_400_BAD_REQUEST
            )
        question = question.strip()

        city = request.data.get('city') or 'Chandigarh'
        if not isinstance(city, str):
            city = 'Chandigarh'

        try:
            raw_aqi = request.data.get('aqi', 150)
            aqi = int(raw_aqi) if raw_aqi is not None else 150
        except (ValueError, TypeError):
            aqi = 150

        category = request.data.get('category') or 'Moderate'
        if not isinstance(category, str):
            category = 'Moderate'

        prominent = request.data.get('prominent_pollutant') or 'PM2.5'
        if not isinstance(prominent, str):
            prominent = 'PM2.5'

        service = GeminiAssistantService()
        result = service.ask(
            question=question,
            city=city,
            aqi=aqi,
            category=category,
            prominent_pollutant=prominent,
        )

        return Response(result, status=status.HTTP_200_OK)
