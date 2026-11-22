from rest_framework import generics
from rest_framework.response import Response
from rest_framework.views import APIView
from apps.geo.constants import CHANDIGARH_BBOX
from apps.geo.models import GeoBoundary
from apps.geo.serializers import GeoBoundarySerializer


class BBoxView(APIView):
    """Returns the official Chandigarh bounding box."""
    def get(self, request):
        return Response(CHANDIGARH_BBOX)


class GeoBoundaryListView(generics.ListAPIView):
    queryset = GeoBoundary.objects.all()
    serializer_class = GeoBoundarySerializer
