from rest_framework import serializers
from apps.reports.models import DailyReport


class DailyReportSerializer(serializers.ModelSerializer):
    max_station_name = serializers.CharField(source='max_station.name', read_only=True)

    class Meta:
        model = DailyReport
        fields = [
            'id', 'report_date', 'city_avg_aqi', 'max_station',
            'max_station_name', 'max_aqi', 'min_aqi', 'primary_pollutant',
            'compliance_status', 'summary_text',
        ]
