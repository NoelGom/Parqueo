import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import toast from "react-hot-toast";

type Espacio = { id:number; codigo:string; disponible:number; parqueo:number };
type Parqueo = { id:number; nombre:string };

export default function ParqueoMap({ parqueoId }:{ parqueoId: number | string }) {
  // nombre del parqueo
  const pQ = useQuery({
    queryKey: ["parqueo", parqueoId],
    queryFn: async () => (await api.get<Parqueo>(`/api/parqueos/${parqueoId}/`)).data,
    enabled: !!parqueoId,
  });

  // espacios (con fallback de filtro en front)
  const eQ = useQuery({
    queryKey:["espacios", parqueoId],
    queryFn: async ()=> {
      const { data } = await api.get("/api/espacios/", { params:{ parqueo:parqueoId, page_size:1000 } });
      const arr: Espacio[] = Array.isArray(data) ? data : (data.results || []);
      const pid = Number(parqueoId);
      return arr.filter(e => Number(e.parqueo) === pid);
    }
  });

  const mutar = async (espacioId:number, accion:"ocupar"|"liberar")=>{
    await api.post(`/api/espacios/${espacioId}/${accion}/`);
    toast.success(accion==="ocupar"?"Ocupado":"Liberado");
    eQ.refetch();
  };

  if (eQ.isLoading) return <p>Cargando espacios…</p>;
  const nombre = pQ.data?.nombre ? `Parqueo ${pQ.data.nombre}` : `Parqueo #${parqueoId}`;

  return (
    <div>
      <p style={{opacity:.8, marginTop: 0, marginBottom: 8}}>{nombre}</p>
      {(eQ.data||[]).length === 0 && <p>No hay espacios.</p>}

      <div
        style={{
          display:"grid",
          gridTemplateColumns:"repeat(auto-fill, minmax(140px, 1fr))",
          gap:16,
          marginTop:12,
          alignItems:"stretch"
        }}
      >
        {(eQ.data||[]).map((e)=> {
          const libre = Number(e.disponible) === 1;
          return (
            <div
              key={e.id}
              className="btn"
              style={{
                padding:12,
                display:"flex",
                flexDirection:"column",
                gap:10,
                borderWidth:1,
                borderStyle:"solid",
                borderColor: libre ? "rgba(34,197,94,.6)" : "rgba(239,68,68,.6)",
                background: libre ? "rgba(34,197,94,.15)" : "rgba(239,68,68,.15)",
                boxShadow:"0 2px 6px rgba(0,0,0,.2)"
              }}
            >
              <div style={{display:"flex", justifyContent:"space-between"}}>
                <b>{e.codigo}</b>
                <span style={{opacity:.8}}>{libre ? "Libre" : "Ocupado"}</span>
              </div>
              <div className="row" style={{justifyContent:"space-between"}}>
                <button className="btn btn-danger" disabled={!libre} onClick={()=>mutar(e.id,"ocupar")}>Ocupar</button>
                <button className="btn btn-success" disabled={libre} onClick={()=>mutar(e.id,"liberar")}>Liberar</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
