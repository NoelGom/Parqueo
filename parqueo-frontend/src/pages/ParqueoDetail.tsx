import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import toast from "react-hot-toast";

type Espacio = { id:number; codigo:string; disponible:number; parqueo:number };
type Parqueo = { id:number; nombre:string };

export default function ParqueoDetail(){
  const { id } = useParams();

  const parqueoQ = useQuery({
    queryKey: ["parqueo", id],
    queryFn: async () => (await api.get<Parqueo>(`/api/parqueos/${id}/`)).data,
    enabled: !!id,
  });

  const espaciosQ = useQuery({
    queryKey:["espacios", id],
    queryFn: async ()=> {
      // pedimos con filtro; si no viene filtrado, filtramos en el front
      const { data } = await api.get("/api/espacios/", { params:{ parqueo:id, page_size:1000 } });
      const arr: Espacio[] = Array.isArray(data) ? data : (data.results || []);
      const pid = Number(id);
      return arr.filter(e => Number(e.parqueo) === pid);
    }
  });

  const mutar = async (espacioId:number, accion:"ocupar"|"liberar")=>{
    await api.post(`/api/espacios/${espacioId}/${accion}/`);
    toast.success(accion==="ocupar"?"Ocupado":"Liberado");
    espaciosQ.refetch();
  };

  const nombre = parqueoQ.data?.nombre ? `Parqueo ${parqueoQ.data.nombre}` : `Parqueo #${id}`;

  return (
    <section>
      <h1 className="title">{nombre} • Mapa de espacios</h1>

      {espaciosQ.isLoading && <p>Cargando…</p>}
      {!espaciosQ.isLoading && (espaciosQ.data||[]).length === 0 && <p>No hay espacios.</p>}

      <div
        style={{
          display:"grid",
          gridTemplateColumns:"repeat(auto-fill, minmax(140px, 1fr))",
          gap:16,
          marginTop:12,
          alignItems:"stretch"
        }}
      >
        {(espaciosQ.data||[]).map((e)=> {
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
    </section>
  );
}
