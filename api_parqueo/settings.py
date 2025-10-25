"""
Configuración de Django para el proyecto api_parqueo.
Conectado a la base de datos MySQL RDS en AWS.
"""

from pathlib import Path
import pymysql
pymysql.install_as_MySQLdb()

# ---------------------------------------------------------
# RUTAS Y CONFIGURACIÓN BÁSICA
# ---------------------------------------------------------
BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = 'dev-secret-noel'
DEBUG = True
ALLOWED_HOSTS = ['*']  # en desarrollo aceptamos todas

# ---------------------------------------------------------
# APLICACIONES INSTALADAS
# ---------------------------------------------------------
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',     
    'corsheaders',        
    'core',               
]

# ---------------------------------------------------------
# MIDDLEWARE
# ---------------------------------------------------------
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

ROOT_URLCONF = 'api_parqueo.urls'

# ---------------------------------------------------------
# PLANTILLAS
# ---------------------------------------------------------
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'api_parqueo.wsgi.application'

# ---------------------------------------------------------
# BASE DE DATOS - CONEXIÓN A RDS MySQL (AWS)
# ---------------------------------------------------------
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'parqueo_inteligente',
        'USER': 'django_parqueo',
        'PASSWORD': '1234',  
        'HOST': 'database-parqueo.c502ygci4x8i.us-west-1.rds.amazonaws.com',
        'PORT': '3306',
        'OPTIONS': {
            'init_command': "SET sql_mode='STRICT_TRANS_TABLES'",
        },
    }
}


# ---------------------------------------------------------
# VALIDACIÓN DE CONTRASEÑAS (por defecto)
# ---------------------------------------------------------
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# ---------------------------------------------------------
# LOCALIZACIÓN Y ZONA HORARIA
# ---------------------------------------------------------
LANGUAGE_CODE = 'es'
TIME_ZONE = 'America/Guatemala'
USE_I18N = True
USE_TZ = True

# ---------------------------------------------------------
# ARCHIVOS ESTÁTICOS
# ---------------------------------------------------------
STATIC_URL = 'static/'
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# ---------------------------------------------------------
# CONFIGURACIÓN DE REST FRAMEWORK
# ---------------------------------------------------------
REST_FRAMEWORK = {
    'DEFAULT_RENDERER_CLASSES': ['rest_framework.renderers.JSONRenderer'],
}

MIGRATION_MODULES = {"core": None}

# ---------------------------------------------------------
# CORS (para permitir peticiones desde tu frontend Vite/React)
# ---------------------------------------------------------
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
CORS_ALLOW_CREDENTIALS = True
