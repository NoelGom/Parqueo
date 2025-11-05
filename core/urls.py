# core/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    healthcheck,
    RolViewSet,
    UsuarioViewSet,
    ParqueoViewSet,
    EspacioViewSet,
    VehiculoViewSet,
    ReservaViewSet,
    PagoViewSet,
    SensorViewSet,
    LecturaViewSet,
)
from .payment_views import cobrar_tarjeta

router = DefaultRouter()
router.register(r"roles", RolViewSet, basename="rol")
router.register(r"usuarios", UsuarioViewSet, basename="usuario")
router.register(r"parqueos", ParqueoViewSet, basename="parqueo")
router.register(r"espacios", EspacioViewSet, basename="espacio")
router.register(r"vehiculos", VehiculoViewSet, basename="vehiculo")
router.register(r"reservas", ReservaViewSet, basename="reserva")
router.register(r"pagos", PagoViewSet, basename="pago")
router.register(r"sensores", SensorViewSet, basename="sensor")
router.register(r"lecturas", LecturaViewSet, basename="lectura")

urlpatterns = [
    path("", include(router.urls)),
    path("status/", healthcheck, name="healthcheck"),
    path("pagos/cobrar/", cobrar_tarjeta, name="cobrar_tarjeta"),  # 👈 NUEVO
]
