"""
Models for apps.advice: Actionable health advisories and activity guidelines.
"""
from django.db import models


class Advisory(models.Model):
    aqi_category = models.CharField(max_length=30, unique=True, db_index=True)
    headline = models.CharField(max_length=200)
    general_public_advice = models.TextField()
    vulnerable_group_advice = models.TextField()
    mask_guidance = models.CharField(max_length=100)
    indoor_air_guidance = models.CharField(max_length=200)
    exercise_guidance = models.CharField(max_length=200)

    class Meta:
        db_table = 'advice_advisories'
        verbose_name_plural = 'Advisories'

    def __str__(self):
        return f"Advisory for {self.aqi_category}: {self.headline}"
