"""
URL configuration for AIRiac (Urban Air Quality Assistant).
Provides OpenAPI 3.0 documentation, system health probes, and REST API v1 routing.
"""
from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
    SpectacularRedocView,
)
from config.views import HealthCheckView, RootIndexView

urlpatterns = [
    # Public Root API Index for Render deployment
    path('', RootIndexView.as_view(), name='root_index'),

    # Django Administration
    path('admin/', admin.site.urls),

    # OpenAPI 3.0 Schema and Interactive Documentation (drf-spectacular)
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),

    # System Health Check Probes
    path('api/health/', HealthCheckView.as_view(), name='health_check_root'),
    path('api/v1/health/', HealthCheckView.as_view(), name='health_check_v1'),

    # REST API Version 1 Endpoints
    path('api/v1/auth/', include('apps.accounts.urls')),
    path('api/v1/locations/', include('apps.locations.urls')),
    path('api/v1/air-quality/', include('apps.air_quality.urls')),
    path('api/v1/weather/', include('apps.weather.urls')),
    path('api/v1/fires/', include('apps.fires.urls')),
    path('api/v1/forecasting/', include('apps.forecasting.urls')),
    path('api/v1/impact/', include('apps.impact.urls')),
    path('api/v1/advice/', include('apps.advice.urls')),
    path('api/v1/alerts/', include('apps.alerts.urls')),
    path('api/v1/reports/', include('apps.reports.urls')),
    path('api/v1/planning/', include('apps.planning.urls')),
    path('api/v1/community/', include('apps.community.urls')),
    path('api/v1/geo/', include('apps.geo.urls')),
]
