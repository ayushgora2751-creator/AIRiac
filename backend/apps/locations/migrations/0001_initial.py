"""
Initial migration for apps.locations: Sector and MonitoringStation models.
Depends on geo.0001_enable_postgis.
"""
from django.db import migrations, models
import django.db.models.deletion
import apps.geo.compat


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        ('geo', '0001_enable_postgis'),
    ]

    operations = [
        migrations.CreateModel(
            name='Sector',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('sector_number', models.CharField(db_index=True, max_length=30, unique=True)),
                ('name', models.CharField(max_length=100)),
                ('zone', models.CharField(choices=[
                    ('north', 'North Zone'),
                    ('south', 'South Zone'),
                    ('east', 'East Zone'),
                    ('west', 'West Zone'),
                    ('central', 'Central Zone'),
                    ('industrial', 'Industrial Zone'),
                    ('peripheral', 'Peripheral Tricity')
                ], default='central', max_length=30)),
                ('center_point', apps.geo.compat.PointField(blank=True, null=True, srid=4326)),
                ('boundary', apps.geo.compat.PolygonField(blank=True, null=True, srid=4326)),
            ],
            options={
                'db_table': 'locations_sectors',
                'ordering': ['sector_number'],
            },
        ),
        migrations.CreateModel(
            name='MonitoringStation',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('code', models.CharField(db_index=True, max_length=50, unique=True)),
                ('name', models.CharField(max_length=150)),
                ('station_type', models.CharField(choices=[
                    ('CAAQMS', 'Continuous Ambient Air Quality Monitoring Station'),
                    ('NAMP', 'National Air Quality Monitoring Programme (Manual)'),
                    ('LOW_COST', 'Low Cost Sensor Mesh')
                ], default='CAAQMS', max_length=30)),
                ('operator', models.CharField(default='CPCC / CPCB', max_length=100)),
                ('location', apps.geo.compat.PointField(blank=True, null=True, srid=4326)),
                ('elevation_m', models.FloatField(default=321.0)),
                ('is_active', models.BooleanField(default=True)),
                ('sector', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='stations', to='locations.sector')),
            ],
            options={
                'db_table': 'locations_stations',
                'ordering': ['code'],
            },
        ),
    ]
