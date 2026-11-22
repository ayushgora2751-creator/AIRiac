"""
Initial migration for apps.geo: enables PostGIS extension in PostgreSQL
and initializes geographic boundary model.
"""
from django.db import migrations, models

try:
    from django.contrib.postgres.operations import CreateExtension
except ImportError:
    from django.db.migrations.operations.base import Operation

    class CreateExtension(Operation):
        def __init__(self, name):
            self.name = name

        def database_forwards(self, app_label, schema_editor, from_state, to_state):
            if schema_editor.connection.vendor == 'postgresql':
                schema_editor.execute(f"CREATE EXTENSION IF NOT EXISTS {self.name};")

        def database_backwards(self, app_label, schema_editor, from_state, to_state):
            pass


class Migration(migrations.Migration):
    initial = True
    dependencies = []

    operations = [
        CreateExtension('postgis'),
        migrations.CreateModel(
            name='GeoBoundary',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100, unique=True)),
                ('min_lat', models.FloatField()),
                ('max_lat', models.FloatField()),
                ('min_lng', models.FloatField()),
                ('max_lng', models.FloatField()),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
            options={
                'db_table': 'geo_boundaries',
                'verbose_name_plural': 'Geo Boundaries',
            },
        ),
    ]
