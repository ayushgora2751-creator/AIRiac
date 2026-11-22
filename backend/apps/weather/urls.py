from django.urls import path
from apps.weather.views import CurrentWeatherView, HistoricalWeatherView

urlpatterns = [
    path('current/', CurrentWeatherView.as_view(), name='weather_current'),
    path('history/', HistoricalWeatherView.as_view(), name='weather_history'),
]
