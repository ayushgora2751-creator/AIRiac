"""
Models for apps.fires: Agricultural stubble fires and thermal anomalies.
"""
from django.db import models
from apps.geo.compat import PointField


class FireIncident(models.Model):
    SATELLITE_CHOICES = [
        ('MODIS', 'Terra/Aqua MODIS'),
        ('VIIRS_SNPP', 'Suomi NPP VIIRS'),
        ('VIIRS_NOAA20', 'NOAA-20 VIIRS'),
    ]

    CONFIDENCE_CHOICES = [
        ('low', 'Low Confidence'),
        ('nominal', 'Nominal Confidence'),
        ('high', 'High Confidence'),
    ]

    source_id = models.CharField(max_length=100, unique=True, db_index=True)
    location = PointField(srid=4326, null=True, blank=True)
    brightness_temperature = models.FloatField(help_text="Brightness temperature in Kelvin")
    frp = models.FloatField(help_text="Fire Radiative Power in MegaWatts (MW)")
    confidence = models.CharField(max_length=20, choices=CONFIDENCE_CHOICES, default='nominal')
    satellite = models.CharField(max_length=30, choices=SATELLITE_CHOICES, default='VIIRS_SNPP')
    district = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=50, default='Punjab')
    detected_at = models.DateTimeField(db_index=True)

    class Meta:
        db_table = 'fires_incidents'
        ordering = ['-detected_at']

    def __str__(self):
        return f"{self.source_id} - {self.district}, {self.state} ({self.frp} MW)"
