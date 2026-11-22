"""
Initial migration for apps.alerts: AlertThreshold and AlertNotification models.
Depends on accounts.0001_initial and locations.0001_initial.
"""
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        ('accounts', '0001_initial'),
        ('locations', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='AlertThreshold',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('threshold_aqi', models.IntegerField(default=200, help_text='NAQI threshold for dispatch')),
                ('notify_email', models.BooleanField(default=True)),
                ('is_active', models.BooleanField(default=True)),
                ('sector', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='alert_thresholds', to='locations.sector')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='alerts', to='accounts.user')),
            ],
            options={
                'db_table': 'alerts_thresholds',
                'ordering': ['threshold_aqi'],
            },
        ),
        migrations.CreateModel(
            name='AlertNotification',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('aqi_recorded', models.IntegerField()),
                ('message', models.TextField()),
                ('sent_at', models.DateTimeField(auto_now_add=True)),
                ('read', models.BooleanField(default=False)),
                ('threshold', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='dispatched_notifications', to='alerts.alertthreshold')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='notifications', to='accounts.user')),
            ],
            options={
                'db_table': 'alerts_notifications',
                'ordering': ['-sent_at'],
            },
        ),
    ]
