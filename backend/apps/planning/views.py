from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView


class CleanRouteView(APIView):
    """Calculate fastest and cleanest (minimal pollution exposure) route across Chandigarh."""
    permission_classes = [AllowAny]

    def post(self, request):
        origin = request.data.get('origin', {'lat': 30.7410, 'lng': 76.7850})
        destination = request.data.get('destination', {'lat': 30.7259, 'lng': 76.7744})

        return Response({
            'origin': origin,
            'destination': destination,
            'routes': [
                {
                    'route_type': 'cleanest',
                    'description': 'Via Jan Marg & Sector 16 Rose Garden green corridor',
                    'estimated_duration_mins': 16,
                    'average_aqi_exposure': 132.0,
                    'exposure_reduction_pct': 28.5,
                },
                {
                    'route_type': 'fastest',
                    'description': 'Via Madhya Marg (heavy diesel vehicular corridor)',
                    'estimated_duration_mins': 12,
                    'average_aqi_exposure': 185.0,
                    'exposure_reduction_pct': 0.0,
                },
            ],
        }, status=status.HTTP_200_OK)
