from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    status,
    RolViewSet, UsuarioViewSet, ParqueoViewSet, EspacioViewSet,
    VehiculoViewSet, ReservaViewSet, PagoViewSet, SensorViewSet, LecturaViewSet,
    StatsSummary, StatsReservas7d
)

router = DefaultRouter()
router.register(r"roles", RolViewSet, basename="roles")
router.register(r"usuarios", UsuarioViewSet, basename="usuarios")
router.register(r"parqueos", ParqueoViewSet, basename="parqueos")
router.register(r"espacios", EspacioViewSet, basename="espacios")
router.register(r"vehiculos", VehiculoViewSet, basename="vehiculos")
router.register(r"reservas", ReservaViewSet, basename="reservas")
router.register(r"pagos", PagoViewSet, basename="pagos")
router.register(r"sensores", SensorViewSet, basename="sensores")
router.register(r"lecturas", LecturaViewSet, basename="lecturas")

urlpatterns = [
    path("status/", status, name="api-status"),
    path("stats/", StatsSummary.as_view(), name="api-stats"),
    path("stats/reservas7d/", StatsReservas7d.as_view(), name="api-stats-7d"),
    path("", include(router.urls)),
]
