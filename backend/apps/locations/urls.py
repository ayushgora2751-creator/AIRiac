from django.urls import path
from apps.locations.views import (
    SectorListView,
    MonitoringStationListView,
    MonitoringStationDetailView,
)

urlpatterns = [
    path('sectors/', SectorListView.as_view(), name='sector_list'),
    path('stations/', MonitoringStationListView.as_view(), name='station_list'),
    path('stations/<int:pk>/', MonitoringStationDetailView.as_view(), name='station_detail'),
]
