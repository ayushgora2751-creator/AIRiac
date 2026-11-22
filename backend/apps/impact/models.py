"""
Models for apps.impact: Vulnerable demographic groups and health risk assessment matrices.
"""
from django.db import models


class VulnerableGroup(models.Model):
    code = models.CharField(max_length=30, unique=True, db_index=True)
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)

    class Meta:
        db_table = 'impact_vulnerable_groups'
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.code})"


class HealthImpactMatrix(models.Model):
    RISK_LEVEL_CHOICES = [
        ('low', 'Low Risk'),
        ('moderate', 'Moderate Risk'),
        ('high', 'High Risk'),
        ('severe', 'Severe Risk'),
        ('critical', 'Critical Risk'),
    ]

    aqi_category = models.CharField(max_length=30, db_index=True)
    vulnerable_group = models.ForeignKey(
        VulnerableGroup,
        on_delete=models.CASCADE,
        related_name='impact_matrix',
    )
    risk_level = models.CharField(max_length=20, choices=RISK_LEVEL_CHOICES, default='moderate')
    symptoms = models.TextField()
    recommended_precautions = models.TextField()

    class Meta:
        db_table = 'impact_health_matrix'
        unique_together = ('aqi_category', 'vulnerable_group')

    def __str__(self):
        return f"{self.aqi_category} - {self.vulnerable_group.code} ({self.risk_level})"
