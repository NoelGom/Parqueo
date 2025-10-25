from datetime import timedelta
from django.utils.timezone import now
from django.db.models import Count
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt

from rest_framework import viewsets, permissions, filters, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import action

from .models import (
    Rol, Usuario, Parqueo, Espacio, Vehiculo, Reserva, Pago, Sensor, Lectura
)
from .serializers import (
    RolSerializer, UsuarioSerializer, ParqueoSerializer, EspacioSerializer,
    VehiculoSerializer, ReservaSerializer, PagoSerializer, SensorSerializer, LecturaSerializer
)

# ---------- Healthcheck ----------
def status(request):
    return HttpResponse("Backend funcionando correctamente", content_type="text/plain")


# ---------- Base ----------
class BaseViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.AllowAny]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]


# ---------- ViewSets (CRUD) ----------
class RolViewSet(BaseViewSet):
    queryset = Rol.objects.all()
    serializer_class = RolSerializer
    search_fields = ["nombre"]
    ordering_fields = ["id", "nombre"]


class UsuarioViewSet(BaseViewSet):
    queryset = Usuario.objects.select_related("rol").all()
    serializer_class = UsuarioSerializer
    search_fields = ["nombres", "apellidos", "email", "telefono"]
    ordering_fields = ["id", "creado_en"]


class ParqueoViewSet(BaseViewSet):
    queryset = Parqueo.objects.all()
    serializer_class = ParqueoSerializer
    search_fields = ["nombre", "direccion"]
    ordering_fields = ["id", "capacidad", "creado_en"]


class EspacioViewSet(BaseViewSet):
    serializer_class = EspacioSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["codigo", "nivel", "tipo", "estado"]
    ordering_fields = ["id", "codigo", "nivel", "tipo", "estado"]

    def get_queryset(self):
        qs = Espacio.objects.select_related("parqueo").all()
        parqueo_id = self.request.query_params.get("parqueo_id")
        if parqueo_id:
            qs = qs.filter(parqueo_id=parqueo_id)
        return qs

    # --- Acciones para el tablero ---
    @csrf_exempt
    @action(detail=True, methods=["post"], url_path="ocupar")
    def ocupar(self, request, pk=None):
        espacio = self.get_object()
        espacio.estado = "ocupado"
        espacio.save(update_fields=["estado"])
        return Response({"id": espacio.id, "estado": espacio.estado})

    @csrf_exempt
    @action(detail=True, methods=["post"], url_path="liberar")
    def liberar(self, request, pk=None):
        espacio = self.get_object()
        espacio.estado = "libre"
        espacio.save(update_fields=["estado"])
        return Response({"id": espacio.id, "estado": espacio.estado})

    @csrf_exempt
    @action(detail=True, methods=["patch"], url_path="estado")
    def cambiar_estado(self, request, pk=None):
        permitido = {"libre", "ocupado", "reservado", "fuera_servicio"}
        nuevo = (request.data.get("estado") or "").strip()
        if nuevo not in permitido:
            return Response(
                {"detail": f"estado inválido. Usa uno de: {sorted(list(permitido))}"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        espacio = self.get_object()
        espacio.estado = nuevo
        espacio.save(update_fields=["estado"])
        return Response({"id": espacio.id, "estado": espacio.estado})


class VehiculoViewSet(BaseViewSet):
    queryset = Vehiculo.objects.select_related("usuario").all()
    serializer_class = VehiculoSerializer
    search_fields = ["placa", "tipo", "color", "usuario__email"]
    ordering_fields = ["id", "placa", "tipo"]


class ReservaViewSet(BaseViewSet):
    queryset = Reserva.objects.select_related("usuario", "parqueo", "espacio").all()
    serializer_class = ReservaSerializer
    search_fields = ["estado", "usuario__email", "parqueo__nombre"]
    ordering_fields = ["id", "inicio_previsto", "fin_previsto", "estado", "creado_en"]


class PagoViewSet(BaseViewSet):
    queryset = Pago.objects.select_related("reserva").all()
    serializer_class = PagoSerializer
    search_fields = ["metodo", "estado"]
    ordering_fields = ["id", "monto_q", "creado_en"]


class SensorViewSet(BaseViewSet):
    queryset = Sensor.objects.select_related("espacio").all()
    serializer_class = SensorSerializer
    search_fields = ["tipo", "identificador_hardware"]
    ordering_fields = ["id", "tipo", "activo"]


class LecturaViewSet(BaseViewSet):
    queryset = Lectura.objects.select_related("sensor").all()
    serializer_class = LecturaSerializer
    search_fields = ["sensor__identificador_hardware"]
    ordering_fields = ["id", "recibido_en"]


# ---------- Stats ----------
class StatsSummary(APIView):
    permission_classes = [permissions.AllowAny]
    def get(self, request):
        total_espacios = Espacio.objects.count()
        ocupados = Espacio.objects.filter(estado="ocupado").count()
        return Response({
            "reservas_totales": Reserva.objects.count(),
            "espacios_totales": total_espacios,
            "ocupacion_pct": round(100.0 * ocupados / max(1, total_espacios), 2),
        })


class StatsReservas7d(APIView):
    permission_classes = [permissions.AllowAny]
    def get(self, request):
        fin = now()
        ini = fin - timedelta(days=6)
        qs = (
            Reserva.objects
            .filter(inicio_previsto__date__range=[ini.date(), fin.date()])
            .values("inicio_previsto__date")
            .annotate(c=Count("id"))
        )
        mapa = {r["inicio_previsto__date"].isoformat(): r["c"] for r in qs}
        serie = []
        for i in range(6, -1, -1):
            d = (fin - timedelta(days=i)).date().isoformat()
            serie.append({"fecha": d, "reservas": mapa.get(d, 0)})
        return Response({"serie": serie})
