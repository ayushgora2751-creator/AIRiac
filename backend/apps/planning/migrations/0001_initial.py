"""
Initial migration for apps.planning: CleanRouteQuery and RouteOption models.
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
            name='CleanRouteQuery',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('origin', apps.geo.compat.PointField(blank=True, null=True, srid=4326)),
                ('destination', apps.geo.compat.PointField(blank=True, null=True, srid=4326)),
                ('departure_time', models.DateTimeField()),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
            options={
                'db_table': 'planning_route_queries',
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='RouteOption',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('route_type', models.CharField(choices=[('fastest', 'Fastest Route'), ('cleanest', 'Lowest Cumulative Exposure')], default='cleanest', max_length=30)),
                ('route_geometry', apps.geo.compat.LineStringField(blank=True, null=True, srid=4326)),
                ('estimated_duration_mins', models.IntegerField()),
                ('average_aqi_exposure', models.FloatField()),
                ('query', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='options', to='planning.cleanroutequery')),
            ],
            options={
                'db_table': 'planning_route_options',
            },
        ),
    ]
