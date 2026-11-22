"""
Initial migration for apps.forecasting: AQIForecast and TrendAnalysis models.
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
            name='AQIForecast',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('forecast_generated_at', models.DateTimeField(auto_now_add=True)),
                ('target_timestamp', models.DateTimeField(db_index=True)),
                ('predicted_aqi', models.IntegerField()),
                ('predicted_category', models.CharField(max_length=30)),
                ('confidence_interval_low', models.IntegerField()),
                ('confidence_interval_high', models.IntegerField()),
                ('primary_pollutant', models.CharField(default='PM2.5', max_length=20)),
                ('model_version', models.CharField(default='v1.0-mock-baseline', max_length=50)),
                ('station', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='forecasts', to='locations.monitoringstation')),
            ],
            options={
                'db_table': 'forecasting_aqi_forecasts',
                'ordering': ['target_timestamp'],
            },
        ),
        migrations.CreateModel(
            name='TrendAnalysis',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('period', models.CharField(choices=[('daily', 'Daily'), ('weekly', 'Weekly'), ('monthly', 'Monthly')], default='daily', max_length=20)),
                ('date', models.DateField(db_index=True)),
                ('avg_aqi', models.FloatField()),
                ('dominant_pollutant', models.CharField(default='PM2.5', max_length=20)),
                ('peak_hour', models.IntegerField(default=8)),
                ('station', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='trends', to='locations.monitoringstation')),
            ],
            options={
                'db_table': 'forecasting_trend_analysis',
                'ordering': ['-date'],
            },
        ),
    ]
