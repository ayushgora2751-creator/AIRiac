"""
Initial migration for apps.community: CitizenReport model.
Depends on accounts.0001_initial and locations.0001_initial.
"""
from django.db import migrations, models
import django.db.models.deletion
import apps.geo.compat


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        ('accounts', '0001_initial'),
        ('locations', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='CitizenReport',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('report_type', models.CharField(choices=[
                    ('stubble', 'Stubble Burning'),
                    ('garbage', 'Garbage Burning'),
                    ('industrial', 'Industrial Smoke'),
                    ('dust', 'Road / Construction Dust'),
                    ('odor', 'Severe Odor')
                ], default='garbage', max_length=50)),
                ('location', apps.geo.compat.PointField(blank=True, null=True, srid=4326)),
                ('description', models.TextField()),
                ('image_url', models.URLField(blank=True)),
                ('status', models.CharField(choices=[
                    ('pending', 'Pending Verification'),
                    ('verified', 'Verified Incident'),
                    ('resolved', 'Resolved')
                ], default='pending', max_length=20)),
                ('upvotes', models.PositiveIntegerField(default=0)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('sector', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='citizen_reports', to='locations.sector')),
                ('user', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='citizen_reports', to='accounts.user')),
            ],
            options={
                'db_table': 'community_citizen_reports',
                'ordering': ['-created_at'],
            },
        ),
    ]
