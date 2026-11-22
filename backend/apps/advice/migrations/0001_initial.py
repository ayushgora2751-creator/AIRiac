"""
Initial migration for apps.advice: Advisory model.
Depends on air_quality.0001_initial.
"""
from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        ('air_quality', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Advisory',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('aqi_category', models.CharField(db_index=True, max_length=30, unique=True)),
                ('headline', models.CharField(max_length=200)),
                ('general_public_advice', models.TextField()),
                ('vulnerable_group_advice', models.TextField()),
                ('mask_guidance', models.CharField(max_length=100)),
                ('indoor_air_guidance', models.CharField(max_length=200)),
                ('exercise_guidance', models.CharField(max_length=200)),
            ],
            options={
                'verbose_name_plural': 'Advisories',
                'db_table': 'advice_advisories',
            },
        ),
    ]
