# core/payment_views.py
from decimal import Decimal
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.db import connection

PLAN_MONTOS = {"30": Decimal("30"), "60": Decimal("50")}


def normalize_plan(value):
    if value is None:
        return None
    raw = str(value).strip().lower()
    mapping = {
        "30": "30",
        "30m": "30",
        "0.5h": "30",
        "60": "60",
        "1h": "60",
    }
    return mapping.get(raw)

@api_view(["POST"])
def cobrar_tarjeta(request):
    """
    Mock de cobro: valida plan y monto fijo. Si viene `reserva_id`, intenta
    insertar en la tabla `pagos` (si tu FK lo permite). Si no, sólo devuelve OK.
    """
    plan_key = normalize_plan(request.data.get("plan_minutos") or request.data.get("plan"))
    if plan_key not in PLAN_MONTOS:
        return Response({"detail": "Plan inválido"}, status=status.HTTP_400_BAD_REQUEST)

    monto = PLAN_MONTOS[plan_key]

    monto_cliente = request.data.get("monto_q")
    if monto_cliente is not None:
        try:
            if Decimal(str(monto_cliente)) != monto:
                return Response(
                    {"detail": "El monto no coincide con el plan seleccionado"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
        except Exception:
            return Response(
                {"detail": "Monto inválido"}, status=status.HTTP_400_BAD_REQUEST
            )

    # (Opcional) si te envían reserva_id y quieres registrar el pago real:
    reserva_id = request.data.get("reserva_id")
    pago_id = None
    if reserva_id:
        try:
            with connection.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO pagos (reserva_id, metodo, monto_q, estado, creado_en)
                    VALUES (%s, %s, %s, %s, NOW())
                    """,
                    [int(reserva_id), "tarjeta_en_linea", str(monto), "aprobado"],
                )
                pago_id = cur.lastrowid
        except Exception:
            # En demo, si falla por FK, lo ignoramos para no romper el flujo
            pass

    return Response(
        {"ok": True, "plan": plan_key, "monto": str(monto), "pago_id": pago_id},
        status=200,
    )
