"""
Models for apps.geo. Spatial primitives and reference boundaries.
"""
from django.db import models


class GeoBoundary(models.Model):
    """Reference boundary definition for Chandigarh region."""
    name = models.CharField(max_length=100, unique=True)
    min_lat = models.FloatField()
    max_lat = models.FloatField()
    min_lng = models.FloatField()
    max_lng = models.FloatField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'geo_boundaries'
        verbose_name_plural = 'Geo Boundaries'

    def __str__(self):
        return self.name
