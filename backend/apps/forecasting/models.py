"""
Models for apps.forecasting: Predictive AQI forecasts and rolling trend analytics.
"""
from django.db import models


class AQIForecast(models.Model):
    station = models.ForeignKey(
        'locations.MonitoringStation',
        on_delete=models.CASCADE,
        related_name='forecasts',
    )
    forecast_generated_at = models.DateTimeField(auto_now_add=True)
    target_timestamp = models.DateTimeField(db_index=True)
    predicted_aqi = models.IntegerField()
    predicted_category = models.CharField(max_length=30)
    confidence_interval_low = models.IntegerField()
    confidence_interval_high = models.IntegerField()
    primary_pollutant = models.CharField(max_length=20, default='PM2.5')
    model_version = models.CharField(max_length=50, default='v1.0-mock-baseline')

    class Meta:
        db_table = 'forecasting_aqi_forecasts'
        ordering = ['target_timestamp']

    def __str__(self):
        return f"{self.station.code} @ {self.target_timestamp} - Pred: {self.predicted_aqi}"


class TrendAnalysis(models.Model):
    PERIOD_CHOICES = [
        ('daily', 'Daily'),
        ('weekly', 'Weekly'),
        ('monthly', 'Monthly'),
    ]

    station = models.ForeignKey(
        'locations.MonitoringStation',
        on_delete=models.CASCADE,
        related_name='trends',
    )
    period = models.CharField(max_length=20, choices=PERIOD_CHOICES, default='daily')
    date = models.DateField(db_index=True)
    avg_aqi = models.FloatField()
    dominant_pollutant = models.CharField(max_length=20, default='PM2.5')
    peak_hour = models.IntegerField(default=8)

    class Meta:
        db_table = 'forecasting_trend_analysis'
        ordering = ['-date']

    def __str__(self):
        return f"{self.station.code} {self.period} {self.date} - Avg AQI: {self.avg_aqi}"
