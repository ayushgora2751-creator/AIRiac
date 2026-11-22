"""
Models for apps.alerts: User notification thresholds and alert dispatch logs.
"""
from django.db import models


class AlertThreshold(models.Model):
    user = models.ForeignKey(
        'accounts.User',
        on_delete=models.CASCADE,
        related_name='alerts',
    )
    sector = models.ForeignKey(
        'locations.Sector',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='alert_thresholds',
    )
    threshold_aqi = models.IntegerField(default=200, help_text="NAQI threshold for dispatch")
    notify_email = models.BooleanField(default=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'alerts_thresholds'
        ordering = ['threshold_aqi']

    def __str__(self):
        return f"{self.user.email} - Threshold: {self.threshold_aqi} AQI"


class AlertNotification(models.Model):
    user = models.ForeignKey(
        'accounts.User',
        on_delete=models.CASCADE,
        related_name='notifications',
    )
    threshold = models.ForeignKey(
        AlertThreshold,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='dispatched_notifications',
    )
    aqi_recorded = models.IntegerField()
    message = models.TextField()
    sent_at = models.DateTimeField(auto_now_add=True)
    read = models.BooleanField(default=False)

    class Meta:
        db_table = 'alerts_notifications'
        ordering = ['-sent_at']

    def __str__(self):
        return f"Notification to {self.user.email} @ {self.sent_at} (AQI: {self.aqi_recorded})"
