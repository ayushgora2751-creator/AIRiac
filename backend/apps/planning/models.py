"""
Models for apps.planning: Clean route navigation and cumulative exposure queries.
"""
from django.db import models
from apps.geo.compat import PointField, LineStringField


class CleanRouteQuery(models.Model):
    origin = PointField(srid=4326, null=True, blank=True)
    destination = PointField(srid=4326, null=True, blank=True)
    departure_time = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'planning_route_queries'
        ordering = ['-created_at']

    def __str__(self):
        return f"Route Query @ {self.created_at}"


class RouteOption(models.Model):
    ROUTE_TYPE_CHOICES = [
        ('fastest', 'Fastest Route'),
        ('cleanest', 'Lowest Cumulative Exposure'),
    ]

    query = models.ForeignKey(
        CleanRouteQuery,
        on_delete=models.CASCADE,
        related_name='options',
    )
    route_type = models.CharField(max_length=30, choices=ROUTE_TYPE_CHOICES, default='cleanest')
    route_geometry = LineStringField(srid=4326, null=True, blank=True)
    estimated_duration_mins = models.IntegerField()
    average_aqi_exposure = models.FloatField()

    class Meta:
        db_table = 'planning_route_options'

    def __str__(self):
        return f"{self.route_type} ({self.estimated_duration_mins} mins, Exposure: {self.average_aqi_exposure})"
