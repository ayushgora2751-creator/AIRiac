"""
System health check endpoint for AIRiac.
Performs active DB connectivity check ('SELECT 1;') and Redis cache read/write probe.
"""
from datetime import datetime, timezone
from django.db import connection
from django.core.cache import cache
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, serializers
from rest_framework.permissions import AllowAny
from drf_spectacular.utils import extend_schema, inline_serializer


class HealthCheckView(APIView):
    """
    Public health probe verifying operational status of PostgreSQL database and Redis cache.
    Returns HTTP 200 OK when all backing services are operational; HTTP 503 if any service degraded.
    """
    permission_classes = [AllowAny]

    @extend_schema(
        summary="System Health & Diagnostic Check",
        description="Probes active database connection and cache store. Returns 200 if healthy, 503 if degraded.",
        responses={
            200: inline_serializer(
                name='HealthCheckHealthyResponse',
                fields={
                    'status': serializers.CharField(default='healthy'),
                    'timestamp': serializers.CharField(),
                    'services': serializers.DictField(),
                    'version': serializers.CharField(default='1.0.0'),
                }
            ),
            503: inline_serializer(
                name='HealthCheckUnhealthyResponse',
                fields={
                    'status': serializers.CharField(default='unhealthy'),
                    'timestamp': serializers.CharField(),
                    'services': serializers.DictField(),
                    'version': serializers.CharField(default='1.0.0'),
                }
            ),
        }
    )
    def get(self, request):
        now_str = datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')
        db_engine = connection.settings_dict.get('ENGINE', 'unknown')
        cache_backend = cache.__class__.__module__ + '.' + cache.__class__.__name__

        # Active Database Probe
        db_healthy = False
        db_error = None
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1;")
                row = cursor.fetchone()
                if row and row[0] == 1:
                    db_healthy = True
                else:
                    db_error = "Database returned unexpected response"
        except Exception as exc:
            db_healthy = False
            db_error = str(exc)

        # Active Cache Probe
        cache_healthy = False
        cache_error = None
        try:
            probe_key = '__airiac_health_probe__'
            cache.set(probe_key, 'ok', timeout=10)
            if cache.get(probe_key) == 'ok':
                cache_healthy = True
            else:
                cache_error = "Cache write-read verification failed"
        except Exception as exc:
            cache_healthy = False
            cache_error = str(exc)

        db_service = {'status': 'up' if db_healthy else 'down'}
        if db_healthy:
            db_service['engine'] = db_engine
        else:
            db_service['error'] = db_error

        cache_service = {'status': 'up' if cache_healthy else 'down'}
        if cache_healthy:
            cache_service['backend'] = cache_backend
        else:
            cache_service['error'] = cache_error

        is_healthy = db_healthy and cache_healthy
        http_status = status.HTTP_200_OK if is_healthy else status.HTTP_503_SERVICE_UNAVAILABLE

        return Response({
            'status': 'healthy' if is_healthy else 'unhealthy',
            'timestamp': now_str,
            'services': {
                'database': db_service,
                'cache': cache_service,
            },
            'version': '1.0.0',
        }, status=http_status)
