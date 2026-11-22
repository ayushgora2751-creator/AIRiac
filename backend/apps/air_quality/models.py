"""
Models for apps.air_quality: Pollutant observations and NAQI records.
"""
from django.db import models


class PollutantReading(models.Model):
    station = models.ForeignKey(
        'locations.MonitoringStation',
        on_delete=models.CASCADE,
        related_name='readings',
    )
    timestamp = models.DateTimeField(db_index=True)
    pm25 = models.FloatField(null=True, blank=True, help_text="PM2.5 (24h avg in µg/m³)")
    pm10 = models.FloatField(null=True, blank=True, help_text="PM10 (24h avg in µg/m³)")
    no2 = models.FloatField(null=True, blank=True, help_text="NO2 (24h avg in µg/m³)")
    so2 = models.FloatField(null=True, blank=True, help_text="SO2 (24h avg in µg/m³)")
    co = models.FloatField(null=True, blank=True, help_text="CO (8h avg in mg/m³)")
    o3 = models.FloatField(null=True, blank=True, help_text="Ozone (8h avg in µg/m³)")
    nh3 = models.FloatField(null=True, blank=True, help_text="NH3 (24h avg in µg/m³)")
    pb = models.FloatField(null=True, blank=True, help_text="Lead (24h avg in µg/m³)")

    aqi = models.IntegerField(null=True, blank=True, help_text="Computed CPCB NAQI score")
    aqi_category = models.CharField(max_length=30, blank=True)
    prominent_pollutant = models.CharField(max_length=20, blank=True)
    sub_indices = models.JSONField(default=dict, blank=True)

    class Meta:
        db_table = 'air_quality_readings'
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['station', '-timestamp']),
        ]

    def __str__(self):
        return f"{self.station.code} @ {self.timestamp} - AQI: {self.aqi} ({self.aqi_category})"
