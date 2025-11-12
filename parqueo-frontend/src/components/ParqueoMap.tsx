import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import toast from "react-hot-toast";

type ApiListResponse<T> =
  | T[]
  | {
      results?: T[];
      next?: string | null;
      previous?: string | null;
      count?: number;
    };

type Espacio = {
  id: number;
  codigo: string;
  estado: "libre" | "ocupado" | "reservado" | "fuera_servicio";
  parqueo: number;   // FK id
  nivel?: string | null;
  tipo?: "auto" | "moto" | "discapacitado" | "electrico";
};

type Parqueo = { id: number; nombre: string };

// helper para traer TODAS las páginas de DRF
async function fetchAllEspacios(parqueoId: number | string): Promise<Espacio[]> {
  let url: string | null = `/api/espacios/?parqueo_id=${parqueoId}`;
  const acc: Espacio[] = [];
  while (url) {
    const currentUrl: string = url as string;
    const response = await api.get<ApiListResponse<Espacio>>(currentUrl);
    const data: ApiListResponse<Espacio> = response.data;
    if (Array.isArray(data)) {
      acc.push(...(data as Espacio[]));
      url = null;
    } else {
      const results: Espacio[] = data.results ?? [];
      acc.push(...results);
      url = data.next ?? null; // DRF usa 'next' absoluto o relativo
    }
  }
  return acc;
}

export default function ParqueoMap({ parqueoId }: { parqueoId: number | string }) {
  const qc = useQueryClient();

  // Nombre del parqueo
  const pQ = useQuery({
    queryKey: ["parqueo", parqueoId],
    queryFn: async () => (await api.get<Parqueo>(`/api/parqueos/${parqueoId}/`)).data,
    enabled: !!parqueoId,
  });

  // Espacios del parqueo (con paginación completa)
  const eQ = useQuery({
    queryKey: ["espacios", parqueoId],
    queryFn: () => fetchAllEspacios(parqueoId),
    enabled: !!parqueoId,
  });

  const mutar = async (espacioId: number, accion: "ocupar" | "liberar") => {
    try {
      await api.post(`/api/espacios/${espacioId}/${accion}/`);
      toast.success(accion === "ocupar" ? "Espacio ocupado" : "Espacio liberado");
      // refrescar lista
      await qc.invalidateQueries({ queryKey: ["espacios", parqueoId] });
    } catch (e: any) {
      const msg = e?.response?.data?.detail || "No se pudo actualizar el espacio";
      toast.error(msg);
    }
  };

  if (eQ.isLoading || pQ.isLoading) return <p>Cargando...</p>;
  if (eQ.isError) return <p>Error cargando espacios</p>;

  const nombre = pQ.data?.nombre ? `Parqueo ${pQ.data.nombre}` : `Parqueo #${parqueoId}`;
  const espacios = eQ.data ?? [];

  return (
    <div>
      <p style={{ opacity: 0.8, marginTop: 0, marginBottom: 8 }}>{nombre} • Mapa de espacios</p>
      {espacios.length === 0 && <p>No hay espacios.</p>}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
          gap: 16,
          marginTop: 12,
          alignItems: "stretch",
        }}
      >
        {espacios.map((e) => {
          const libre = e.estado === "libre";
          return (
            <div
              key={e.id}
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
                <b>{e.codigo}</b>
                <span style={{ opacity: 0.8, textTransform: "capitalize" }}>{libre ? "Libre" : "Ocupado"}</span>
              </div>
              <div className="row" style={{ justifyContent: "space-between" }}>
                <button className="btn btn-danger" disabled={!libre} onClick={() => mutar(e.id, "ocupar")}>
                  Ocupar
                </button>
                <button className="btn btn-success" disabled={libre} onClick={() => mutar(e.id, "liberar")}>
                  Liberar
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
