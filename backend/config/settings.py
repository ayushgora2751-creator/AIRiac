"""
Django settings for AIRiac (Urban Air Quality Assistant - Chandigarh First).
Phase 0 Architecture Foundation.
"""
import os
import sys
import socket
from datetime import timedelta
from pathlib import Path
from dotenv import load_dotenv

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Load .env file from monorepo root or backend directory if present
load_dotenv(BASE_DIR.parent / '.env')
load_dotenv(BASE_DIR / '.env')

# Quick-start development settings - unsuitable for production
SECRET_KEY = os.environ.get(
    'SECRET_KEY',
    'django-insecure-phase0-airiac-chandigarh-development-key-xyz123'
)

DEBUG = os.environ.get('DEBUG', 'True').lower() in ('true', '1', 'yes')

# Allowed Hosts configuration for local dev and Render cloud deployment
ALLOWED_HOSTS_ENV = os.environ.get('ALLOWED_HOSTS', '')
env_hosts = [h.strip() for h in ALLOWED_HOSTS_ENV.split(',') if h.strip()]

ALLOWED_HOSTS = [
    'airiac-backend.onrender.com',
    '.onrender.com',
    'localhost',
    '127.0.0.1',
    '0.0.0.0',
    'web',
    'frontend',
] + env_hosts

# Deduplicate while preserving order
ALLOWED_HOSTS = list(dict.fromkeys(ALLOWED_HOSTS))

if '*' not in ALLOWED_HOSTS and DEBUG:
    ALLOWED_HOSTS.append('*')

# Reverse Proxy SSL Header for Render deployment
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

# CSRF Trusted Origins for Render cloud and local frontend
CSRF_TRUSTED_ORIGINS_ENV = os.environ.get('CSRF_TRUSTED_ORIGINS', '')
env_csrf = [o.strip() for o in CSRF_TRUSTED_ORIGINS_ENV.split(',') if o.strip()]

CSRF_TRUSTED_ORIGINS = [
    'https://airiac-backend.onrender.com',
    'https://airiac-frontend.onrender.com',
    'https://*.onrender.com',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000',
] + env_csrf

CSRF_TRUSTED_ORIGINS = list(dict.fromkeys(CSRF_TRUSTED_ORIGINS))

# Custom User Model
AUTH_USER_MODEL = 'accounts.User'

# Check whether native PostGIS / GDAL C-libraries are available
HAS_GDAL = False
try:
    from django.contrib.gis.gdal import HAS_GDAL as _HAS_GDAL
    HAS_GDAL = bool(_HAS_GDAL)
except Exception:
    HAS_GDAL = False

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third-party packages
    'rest_framework',
    'rest_framework_simplejwt',
    'drf_spectacular',
    'corsheaders',
    'django_celery_beat',

    # 13 AIRiac Domain Applications
    'apps.geo',
    'apps.locations',
    'apps.accounts',
    'apps.air_quality',
    'apps.weather',
    'apps.fires',
    'forecasting',
    'apps.impact',
    'apps.advice',
    'apps.alerts',
    'apps.reports',
    'apps.planning',
    'apps.community',
]

# Fix app label for forecasting if necessary
for idx, app_name in enumerate(INSTALLED_APPS):
    if app_name == 'forecasting':
        INSTALLED_APPS[idx] = 'apps.forecasting'

if HAS_GDAL:
    INSTALLED_APPS.insert(0, 'django.contrib.gis')

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'
ASGI_APPLICATION = 'config.asgi.application'

# Database Configuration with PostGIS / SQLite Fallback
DB_ENGINE = os.environ.get('DB_ENGINE')
DB_NAME = os.environ.get('DB_NAME')
DB_USER = os.environ.get('DB_USER')
DB_PASSWORD = os.environ.get('DB_PASSWORD')
DB_HOST = os.environ.get('DB_HOST')
DB_PORT = os.environ.get('DB_PORT', '5432')

is_testing = 'test' in sys.argv or 'pytest' in sys.modules


def _can_resolve_host(host):
    if not host:
        return False
    try:
        socket.gethostbyname(host)
        return True
    except (socket.error, OSError):
        return False


# If running in Docker (or DB_HOST is resolvable) and not running unit tests:
if DB_HOST and _can_resolve_host(DB_HOST) and not is_testing:
    engine = DB_ENGINE
    if not engine:
        engine = 'django.contrib.gis.db.backends.postgis' if HAS_GDAL else 'django.db.backends.postgresql'
    DATABASES = {
        'default': {
            'ENGINE': engine,
            'NAME': DB_NAME or 'airiac_db',
            'USER': DB_USER or 'airiac',
            'PASSWORD': DB_PASSWORD or 'airiac_secure_password',
            'HOST': DB_HOST,
            'PORT': DB_PORT,
        }
    }
else:
    # Local developer / pytest fallback (SQLite)
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
        'OPTIONS': {'min_length': 8},
    },
]

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = os.environ.get('TIME_ZONE', 'Asia/Kolkata')
USE_I18N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Django REST Framework Settings
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.AllowAny',
    ),
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
}

# SimpleJWT Authentication Settings
ACCESS_LIFETIME_MIN = int(os.environ.get('SIMPLE_JWT_ACCESS_TOKEN_LIFETIME_MINUTES', 60))
REFRESH_LIFETIME_DAYS = int(os.environ.get('SIMPLE_JWT_REFRESH_TOKEN_LIFETIME_DAYS', 7))

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=ACCESS_LIFETIME_MIN),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=REFRESH_LIFETIME_DAYS),
    'ROTATE_REFRESH_TOKENS': False,
    'BLACKLIST_AFTER_ROTATION': False,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'AUTH_HEADER_TYPES': ('Bearer',),
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
}

# drf-spectacular OpenAPI 3.0 Documentation Settings
SPECTACULAR_SETTINGS = {
    'TITLE': 'AIRiac Urban Air Quality Assistant API',
    'DESCRIPTION': (
        'Hyper-local, real-time environmental decision-support API for the Chandigarh capital region '
        '(Tricity: Chandigarh UT, Mohali, Panchkula). Phase 0 Foundation.'
    ),
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
    'COMPONENT_SPLIT_REQUEST': True,
}

def _can_connect_redis(url):
    if not url:
        return False
    try:
        from urllib.parse import urlparse
        parsed = urlparse(url)
        if not parsed.hostname:
            return False
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.settimeout(0.3)
        res = s.connect_ex((parsed.hostname, parsed.port or 6379))
        s.close()
        return res == 0
    except Exception:
        return False


# Cache Configuration (Redis with LocMem fallback for local dev / tests)
REDIS_URL = os.environ.get('CACHE_URL', os.environ.get('REDIS_URL', 'redis://127.0.0.1:6379/1'))
CACHE_BACKEND = os.environ.get('CACHE_BACKEND')

if not CACHE_BACKEND:
    if is_testing or not _can_connect_redis(REDIS_URL):
        CACHE_BACKEND = 'django.core.cache.backends.locmem.LocMemCache'
    else:
        CACHE_BACKEND = 'django_redis.cache.RedisCache'

if 'redis' in CACHE_BACKEND.lower():
    CACHES = {
        'default': {
            'BACKEND': 'django_redis.cache.RedisCache',
            'LOCATION': REDIS_URL,
            'OPTIONS': {
                'CLIENT_CLASS': 'django_redis.client.DefaultClient',
                'IGNORE_EXCEPTIONS': True,
            }
        }
    }
else:
    CACHES = {
        'default': {
            'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
            'LOCATION': 'airiac-test-cache',
        }
    }

# CORS Settings
CORS_ALLOW_ALL_ORIGINS = os.environ.get('CORS_ALLOW_ALL_ORIGINS', 'False').lower() in ('true', '1')
CORS_ALLOWED_ORIGINS_RAW = os.environ.get(
    'CORS_ALLOWED_ORIGINS',
    'https://airiac-frontend.onrender.com,http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000'
)
CORS_ALLOWED_ORIGINS = [orig.strip() for orig in CORS_ALLOWED_ORIGINS_RAW.split(',') if orig.strip()]
if 'https://airiac-frontend.onrender.com' not in CORS_ALLOWED_ORIGINS:
    CORS_ALLOWED_ORIGINS.append('https://airiac-frontend.onrender.com')

CORS_ALLOWED_ORIGIN_REGEXES = [
    r"^https:\/\/.*\.onrender\.com$",
    r"^http:\/\/localhost:[0-9]+$",
    r"^http:\/\/127\.0\.0\.1:[0-9]+$",
]

# Celery Broker & Results Configuration
CELERY_BROKER_URL = os.environ.get('CELERY_BROKER_URL', 'redis://127.0.0.1:6379/0')
CELERY_RESULT_BACKEND = os.environ.get('CELERY_RESULT_BACKEND', 'redis://127.0.0.1:6379/0')
CELERY_TIMEZONE = os.environ.get('CELERY_TIMEZONE', TIME_ZONE)
