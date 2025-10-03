from datetime import timedelta, date
from django.db import transaction
from django.db.models import Count
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import (
    Espacios, Lecturas, Pagos, Parqueos, Reservas,
    Roles, Sensores, Usuarios, Vehiculos
)
from .serializers import (
    EspaciosSerializer, LecturasSerializer, PagosSerializer, ParqueosSerializer,
    ReservasSerializer, RolesSerializer, SensoresSerializer, UsuariosSerializer, VehiculosSerializer
)

# ---------- Base ----------
class BaseVS(viewsets.ModelViewSet):
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]

# ---------- ViewSets CRUD ----------
class RolesViewSet(BaseVS):
    queryset = Roles.objects.all()
    serializer_class = RolesSerializer

class UsuariosViewSet(BaseVS):
    queryset = Usuarios.objects.all()
    serializer_class = UsuariosSerializer
    search_fields = ["nombres", "apellidos", "email"]
    ordering_fields = ["id", "nombres", "apellidos", "email"]
    ordering = ["id"]

class ParqueosViewSet(BaseVS):
    queryset = Parqueos.objects.all()
    serializer_class = ParqueosSerializer

class EspaciosViewSet(BaseVS):
    queryset = Espacios.objects.all()
    serializer_class = EspaciosSerializer

    # ▼ Si tenés django-filter y querés filtros, activamos solo los que existan realmente
    try:
        from django_filters.rest_framework import DjangoFilterBackend  # type: ignore
        filter_backends = [filters.SearchFilter, filters.OrderingFilter, DjangoFilterBackend]

        _names = {f.name for f in Espacios._meta.get_fields()}
        _filterable = []
        if "parqueo" in _names: _filterable.append("parqueo")
        if "disponible" in _names: _filterable.append("disponible")
        # Solo setear si hay al menos uno; si no, no rompemos nada
        if _filterable:
            filterset_fields = _filterable
    except Exception:
        # Si no está django-filter o algo falla, seguimos con Search/Ordering sin filtros
        pass

    @transaction.atomic
    @action(detail=True, methods=["post"])
    def ocupar(self, request, pk=None):
        espacio = self.get_object()
        # Si tu campo se llama distinto a 'disponible', ajustá acá:
        if getattr(espacio, "disponible", None) is not None and int(espacio.disponible) == 0:
            return Response({"detail": "El espacio ya está ocupado."}, status=status.HTTP_400_BAD_REQUEST)

        if hasattr(espacio, "disponible"):
            espacio.disponible = 0
            espacio.save(update_fields=["disponible"])
        else:
            # Si tu modelo usa otro campo (por ejemplo 'estado'), ajustalo aquí
            # espacio.estado = 'ocupado'; espacio.save(update_fields=['estado'])
            pass

        # Registrar lectura si tu modelo lo permite (comentar si exige campos extra)
        try:
            Lecturas.objects.create(espacio=espacio)
        except Exception:
            pass

        return Response(EspaciosSerializer(espacio).data, status=status.HTTP_200_OK)

    @transaction.atomic
    @action(detail=True, methods=["post"])
    def liberar(self, request, pk=None):
        espacio = self.get_object()
        if getattr(espacio, "disponible", None) is not None and int(espacio.disponible) == 1:
            return Response({"detail": "El espacio ya está libre."}, status=status.HTTP_400_BAD_REQUEST)

        if hasattr(espacio, "disponible"):
            espacio.disponible = 1
            espacio.save(update_fields=["disponible"])
        else:
            # Si tu modelo usa otro campo, ajustalo aquí
            # espacio.estado = 'libre'; espacio.save(update_fields=['estado'])
            pass

        try:
            Lecturas.objects.create(espacio=espacio)
        except Exception:
            pass

        return Response(EspaciosSerializer(espacio).data, status=status.HTTP_200_OK)

class VehiculosViewSet(BaseVS):
    queryset = Vehiculos.objects.all()
    serializer_class = VehiculosSerializer

class ReservasViewSet(BaseVS):
    queryset = Reservas.objects.all()
    serializer_class = ReservasSerializer

class PagosViewSet(BaseVS):
    queryset = Pagos.objects.all()
    serializer_class = PagosSerializer

class SensoresViewSet(BaseVS):
    queryset = Sensores.objects.all()
    serializer_class = SensoresSerializer

class LecturasViewSet(BaseVS):
    queryset = Lecturas.objects.all()
    serializer_class = LecturasSerializer

# ---------- Estadísticas ----------
class StatsView(APIView):
    def get(self, request):
        data = {
            "usuarios": Usuarios.objects.count(),
            "parqueos": Parqueos.objects.count(),
            "espacios": Espacios.objects.count(),
            "vehiculos": Vehiculos.objects.count(),
            "reservas": Reservas.objects.count(),
            "pagos": Pagos.objects.count(),
        }
        return Response(data)

class Reservas7dView(APIView):
    def get(self, request):
        today = date.today()
        days = [today - timedelta(days=i) for i in range(6, -1, -1)]
        # Elegir campo fecha si existe
        def has_field(model, name): return name in [f.name for f in model._meta.fields]
        date_field = "creado_en__date" if has_field(Reservas, "creado_en") else ("inicio__date" if has_field(Reservas, "inicio") else None)

        counts_by_date = {d: 0 for d in days}
        if date_field:
            qs = (Reservas.objects
                  .filter(**{f"{date_field}__gte": days[0], f"{date_field}__lte": days[-1]})
                  .values(date_field).annotate(count=Count("id")))
            for row in qs:
                d = row[date_field]
                counts_by_date[d] = row["count"]
        series = [{"date": d.isoformat(), "count": counts_by_date[d]} for d in days]
        return Response({"series": series})
