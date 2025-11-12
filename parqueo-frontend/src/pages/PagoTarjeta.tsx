import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { api } from "../lib/api";

/**
 * Cobro con tarjeta
 * - Planes fijos:
 *   • 30 minutos  -> Q30
 *   • 1 hora      -> Q50
 * - Al elegir el plan se coloca el precio automáticamente (no editable).
 * - Envía al backend: /api/pagos/cobrar/  (ajusta si tu endpoint es distinto)
 */
export default function PagoTarjeta() {
  const navigate = useNavigate();

  type Plan = "" | "30" | "60";
  const [plan, setPlan] = useState<Plan>(""); // "30" ó "60"
  const [monto, setMonto] = useState<number | "">("");

  // Datos de tarjeta (solo visuales para el mock/ejemplo)
  const [cardNumber, setCardNumber] = useState("4111111111111111");
  const [holder, setHolder] = useState("JUAN PÉREZ");
  const [exp, setExp] = useState("08/27");
  const [cvv, setCvv] = useState("123");
  const [loading, setLoading] = useState(false);

  const handlePlanChange = (value: Plan) => {
    setPlan(value);
    if (value === "30") setMonto(30);
    else if (value === "60") setMonto(50);
    else setMonto("");
  };

  const pagar = async () => {
    if (!plan) {
      toast.error("Elegí un plan (30 min o 1 hora).");
      return;
    }
    if (!monto || Number(monto) <= 0) {
      toast.error("Monto inválido.");
      return;
    }

    try {
      setLoading(true);

      // (Ajusta los nombres si tu backend espera otros campos)
      const payload = {
        metodo: "tarjeta",
        plan_minutos: Number(plan), // 30 ó 60
        monto_q: Number(monto),     // 30 ó 50
        tarjeta_ultimos4: cardNumber.slice(-4),
        titular: holder,
        expiracion: exp,
      };

      // Endpoint de cobro (el que integramos antes en el backend)
      await api.post("/api/pagos/cobrar/", payload);

      toast.success("Pago realizado con éxito");
      // Redirigir al listado de pagos o donde prefieras
      navigate("/pagos");
    } catch (err: any) {
      console.error(err);
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        "No se pudo procesar el pago";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pay-wrap">
      <div className="pay-card">
        <div className="pay-header">
          <h2>Cobrar con tarjeta</h2>
          <span className="pay-brand">VISA</span>
        </div>

        <div className="pay-content">
          {/* Formulario */}
          <section className="pay-form">
            {/* Plan */}
            <div className="grid-2">
              <div className="field">
                <label>Plan</label>
                <select
                  className="select"
                  value={plan}
                  onChange={(e) => handlePlanChange(e.target.value as Plan)}
                >
                  <option value="">— seleccionar —</option>
                  <option value="30">30 minutos — Q30</option>
                  <option value="60">1 hora — Q50</option>
                </select>
              </div>

              <div className="field">
                <label>Monto (Q)</label>
                <input
                  className="input"
                  value={monto === "" ? "" : Number(monto).toFixed(2)}
                  placeholder="Se llena según el plan"
                  readOnly
                />
              </div>
            </div>

            {/* Tarjeta */}
            <div className="field">
              <label>Número de tarjeta</label>
              <input
                className="input input-card"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value.replace(/\s/g, ""))}
                maxLength={19}
              />
            </div>

            <div className="field">
              <label>Nombre del titular</label>
              <input
                className="input"
                value={holder}
                onChange={(e) => setHolder(e.target.value.toUpperCase())}
              />
            </div>

            <div className="grid-2">
              <div className="field">
                <label>Expiración (MM/AA)</label>
                <input
                  className="input"
                  value={exp}
                  onChange={(e) => setExp(e.target.value)}
                  placeholder="MM/AA"
                  maxLength={5}
                />
              </div>
              <div className="field">
                <label>CVV</label>
                <input
                  className="input"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value)}
                  maxLength={4}
                />
              </div>
            </div>

            <div className="actions">
              <Link to="/pagos" className="btn pay-flat">Cancelar</Link>
              <button
                className="btn btn-primary"
                onClick={pagar}
                disabled={loading}
                title={plan ? "" : "Elegí un plan para continuar"}
              >
                {loading ? "Procesando…" : "Pagar"}
              </button>
            </div>
          </section>

          {/* Resumen lateral */}
          <aside className="pay-summary">
            <h4>Resumen</h4>
            <ul>
              <li>Plan: {plan === "30" ? "30 minutos" : plan === "60" ? "1 hora" : "—"}</li>
              <li>Total: {monto === "" ? "—" : `Q ${Number(monto).toFixed(2)}`}</li>
              <li>Método: Tarjeta</li>
            </ul>
          </aside>
        </div>
      </div>
    </div>
  );
}
