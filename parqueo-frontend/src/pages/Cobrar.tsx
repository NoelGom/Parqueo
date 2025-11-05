import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import toast from "react-hot-toast";

type PlanKey = "30m" | "1h";
const PLANES: Record<PlanKey, { label: string; monto: number }> = {
  "30m": { label: "30 minutos — Q30", monto: 30 },
  "1h":  { label: "1 hora — Q50",      monto: 50 },
};

const rand = () => Math.random().toString(36).slice(2);

export default function Cobrar() {
  const navigate = useNavigate();

  // estado controlado vacío
  const [plan, setPlan] = useState<"" | PlanKey>("");
  const [amount, setAmount] = useState("");

  const [card, setCard] = useState("");
  const [name, setName] = useState("");
  const [exp,  setExp]  = useState("");
  const [cvv,  setCvv]  = useState("");

  // bloquear autofill hasta foco
  const [unlockCard, setUnlockCard] = useState(false);
  const [unlockName, setUnlockName] = useState(false);
  const [unlockExp,  setUnlockExp]  = useState(false);
  const [unlockCvv,  setUnlockCvv]  = useState(false);

  // nombres aleatorios -> el navegador no los reconoce
  const fieldNames = useMemo(() => ({
    card: "cc_"+rand(),
    name: "nm_"+rand(),
    exp:  "ex_"+rand(),
    cvv:  "cv_"+rand(),
  }), []);

  // por si el navegador pegó algo antes de tiempo, lo limpiamos
  useEffect(() => {
    const t = setTimeout(() => { setCard(""); setName(""); setExp(""); setCvv(""); }, 0);
    return () => clearTimeout(t);
  }, []);

  const total = plan ? PLANES[plan].monto : 0;

  const onSelectPlan = (v: string) => {
    if (v === "30m" || v === "1h") {
      setPlan(v);
      setAmount(PLANES[v].monto.toFixed(2));
    } else {
      setPlan("");
      setAmount("");
    }
  };

  const pagar = async () => {
    if (!plan) return toast.error("Selecciona un plan");
    if (!card || !name || !exp || !cvv) return toast.error("Completa los datos de la tarjeta");

    try {
      await api.post("/api/pagos/cobrar/", {
        plan,
        amount: total,
        card, name, exp, cvv,
      });
      toast.success("Pago realizado");
      navigate("/pagos");
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || "No se pudo procesar el pago");
    }
  };

  return (
    <div className="container" style={{ marginTop: 8 }}>
      <div className="card-gradient">
        <div className="card-head">
          <h2 style={{ margin: 0 }}>Cobrar con tarjeta</h2>
          <span className="chip">VISA</span>
        </div>

        <div className="grid-2">
          <form
            className="pay-form"
            autoComplete="off"
            onSubmit={(e) => { e.preventDefault(); pagar(); }}
          >
            {/* Honeypots anti-autofill */}
            <input
              type="text" name="cc-number" autoComplete="cc-number"
              style={{ position:"absolute", left:-9999, width:1, height:1, opacity:0 }}
              tabIndex={-1} aria-hidden="true"
            />
            <input
              type="text" name="name" autoComplete="name"
              style={{ position:"absolute", left:-9999, width:1, height:1, opacity:0 }}
              tabIndex={-1} aria-hidden="true"
            />

            <div className="grid-2">
              <div className="field">
                <label>Plan</label>
                <select
                  className="select"
                  value={plan}
                  onChange={(e) => onSelectPlan(e.target.value)}
                >
                  <option value="">— seleccionar —</option>
                  <option value="30m">{PLANES["30m"].label}</option>
                  <option value="1h">{PLANES["1h"].label}</option>
                </select>
              </div>

              <div className="field">
                <label>Monto (Q)</label>
                <input
                  className="input"
                  type="text"
                  value={amount}
                  readOnly
                  placeholder="Se llena según el plan"
                />
              </div>
            </div>

            <div className="field">
              <label>Número de tarjeta</label>
              <input
                className="input input-card"
                type="text"
                inputMode="numeric"
                name={fieldNames.card}
                id={fieldNames.card}
                readOnly={!unlockCard}
                onFocus={() => setUnlockCard(true)}
                autoComplete="one-time-code"
                value={card}
                onChange={(e) => setCard(e.target.value.replace(/\s+/g, ""))}
                placeholder="4111111111111111"
                spellCheck={false}
              />
            </div>

            <div className="field">
              <label>Nombre del titular</label>
              <input
                className="input"
                type="text"
                name={fieldNames.name}
                id={fieldNames.name}
                readOnly={!unlockName}
                onFocus={() => setUnlockName(true)}
                autoComplete="off"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="JUAN PÉREZ"
                spellCheck={false}
              />
            </div>

            <div className="grid-2">
              <div className="field">
                <label>Expiración (MM/AA)</label>
                <input
                  className="input"
                  type="text"
                  inputMode="numeric"
                  name={fieldNames.exp}
                  id={fieldNames.exp}
                  readOnly={!unlockExp}
                  onFocus={() => setUnlockExp(true)}
                  autoComplete="off"
                  value={exp}
                  onChange={(e) => setExp(e.target.value)}
                  placeholder="08/27"
                />
              </div>

              <div className="field">
                <label>CVV</label>
                <input
                  className="input"
                  type="password"
                  inputMode="numeric"
                  name={fieldNames.cvv}
                  id={fieldNames.cvv}
                  readOnly={!unlockCvv}
                  onFocus={() => setUnlockCvv(true)}
                  autoComplete="new-password"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value)}
                  placeholder="123"
                />
              </div>
            </div>

            <div className="actions">
              <button type="button" className="btn pay-flat" onClick={() => navigate("/pagos")}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary">
                Pagar
              </button>
            </div>
          </form>

          <aside className="summary">
            <h4>Resumen</h4>
            <div className="summary-row">
              <span>Plan:</span>
              <b>{plan ? PLANES[plan].label.split(" — ")[0] : "—"}</b>
            </div>
            <div className="summary-row">
              <span>Total:</span>
              <b>{plan ? `Q ${total.toFixed(2)}` : "—"}</b>
            </div>
            <div className="summary-row">
              <span>Método:</span>
              <b>Tarjeta</b>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
