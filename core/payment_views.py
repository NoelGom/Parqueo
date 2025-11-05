# core/payment_views.py
from decimal import Decimal
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.db import connection

PLAN_MONTOS = {"30m": Decimal("30"), "1h": Decimal("50")}

@api_view(["POST"])
def cobrar_tarjeta(request):
    """
    Mock de cobro: valida plan y monto fijo. Si viene `reserva_id`, intenta
    insertar en la tabla `pagos` (si tu FK lo permite). Si no, sólo devuelve OK.
    """
    plan = request.data.get("plan")
    if plan not in PLAN_MONTOS:
        return Response({"detail": "Plan inválido"}, status=status.HTTP_400_BAD_REQUEST)

    monto = PLAN_MONTOS[plan]

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

    return Response({"ok": True, "plan": plan, "monto": str(monto), "pago_id": pago_id}, status=200)
