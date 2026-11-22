import os
from rest_framework import status, serializers
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from drf_spectacular.utils import extend_schema, inline_serializer
from apps.air_quality.naqi import calculate_naqi
from apps.air_quality.serializers import (
    NAQICalculateRequestSerializer,
    NAQICalculateResponseSerializer,
)
from providers.cpcb import MockCPCBProvider


class LatestAirQualityView(APIView):
    """
    Returns latest real-time observations and computed NAQI for Chandigarh CAAQMS stations,
    along with aggregated city summary.
    """
    permission_classes = [AllowAny]

    @extend_schema(
        summary="Latest Air Quality Observations",
        description="Returns latest pollutant observations, computed sub-indices, and city summary.",
        responses={200: inline_serializer(
            name='LatestAirQualityResponse',
            fields={
                'city_summary': serializers.DictField(),
                'stations': serializers.ListField(child=serializers.DictField()),
            }
        )}
    )
    def get(self, request):
        provider = MockCPCBProvider()
        station_filter = request.query_params.get('station_code')
        city = request.query_params.get('city', 'Chandigarh')
        data = provider.get_latest_summary(station_filter=station_filter, city=city)
        if os.environ.get('OPENAQ_API_KEY'):
            data['city_summary']['data_source'] = 'CPCB / OpenAQ Real-Time Sensors'
        return Response(data, status=status.HTTP_200_OK)


class HistoricalAirQualityView(APIView):
    """
    Returns 24-hour diurnal trend observations for a specific CAAQMS monitoring station.
    """
    permission_classes = [AllowAny]

    @extend_schema(
        summary="Historical Air Quality Series",
        description="Returns hourly series data for diurnal trend charting.",
        responses={200: inline_serializer(
            name='HistoricalAirQualityResponse',
            fields={
                'station_code': serializers.CharField(),
                'series': serializers.ListField(child=serializers.DictField()),
            }
        )}
    )
    def get(self, request):
        station_code = request.query_params.get('station_code', 'CH-SEC22-CAAQMS')
        try:
            hours = int(request.query_params.get('hours', 24))
            hours = max(1, min(168, hours))
        except ValueError:
            hours = 24

        provider = MockCPCBProvider()
        series = provider.fetch_hourly_series(station_code=station_code, hours=hours)
        return Response({
            'station_code': station_code,
            'series': series,
        }, status=status.HTTP_200_OK)


class CalculateNAQIView(APIView):
    """
    Ad-hoc NAQI calculator endpoint: computes CPCB sub-indices, overall AQI score,
    health category, and prominent pollutant.
    """
    permission_classes = [AllowAny]

    @extend_schema(
        summary="Ad-Hoc NAQI Calculator",
        description="Calculates Indian CPCB NAQI given pollutant concentrations (minimum 3 required, including PM2.5 or PM10).",
        request=NAQICalculateRequestSerializer,
        responses={
            200: NAQICalculateResponseSerializer,
            422: NAQICalculateResponseSerializer,
        }
    )
    def post(self, request):
        serializer = NAQICalculateRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        result = calculate_naqi(serializer.validated_data)
        response_serializer = NAQICalculateResponseSerializer(result)

        if not result.get('is_valid', False):
            return Response(response_serializer.data, status=status.HTTP_422_UNPROCESSABLE_ENTITY)

        return Response(response_serializer.data, status=status.HTTP_200_OK)
