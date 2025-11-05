from datetime import timedelta
import math
from decimal import Decimal
import re

from django.conf import settings
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
    VehiculoSerializer, ReservaSerializer, PagoSerializer, SensorSerializer, LecturaSerializer,
    PagoCobroSerializer
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
        parqueo_id = self.request.query_params.get("parqueo_id") or self.request.query_params.get("parqueo")
        if parqueo_id:
            qs = qs.filter(parqueo_id=parqueo_id)
        return qs

    # --- Acciones tablero ---
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
    @action(detail=True, methods=["post"], url_path="reservar")
    def reservar(self, request, pk=None):
        espacio = self.get_object()
        espacio.estado = "reservado"
        espacio.save(update_fields=["estado"])
        return Response({"id": espacio.id, "estado": espacio.estado})

    @csrf_exempt
    @action(detail=True, methods=["post"], url_path="fuera-servicio")
    def fuera_servicio(self, request, pk=None):
        espacio = self.get_object()
        espacio.estado = "fuera_servicio"
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

    # --- COBRAR desde la reserva ---
    @csrf_exempt
    @action(detail=True, methods=["post"], url_path="cobrar")
    def cobrar(self, request, pk=None):
        reserva = self.get_object()
        payload = {
            "reserva_id": reserva.id,
            "metodo": request.data.get("metodo") or "efectivo",
            "monto_q": request.data.get("monto_q")
        }
        ser = PagoCobroSerializer(data=payload)
        ser.is_valid(raise_exception=True)
        pago = _crear_pago_con_calculo(ser.validated_data, reserva=reserva)
        return Response(PagoSerializer(pago).data, status=201)


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


# ---------- Mapa por filas/columnas ----------
class MapaParqueo(APIView):
    permission_classes = [permissions.AllowAny]
    def get(self, request, parqueo_id: int):
        qs = Espacio.objects.filter(parqueo_id=parqueo_id).values("id", "codigo", "estado")
        patron = re.compile(r"^\s*([A-Za-z]+)\s*[-_]\s*(\d+)\s*$")
        filas_set, columnas_max, celdas = set(), 0, []
        for e in qs:
            codigo = e["codigo"] or ""
            m = patron.match(codigo)
            if m:
                fila = m.group(1).upper()
                col = int(m.group(2))
            else:
                fila, col = "?", 999
            filas_set.add(fila)
            columnas_max = max(columnas_max, col if col != 999 else 0)
            celdas.append({"fila": fila, "col": col, "id": e["id"], "codigo": codigo, "estado": e["estado"]})
        filas = sorted(filas_set, key=lambda x: (x == "?", x))
        celdas.sort(key=lambda x: (x["fila"] == "?", x["fila"], x["col"]))
        return Response({"parqueo_id": int(parqueo_id), "filas": filas, "columnas_max": columnas_max, "celdas": celdas})


# ---------- Cobros helper & endpoint ----------
def _calcular_monto_reserva(reserva) -> Decimal:
    """Regla simple: redondeo hacia arriba por hora, con mínimo."""
    tarifa = Decimal(getattr(settings, "PAGOS_TARIFA_Q_HORA", 10))
    minimo = Decimal(getattr(settings, "PAGOS_MINIMO_Q", 0))

    inicio = reserva.inicio_real or reserva.inicio_previsto
    fin = reserva.fin_real or reserva.fin_previsto or now()
    if not inicio or not fin or fin <= inicio:
        horas = 1
    else:
        mins = max(1, int((fin - inicio).total_seconds() // 60))
        horas = math.ceil(mins / 60)

    monto = Decimal(horas) * tarifa
    if monto < minimo:
        monto = minimo
    return monto.quantize(Decimal("0.01"))

def _crear_pago_con_calculo(data, reserva=None):
    # data: {reserva_id, metodo, monto_q?}
    if not reserva:
        reserva = Reserva.objects.get(id=data["reserva_id"])
    monto = Decimal(data["monto_q"]) if data.get("monto_q") else _calcular_monto_reserva(reserva)
    estado = "aprobado" if data["metodo"] in ("efectivo", "tarjeta") else "pendiente"

    pago = Pago.objects.create(
        reserva_id=reserva.id,
        metodo=data["metodo"],
        monto_q=monto,
        estado=estado,
        creado_en=now(),
    )

    # Si querés marcar la reserva finalizada al cobrar, descomentá este bloque:
    # if estado == "aprobado":
    #     reserva.estado = "finalizada"
    #     reserva.total_q = monto
    #     reserva.save(update_fields=["estado", "total_q"])

    return pago

class PagoCobrar(APIView):
    """Endpoint genérico para cobrar (sin pasar por /reservas/<id>/cobrar/)"""
    permission_classes = [permissions.AllowAny]

    @csrf_exempt
    def post(self, request):
        ser = PagoCobroSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        pago = _crear_pago_con_calculo(ser.validated_data)
        return Response(PagoSerializer(pago).data, status=201)
