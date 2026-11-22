from django.urls import path
from apps.forecasting.views import StationForecastView, TrendAnalysisView

urlpatterns = [
    path('stations/<int:station_id>/', StationForecastView.as_view(), name='forecasting_station'),
    path('stations/', StationForecastView.as_view(), name='forecasting_stations_list'),
    path('trends/', TrendAnalysisView.as_view(), name='forecasting_trends'),
]
