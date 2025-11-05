import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import toast from "react-hot-toast";
import PagoReservaButton from "../components/PagoReservaButton";

type Reserva = {
  id: number;
  usuario: number;
  parqueo: number;
  espacio: number | null;
  inicio_previsto: string;
  fin_previsto: string;
  inicio_real: string | null;
  fin_real: string | null;
  estado: "pendiente" | "activa" | "cancelada" | "finalizada";
  total_q: string | null;
  creado_en: string;
};

type Usuario = {
  id: number;
  nombres: string;
  apellidos: string;
  email: string;
};

type Parqueo = { id: number; nombre: string };
type Espacio = { id: number; codigo: string };

export default function PagosPage() {
  const [estadoFiltro, setEstadoFiltro] = useState<"pendiente|activa|todas" | "pendiente" | "activa" | "todas">("pendiente|activa");

  // reservas (paginación simple; si usas DRF paginado, puedes iterar .next)
  const reservasQ = useQuery({
    queryKey: ["reservas", estadoFiltro],
    queryFn: async () => {
      const { data } = await api.get("/api/reservas/", { params: { ordering: "-inicio_previsto" } });
      const arr: Reserva[] = Array.isArray(data) ? data : (data.results || []);
      if (estadoFiltro === "todas") return arr;
      if (estadoFiltro === "pendiente|activa") return arr.filter(r => r.estado === "pendiente" || r.estado === "activa");
      return arr.filter(r => r.estado === estadoFiltro);
    },
  });

  // Carga mínima de usuarios/parqueos/espacios para mostrar etiquetas
  const usuariosQ = useQuery({
    queryKey: ["usuarios-min"],
    queryFn: async () => {
      const { data } = await api.get("/api/usuarios/", { params: { page_size: 1000 } });
      return Array.isArray(data) ? data : (data.results || []);
    },
  });

  const parqueosQ = useQuery({
    queryKey: ["parqueos-min"],
    queryFn: async () => {
      const { data } = await api.get("/api/parqueos/", { params: { page_size: 1000 } });
      return Array.isArray(data) ? data : (data.results || []);
    },
  });

  const espaciosQ = useQuery({
    queryKey: ["espacios-min"],
    queryFn: async () => {
      const { data } = await api.get("/api/espacios/", { params: { page_size: 1000 } });
      return Array.isArray(data) ? data : (data.results || []);
    },
  });

  const mapaUsuarios = useMemo<Record<number, Usuario>>(() => {
    const m: any = {};
    (usuariosQ.data || []).forEach((u: Usuario) => (m[u.id] = u));
    return m;
  }, [usuariosQ.data]);

  const mapaParqueos = useMemo<Record<number, Parqueo>>(() => {
    const m: any = {};
    (parqueosQ.data || []).forEach((p: Parqueo) => (m[p.id] = p));
    return m;
  }, [parqueosQ.data]);

  const mapaEspacios = useMemo<Record<number, Espacio>>(() => {
    const m: any = {};
    (espaciosQ.data || []).forEach((e: Espacio) => (m[e.id] = e));
    return m;
  }, [espaciosQ.data]);

  if (reservasQ.isLoading) return <div className="p-6">Cargando reservas…</div>;
  if (reservasQ.isError) return <div className="p-6 text-red-400">Error cargando reservas</div>;

  const reservas: Reserva[] = reservasQ.data || [];

  const cobrarRapido = async (id: number, metodo: "efectivo" | "tarjeta" | "tarjeta_en_linea") => {
    try {
      const { data } = await api.post(`/api/reservas/${id}/cobrar/`, { metodo });
      toast.success(`Pago ${data.metodo} • Q${data.monto_q} ✓`);
      reservasQ.refetch();
    } catch (e: any) {
      const msg = e?.response?.data?.detail || "No se pudo cobrar";
      toast.error(msg);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-white">Pagos</h1>

        <div className="flex items-center gap-2">
          <label className="opacity-75">Estado:</label>
          <select
            className="bg-gray-800 text-white px-3 py-2 rounded"
            value={estadoFiltro}
            onChange={(e) => setEstadoFiltro(e.target.value as any)}
          >
            <option value="pendiente|activa">Pendiente/Activa</option>
            <option value="todas">Todas</option>
            <option value="pendiente">Pendiente</option>
            <option value="activa">Activa</option>
            <option value="finalizada">Finalizada</option>
            <option value="cancelada">Cancelada</option>
          </select>
        </div>
      </div>

      {reservas.length === 0 && <div className="opacity-80">No hay reservas para cobrar.</div>}

      <div className="grid gap-4">
        {reservas.map((r) => {
          const u = mapaUsuarios[r.usuario];
          const p = mapaParqueos[r.parqueo];
          const e = r.espacio ? mapaEspacios[r.espacio] : null;
          return (
            <div key={r.id} className="bg-gray-800 rounded p-4 shadow border border-gray-700">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="font-semibold text-white">
                    Reserva #{r.id} • {p?.nombre || `Parqueo ${r.parqueo}`}
                  </div>
                  <div className="text-sm opacity-80">
                    {u ? `${u.nombres} ${u.apellidos}` : `Usuario ${r.usuario}`} • Espacio: {e?.codigo || "-"} • Estado: <b>{r.estado}</b>
                  </div>
                  <div className="text-xs opacity-70">
                    {formatDT(r.inicio_previsto)} → {formatDT(r.fin_previsto)} {r.total_q ? `• Total Q${r.total_q}` : ""}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    className="btn bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-2 rounded"
                    onClick={() => cobrarRapido(r.id, "tarjeta")}
                  >
                    💳 Cobrar tarjeta
                  </button>
                  <button
                    className="btn bg-sky-600 hover:bg-sky-500 text-white px-3 py-2 rounded"
                    onClick={() => cobrarRapido(r.id, "tarjeta_en_linea")}
                  >
                    🌐 Cobrar en línea
                  </button>
                  <button
                    className="btn bg-gray-600 hover:bg-gray-500 text-white px-3 py-2 rounded"
                    onClick={() => cobrarRapido(r.id, "efectivo")}
                  >
                    💵 Efectivo
                  </button>

                  {/* Botón reutilizable con monto manual opcional */}
                  <PagoReservaButton reservaId={r.id} onDone={() => reservasQ.refetch()} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function formatDT(s: string | null | undefined) {
  if (!s) return "-";
  try {
    const d = new Date(s);
    return d.toLocaleString();
  } catch {
    return s;
  }
}
