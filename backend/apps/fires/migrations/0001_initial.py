"""
Initial migration for apps.fires: FireIncident model.
Depends on geo.0001_enable_postgis.
"""
from django.db import migrations, models
import apps.geo.compat


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        ('geo', '0001_enable_postgis'),
    ]

    operations = [
        migrations.CreateModel(
            name='FireIncident',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('source_id', models.CharField(db_index=True, max_length=100, unique=True)),
                ('location', apps.geo.compat.PointField(blank=True, null=True, srid=4326)),
                ('brightness_temperature', models.FloatField(help_text='Brightness temperature in Kelvin')),
                ('frp', models.FloatField(help_text='Fire Radiative Power in MegaWatts (MW)')),
                ('confidence', models.CharField(choices=[
                    ('low', 'Low Confidence'),
                    ('nominal', 'Nominal Confidence'),
                    ('high', 'High Confidence')
                ], default='nominal', max_length=20)),
                ('satellite', models.CharField(choices=[
                    ('MODIS', 'Terra/Aqua MODIS'),
                    ('VIIRS_SNPP', 'Suomi NPP VIIRS'),
                    ('VIIRS_NOAA20', 'NOAA-20 VIIRS')
                ], default='VIIRS_SNPP', max_length=30)),
                ('district', models.CharField(blank=True, max_length=100)),
                ('state', models.CharField(default='Punjab', max_length=50)),
                ('detected_at', models.DateTimeField(db_index=True)),
            ],
            options={
                'db_table': 'fires_incidents',
                'ordering': ['-detected_at'],
            },
        ),
    ]
