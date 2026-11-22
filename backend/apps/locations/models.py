"""
Models for apps.locations: Chandigarh sectors and CAAQMS air quality monitoring stations.
"""
from django.db import models
from apps.geo.compat import PointField, PolygonField


class Sector(models.Model):
    ZONE_CHOICES = [
        ('north', 'North Zone'),
        ('south', 'South Zone'),
        ('east', 'East Zone'),
        ('west', 'West Zone'),
        ('central', 'Central Zone'),
        ('industrial', 'Industrial Zone'),
        ('peripheral', 'Peripheral Tricity'),
    ]

    sector_number = models.CharField(max_length=30, unique=True, db_index=True)
    name = models.CharField(max_length=100)
    zone = models.CharField(max_length=30, choices=ZONE_CHOICES, default='central')
    center_point = PointField(srid=4326, null=True, blank=True)
    boundary = PolygonField(srid=4326, null=True, blank=True)

    class Meta:
        db_table = 'locations_sectors'
        ordering = ['sector_number']

    def __str__(self):
        return f"{self.sector_number} - {self.name}"


class MonitoringStation(models.Model):
    STATION_TYPE_CHOICES = [
        ('CAAQMS', 'Continuous Ambient Air Quality Monitoring Station'),
        ('NAMP', 'National Air Quality Monitoring Programme (Manual)'),
        ('LOW_COST', 'Low Cost Sensor Mesh'),
    ]

    code = models.CharField(max_length=50, unique=True, db_index=True)
    name = models.CharField(max_length=150)
    station_type = models.CharField(max_length=30, choices=STATION_TYPE_CHOICES, default='CAAQMS')
    operator = models.CharField(max_length=100, default='CPCC / CPCB')
    location = PointField(srid=4326, null=True, blank=True)
    sector = models.ForeignKey(Sector, on_delete=models.SET_NULL, null=True, blank=True, related_name='stations')
    elevation_m = models.FloatField(default=321.0)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'locations_stations'
        ordering = ['code']

    def __str__(self):
        return f"{self.code} ({self.name})"
