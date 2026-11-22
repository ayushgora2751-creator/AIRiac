"""
Models for apps.community: Crowdsourced citizen science pollution incident reporting.
"""
from django.db import models
from apps.geo.compat import PointField


class CitizenReport(models.Model):
    REPORT_TYPE_CHOICES = [
        ('stubble', 'Stubble Burning'),
        ('garbage', 'Garbage Burning'),
        ('industrial', 'Industrial Smoke'),
        ('dust', 'Road / Construction Dust'),
        ('odor', 'Severe Odor'),
    ]

    STATUS_CHOICES = [
        ('pending', 'Pending Verification'),
        ('verified', 'Verified Incident'),
        ('resolved', 'Resolved'),
    ]

    user = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='citizen_reports',
    )
    report_type = models.CharField(max_length=50, choices=REPORT_TYPE_CHOICES, default='garbage')
    sector = models.ForeignKey(
        'locations.Sector',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='citizen_reports',
    )
    location = PointField(srid=4326, null=True, blank=True)
    description = models.TextField()
    image_url = models.URLField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    upvotes = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'community_citizen_reports'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.report_type} in {self.sector} @ {self.created_at} ({self.status})"
