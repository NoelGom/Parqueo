from rest_framework.routers import DefaultRouter
from .views import (
    RolesViewSet, UsuariosViewSet, ParqueosViewSet, EspaciosViewSet,
    VehiculosViewSet, ReservasViewSet, PagosViewSet, SensoresViewSet, LecturasViewSet
)

router = DefaultRouter()
router.register(r"roles", RolesViewSet, basename="roles")
router.register(r"usuarios", UsuariosViewSet, basename="usuarios")
router.register(r"parqueos", ParqueosViewSet, basename="parqueos")
router.register(r"espacios", EspaciosViewSet, basename="espacios")
router.register(r"vehiculos", VehiculosViewSet, basename="vehiculos")
router.register(r"reservas", ReservasViewSet, basename="reservas")
router.register(r"pagos", PagosViewSet, basename="pagos")
router.register(r"sensores", SensoresViewSet, basename="sensores")
router.register(r"lecturas", LecturasViewSet, basename="lecturas")

urlpatterns = router.urls
