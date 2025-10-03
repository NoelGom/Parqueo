# api_parqueo/urls.py
from django.contrib import admin
from django.urls import path, include
from django.shortcuts import redirect
from rest_framework.routers import DefaultRouter

from core.views import (
    RolesViewSet, UsuariosViewSet, ParqueosViewSet, EspaciosViewSet,
    VehiculosViewSet, ReservasViewSet, PagosViewSet, SensoresViewSet, LecturasViewSet,
    StatsView, Reservas7dView,
)

router = DefaultRouter()
router.register(r'roles', RolesViewSet)
router.register(r'usuarios', UsuariosViewSet)
router.register(r'parqueos', ParqueosViewSet)
router.register(r'espacios', EspaciosViewSet)
router.register(r'vehiculos', VehiculosViewSet)
router.register(r'reservas', ReservasViewSet)
router.register(r'pagos', PagosViewSet)
router.register(r'sensores', SensoresViewSet)
router.register(r'lecturas', LecturasViewSet)

def root_redirect(_request):
    return redirect('/api/')

urlpatterns = [
    path('', root_redirect),                 # ← redirige la raíz al API root
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/stats/', StatsView.as_view(), name='stats'),
    path('api/stats/reservas7d/', Reservas7dView.as_view(), name='stats-reservas7d'),
]
