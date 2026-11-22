from django.urls import path
from apps.air_quality.views import (
    LatestAirQualityView,
    HistoricalAirQualityView,
    CalculateNAQIView,
)

urlpatterns = [
    path('latest/', LatestAirQualityView.as_view(), name='air_quality_latest'),
    path('history/', HistoricalAirQualityView.as_view(), name='air_quality_history'),
    path('calculate/', CalculateNAQIView.as_view(), name='air_quality_calculate'),
]
