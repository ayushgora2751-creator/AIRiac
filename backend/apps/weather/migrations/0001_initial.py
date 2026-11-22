"""
Initial migration for apps.weather: WeatherObservation model.
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
            name='WeatherObservation',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('timestamp', models.DateTimeField(db_index=True)),
                ('temperature', models.FloatField(help_text='Ambient temperature in °C')),
                ('relative_humidity', models.FloatField(help_text='Relative humidity percentage (0-100%)')),
                ('wind_speed', models.FloatField(help_text='Wind speed in km/h')),
                ('wind_direction', models.FloatField(help_text='Wind direction in azimuth degrees (0-360°)')),
                ('surface_pressure', models.FloatField(help_text='Atmospheric pressure in hPa')),
                ('solar_radiation', models.FloatField(blank=True, help_text='Solar irradiance in W/m²', null=True)),
                ('precipitation', models.FloatField(default=0.0, help_text='Precipitation depth in mm')),
                ('station', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='weather', to='locations.monitoringstation')),
            ],
            options={
                'db_table': 'weather_observations',
                'ordering': ['-timestamp'],
                'indexes': [
                    models.Index(fields=['station', '-timestamp'], name='weather_station_ts_idx'),
                ],
            },
        ),
    ]
