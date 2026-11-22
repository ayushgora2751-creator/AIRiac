"""
Models for apps.weather: Surface meteorological observations.
"""
from django.db import models


class WeatherObservation(models.Model):
    station = models.ForeignKey(
        'locations.MonitoringStation',
        on_delete=models.CASCADE,
        related_name='weather',
    )
    timestamp = models.DateTimeField(db_index=True)
    temperature = models.FloatField(help_text="Ambient temperature in °C")
    relative_humidity = models.FloatField(help_text="Relative humidity percentage (0-100%)")
    wind_speed = models.FloatField(help_text="Wind speed in km/h")
    wind_direction = models.FloatField(help_text="Wind direction in azimuth degrees (0-360°)")
    surface_pressure = models.FloatField(help_text="Atmospheric pressure in hPa")
    solar_radiation = models.FloatField(null=True, blank=True, help_text="Solar irradiance in W/m²")
    precipitation = models.FloatField(default=0.0, help_text="Precipitation depth in mm")

    class Meta:
        db_table = 'weather_observations'
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['station', '-timestamp'], name='weather_station_ts_idx'),
        ]

    def __str__(self):
        return f"{self.station.code} @ {self.timestamp} - {self.temperature}°C, {self.relative_humidity}% RH"
