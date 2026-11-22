"""
Initial migration for apps.impact: VulnerableGroup and HealthImpactMatrix models.
Depends on accounts.0001_initial.
"""
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        ('accounts', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='VulnerableGroup',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('code', models.CharField(db_index=True, max_length=30, unique=True)),
                ('name', models.CharField(max_length=100)),
                ('description', models.TextField(blank=True)),
            ],
            options={
                'db_table': 'impact_vulnerable_groups',
                'ordering': ['name'],
            },
        ),
        migrations.CreateModel(
            name='HealthImpactMatrix',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('aqi_category', models.CharField(db_index=True, max_length=30)),
                ('risk_level', models.CharField(choices=[
                    ('low', 'Low Risk'),
                    ('moderate', 'Moderate Risk'),
                    ('high', 'High Risk'),
                    ('severe', 'Severe Risk'),
                    ('critical', 'Critical Risk')
                ], default='moderate', max_length=20)),
                ('symptoms', models.TextField()),
                ('recommended_precautions', models.TextField()),
                ('vulnerable_group', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='impact_matrix', to='impact.vulnerablegroup')),
            ],
            options={
                'db_table': 'impact_health_matrix',
                'unique_together': {('aqi_category', 'vulnerable_group')},
            },
        ),
    ]
