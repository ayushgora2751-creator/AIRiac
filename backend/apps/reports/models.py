"""
Models for apps.reports: Daily and weekly compliance reports against Indian NAAQS.
"""
from django.db import models


class DailyReport(models.Model):
    report_date = models.DateField(unique=True, db_index=True)
    city_avg_aqi = models.FloatField()
    max_station = models.ForeignKey(
        'locations.MonitoringStation',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='highest_aqi_reports',
    )
    max_aqi = models.IntegerField()
    min_aqi = models.IntegerField()
    primary_pollutant = models.CharField(max_length=20, default='PM2.5')
    compliance_status = models.CharField(max_length=50)
    summary_text = models.TextField()

    class Meta:
        db_table = 'reports_daily'
        ordering = ['-report_date']

    def __str__(self):
        return f"Daily Report {self.report_date}: Avg AQI {self.city_avg_aqi} ({self.compliance_status})"
