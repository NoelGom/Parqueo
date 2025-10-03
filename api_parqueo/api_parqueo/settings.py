"""
Django settings for api_parqueo project.
"""

from pathlib import Path
import os
from dotenv import load_dotenv

# Carga variables desde .env (que está junto a manage.py)
load_dotenv()

# Paths
BASE_DIR = Path(__file__).resolve().parent.parent

# Seguridad / Debug
SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key-no-usar-en-produccion")
DEBUG = os.getenv("DEBUG", "true").lower() == "true"

# Para desarrollo podemos dejar todo abierto; en prod, ajustá dominios/IPs
ALLOWED_HOSTS = os.getenv("ALLOWED_HOSTS", "*").split(",")

# Apps
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    # Terceros
    "rest_framework",
    "corsheaders",
    #app
    "core",
]

# Middleware (CORS al inicio)
MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "api_parqueo.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "api_parqueo.wsgi.application"

# Base de datos: MySQL (RDS)
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.mysql",
        "NAME": os.getenv("DB_NAME"),
        "USER": os.getenv("DB_USER"),
        "PASSWORD": os.getenv("DB_PASS"),
        "HOST": os.getenv("DB_HOST"),
        "PORT": os.getenv("DB_PORT", "3306"),
        "OPTIONS": {
            "charset": "utf8mb4",
            # SSL opcional si tenés el CA (descomentá y seteá DB_SSL_CA en .env)
            # **({"ssl": {"ca": os.getenv("DB_SSL_CA")}} if os.getenv("DB_SSL_CA") else {})
        },
    }
}

# DRF (paginación simple de ejemplo)
REST_FRAMEWORK = {
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 20,
}

# CORS (abierto para desarrollo)
CORS_ALLOW_ALL_ORIGINS = True
# Si querés ser específico:
# CORS_ALLOWED_ORIGINS = ["http://localhost:3000", "http://127.0.0.1:3000"]

# (Opcional) CSRF si usás front en otro host
# CSRF_TRUSTED_ORIGINS = ["http://localhost:3000", "http://127.0.0.1:3000"]

# Internacionalización
LANGUAGE_CODE = "es"
TIME_ZONE = "America/Guatemala"
USE_I18N = True
USE_TZ = False

# Archivos estáticos
STATIC_URL = "static/"

# Primary key por defecto
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
