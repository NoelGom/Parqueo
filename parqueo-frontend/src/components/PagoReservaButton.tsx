import { useState } from "react";
import { api } from "../lib/api";
import toast from "react-hot-toast";

type Props = {
  reservaId: number;
  onDone?: () => void;
};

export default function PagoReservaButton({ reservaId, onDone }: Props) {
  const [open, setOpen] = useState(false);
  const [metodo, setMetodo] = useState<"efectivo" | "tarjeta" | "tarjeta_en_linea">("tarjeta");
  const [monto, setMonto] = useState<string>("");

  const cobrar = async () => {
    try {
      const payload: any = { metodo };
      if (monto.trim()) payload.monto_q = monto;
      const { data } = await api.post(`/api/reservas/${reservaId}/cobrar/`, payload);
      toast.success(`Cobrado: Q${data.monto_q} (${data.metodo})`);
      setOpen(false);
      setMonto("");
      onDone?.();
    } catch (e: any) {
      const msg = e?.response?.data?.detail || "No se pudo cobrar";
      toast.error(msg);
    }
  };

  return (
    <div>
      <button
        className="btn bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-2 rounded"
        onClick={() => setOpen(true)}
      >
        ⚙️ Cobro manual
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 text-white p-4 rounded w-full max-w-sm shadow-lg border border-gray-700">
            <div className="text-lg font-semibold mb-2">Cobrar reserva #{reservaId}</div>

            <label className="block text-sm opacity-80 mb-1">Método</label>
            <select
              className="w-full bg-gray-900 text-white rounded px-3 py-2 mb-3"
              value={metodo}
              onChange={(e) => setMetodo(e.target.value as any)}
            >
              <option value="tarjeta">Tarjeta</option>
              <option value="tarjeta_en_linea">Tarjeta en línea</option>
              <option value="efectivo">Efectivo</option>
            </select>

            <label className="block text-sm opacity-80 mb-1">Monto (opcional)</label>
            <input
              className="w-full bg-gray-900 text-white rounded px-3 py-2 mb-3"
              placeholder="Ej. 25.00"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
            />

            <div className="flex items-center justify-end gap-2">
              <button className="px-3 py-2 rounded bg-gray-600 hover:bg-gray-500" onClick={() => setOpen(false)}>
                Cancelar
              </button>
              <button className="px-3 py-2 rounded bg-emerald-600 hover:bg-emerald-500" onClick={cobrar}>
                Cobrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
