"""
Initial migration for apps.reports: DailyReport model.
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
            name='DailyReport',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('report_date', models.DateField(db_index=True, unique=True)),
                ('city_avg_aqi', models.FloatField()),
                ('max_aqi', models.IntegerField()),
                ('min_aqi', models.IntegerField()),
                ('primary_pollutant', models.CharField(default='PM2.5', max_length=20)),
                ('compliance_status', models.CharField(max_length=50)),
                ('summary_text', models.TextField()),
                ('max_station', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='highest_aqi_reports', to='locations.monitoringstation')),
            ],
            options={
                'db_table': 'reports_daily',
                'ordering': ['-report_date'],
            },
        ),
    ]
