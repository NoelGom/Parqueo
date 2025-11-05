from datetime import datetime, timedelta
from decimal import Decimal
from types import SimpleNamespace

from django.test import SimpleTestCase, override_settings
from django.utils import timezone

from .views import _calcular_monto_reserva


class CalcularMontoReservaTests(SimpleTestCase):

    @override_settings(PAGOS_TARIFA_Q_HORA=Decimal("10"), PAGOS_MINIMO_Q=Decimal("0"))
    def test_redondea_a_siguiente_hora_para_fracciones(self):
        inicio = timezone.make_aware(datetime(2024, 1, 1, 8, 0, 0))
        fin = inicio + timedelta(minutes=61)
        reserva = SimpleNamespace(
            inicio_real=inicio,
            fin_real=fin,
            inicio_previsto=None,
            fin_previsto=None,
        )

        monto = _calcular_monto_reserva(reserva)

        self.assertEqual(monto, Decimal("20.00"))

    @override_settings(PAGOS_TARIFA_Q_HORA=Decimal("15"), PAGOS_MINIMO_Q=Decimal("0"))
    def test_duracion_invalida_regresa_minimo_de_una_hora(self):
        inicio = timezone.make_aware(datetime(2024, 1, 1, 8, 0, 0))
        reserva = SimpleNamespace(
            inicio_real=inicio,
            fin_real=inicio - timedelta(minutes=5),
            inicio_previsto=None,
            fin_previsto=None,
        )

        monto = _calcular_monto_reserva(reserva)

        self.assertEqual(monto, Decimal("15.00"))

    @override_settings(PAGOS_TARIFA_Q_HORA=Decimal("12.50"), PAGOS_MINIMO_Q=Decimal("30.00"))
    def test_respeta_minimo_configurado_aun_con_redondeo(self):
        inicio = timezone.make_aware(datetime(2024, 1, 1, 8, 0, 0))
        fin = inicio + timedelta(minutes=90)
        reserva = SimpleNamespace(
            inicio_real=inicio,
            fin_real=fin,
            inicio_previsto=None,
            fin_previsto=None,
        )

        monto = _calcular_monto_reserva(reserva)

        # 90 minutos redondea a 2 horas (Q25.00) pero se aplica el mínimo de Q30.00
        self.assertEqual(monto, Decimal("30.00"))
