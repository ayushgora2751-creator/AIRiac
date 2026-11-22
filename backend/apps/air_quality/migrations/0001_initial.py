"""
Initial migration for apps.air_quality: PollutantReading model.
Depends on locations.0001_initial.
"""
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        ('locations', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='PollutantReading',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('timestamp', models.DateTimeField(db_index=True)),
                ('pm25', models.FloatField(blank=True, help_text='PM2.5 (24h avg in µg/m³)', null=True)),
                ('pm10', models.FloatField(blank=True, help_text='PM10 (24h avg in µg/m³)', null=True)),
                ('no2', models.FloatField(blank=True, help_text='NO2 (24h avg in µg/m³)', null=True)),
                ('so2', models.FloatField(blank=True, help_text='SO2 (24h avg in µg/m³)', null=True)),
                ('co', models.FloatField(blank=True, help_text='CO (8h avg in mg/m³)', null=True)),
                ('o3', models.FloatField(blank=True, help_text='Ozone (8h avg in µg/m³)', null=True)),
                ('nh3', models.FloatField(blank=True, help_text='NH3 (24h avg in µg/m³)', null=True)),
                ('pb', models.FloatField(blank=True, help_text='Lead (24h avg in µg/m³)', null=True)),
                ('aqi', models.IntegerField(blank=True, help_text='Computed CPCB NAQI score', null=True)),
                ('aqi_category', models.CharField(blank=True, max_length=30)),
                ('prominent_pollutant', models.CharField(blank=True, max_length=20)),
                ('sub_indices', models.JSONField(blank=True, default=dict)),
                ('station', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='readings', to='locations.monitoringstation')),
            ],
            options={
                'db_table': 'air_quality_readings',
                'ordering': ['-timestamp'],
                'indexes': [
                    models.Index(fields=['station', '-timestamp'], name='air_quality_station_ts_idx'),
                ],
            },
        ),
    ]
