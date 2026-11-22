from rest_framework import generics
from rest_framework.permissions import AllowAny
from apps.locations.models import Sector, MonitoringStation
from apps.locations.serializers import SectorSerializer, MonitoringStationSerializer


class SectorListView(generics.ListAPIView):
    """List all Chandigarh sectors."""
    queryset = Sector.objects.all()
    serializer_class = SectorSerializer
    permission_classes = [AllowAny]


class MonitoringStationListView(generics.ListAPIView):
    """List all CAAQMS monitoring stations."""
    queryset = MonitoringStation.objects.filter(is_active=True)
    serializer_class = MonitoringStationSerializer
    permission_classes = [AllowAny]


class MonitoringStationDetailView(generics.RetrieveAPIView):
    """Retrieve details for a specific CAAQMS monitoring station."""
    queryset = MonitoringStation.objects.all()
    serializer_class = MonitoringStationSerializer
    permission_classes = [AllowAny]
