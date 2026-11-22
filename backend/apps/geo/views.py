import os
import json
import logging
import urllib.request
from rest_framework import generics, status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from apps.geo.constants import CHANDIGARH_BBOX
from apps.geo.models import GeoBoundary
from apps.geo.serializers import GeoBoundarySerializer

logger = logging.getLogger(__name__)


class BBoxView(APIView):
    """Returns the official Chandigarh bounding box."""
    def get(self, request):
        return Response(CHANDIGARH_BBOX)


class GeoBoundaryListView(generics.ListAPIView):
    queryset = GeoBoundary.objects.all()
    serializer_class = GeoBoundarySerializer


class IPLocateView(APIView):
    """
    IP Geolocation endpoint powered by IPStack API.
    Resolves client IP into Indian city name, latitude, and longitude.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        api_key = os.environ.get('IPSTACK_API_KEY')
        client_ip = request.query_params.get('ip')

        if not client_ip:
            x_forwarded = request.META.get('HTTP_X_FORWARDED_FOR')
            if x_forwarded:
                client_ip = x_forwarded.split(',')[0].strip()
            else:
                client_ip = request.META.get('REMOTE_ADDR', '')

        # Filter local loopback
        if not client_ip or client_ip in ('127.0.0.1', '::1', 'localhost'):
            return Response({
                'ip': client_ip or '127.0.0.1',
                'city': 'Chandigarh',
                'region_name': 'Chandigarh UT',
                'latitude': 30.7333,
                'longitude': 76.7794,
                'country_name': 'India',
                'provider': 'ipstack_default',
                'is_local': True,
            }, status=status.HTTP_200_OK)

        if api_key and api_key.strip():
            try:
                url = f"http://api.ipstack.com/{client_ip}?access_key={api_key.strip()}"
                req = urllib.request.Request(url, headers={'User-Agent': 'AIRiac-GeoLocator/1.0'})
                with urllib.request.urlopen(req, timeout=5) as response:
                    if response.status == 200:
                        data = json.loads(response.read().decode('utf-8'))
                        if data.get('city'):
                            return Response({
                                'ip': client_ip,
                                'city': data.get('city'),
                                'region_name': data.get('region_name', ''),
                                'latitude': float(data.get('latitude', 30.7333)),
                                'longitude': float(data.get('longitude', 76.7794)),
                                'country_name': data.get('country_name', 'India'),
                                'provider': 'ipstack',
                                'is_local': False,
                            }, status=status.HTTP_200_OK)
            except Exception as exc:
                logger.warning("IPStack lookup error (%s); returning default location", exc)
        else:
            logger.info("IPSTACK_API_KEY not configured; using local geo simulation fallback.")

        return Response({
            'ip': client_ip,
            'city': 'Chandigarh',
            'region_name': 'Chandigarh UT',
            'latitude': 30.7333,
            'longitude': 76.7794,
            'country_name': 'India',
            'provider': 'fallback',
            'is_local': False,
        }, status=status.HTTP_200_OK)
