# core/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter

# Importa tus viewsets existentes como siempre…
# from .views import UsuarioViewSet, ParqueoViewSet, ...

# Nuevo: importamos la vista de cobro mock
from .payment_views import cobrar_tarjeta

router = DefaultRouter()
# router.register(r'usuarios', UsuarioViewSet, basename='usuario')
# router.register(r'parqueos', ParqueoViewSet, basename='parqueo')
# ... (deja aquí tus registros actuales)

urlpatterns = [
    path("", include(router.urls)),
    path("pagos/cobrar/", cobrar_tarjeta, name="cobrar_tarjeta"),  # 👈 NUEVO
]
