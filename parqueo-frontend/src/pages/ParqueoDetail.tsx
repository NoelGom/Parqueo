import { Link, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import toast from "react-hot-toast";

type Espacio = {
  id: number;
  codigo: string;
  estado: "libre" | "ocupado" | "reservado" | "fuera_servicio";
  parqueo: number;
};

type Parqueo = {
  id: number;
  nombre: string;
  direccion?: string | null;
  capacidad?: number | null;
};

export default function ParqueoDetail() {
  const { id } = useParams();
  const parqueoId = Number(id);
  const qc = useQueryClient();

  const parqueoQ = useQuery({
    queryKey: ["parqueo", parqueoId],
    queryFn: async () => {
      const { data } = await api.get<Parqueo>(`/api/parqueos/${parqueoId}/`);
      return data;
    },
    enabled: Number.isFinite(parqueoId) && parqueoId > 0,
  });

  const espaciosQ = useQuery({
    queryKey: ["espacios", parqueoId],
    queryFn: async () => {
      const { data } = await api.get(`/api/espacios/`, {
        params: { parqueo: parqueoId, page_size: 200 },
      });
      const results: Espacio[] = Array.isArray(data)
        ? data
        : Array.isArray(data?.results)
          ? data.results
          : [];
      return results.filter((espacio) => Number(espacio.parqueo) === parqueoId);
    },
    enabled: Number.isFinite(parqueoId) && parqueoId > 0,
  });

  const mutar = async (espacioId: number, accion: "ocupar" | "liberar") => {
    try {
      await api.post(`/api/espacios/${espacioId}/${accion}/`);
      toast.success(accion === "ocupar" ? "Espacio ocupado" : "Espacio liberado");
      await qc.invalidateQueries({ queryKey: ["espacios", parqueoId] });
    } catch (error: any) {
      const msg = error?.response?.data?.detail ?? "No se pudo actualizar el espacio";
      toast.error(msg);
    }
  };

  if (parqueoQ.isLoading || espaciosQ.isLoading) {
    return <p>Cargando…</p>;
  }

  if (parqueoQ.isError) {
    return <p>Error cargando información del parqueo.</p>;
  }

  const nombre = parqueoQ.data?.nombre ? `Parqueo ${parqueoQ.data.nombre}` : `Parqueo #${parqueoId}`;
  const espacios = espaciosQ.data ?? [];

  return (
    <section className="space-y-4">
      <header className="row" style={{ justifyContent: "space-between" }}>
        <h1 className="title">{nombre} • Mapa de espacios</h1>
        <Link to="/parqueos" className="btn">
          Volver
        </Link>
      </header>

      {!espacios.length && <p>No hay espacios.</p>}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
          gap: 16,
          marginTop: 12,
          alignItems: "stretch",
        }}
      >
        {espacios.map((espacio) => {
          const libre = espacio.estado === "libre";
          return (
            <div
              key={espacio.id}
              className="btn"
              style={{
                padding: 12,
                display: "flex",
                flexDirection: "column",
                gap: 10,
                borderWidth: 1,
                borderStyle: "solid",
                borderColor: libre ? "rgba(34,197,94,.6)" : "rgba(239,68,68,.6)",
                background: libre ? "rgba(34,197,94,.15)" : "rgba(239,68,68,.15)",
                boxShadow: "0 2px 6px rgba(0,0,0,.2)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <b>{espacio.codigo}</b>
                <span style={{ opacity: 0.8, textTransform: "capitalize" }}>
                  {libre ? "Libre" : "Ocupado"}
                </span>
              </div>
              <div className="row" style={{ justifyContent: "space-between" }}>
                <button
                  className="btn btn-danger"
                  disabled={!libre}
                  onClick={() => mutar(espacio.id, "ocupar")}
                >
                  Ocupar
                </button>
                <button
                  className="btn btn-success"
                  disabled={libre}
                  onClick={() => mutar(espacio.id, "liberar")}
                >
                  Liberar
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
