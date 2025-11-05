import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  CrudForm,
  CrudTable,
  useResourceList,
  useResourceOne,
  useResourceMutations,
} from "../lib/crud";
import type { ResourceConfig } from "../types";
import { StatsAPI } from "../lib/api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

/* ---------- Normalizador de respuesta de listados ---------- */
type PageShape =
  | any[]
  | {
      results?: any[];
      count?: number;
      next?: string | null;
      previous?: string | null;
    }
  | { items?: any[]; total?: number; next?: string | null; prev?: string | null }
  | Record<string, any>;

function normalizePage(data?: PageShape) {
  if (!data)
    return {
      rows: [] as any[],
      count: 0,
      next: null as string | null,
      previous: null as string | null,
    };

  // 1) Array plano
  if (Array.isArray(data))
    return { rows: data, count: data.length, next: null, previous: null };

  // 2) DRF estándar
  if (Array.isArray((data as any).results)) {
    const d = data as any;
    return {
      rows: d.results,
      count: Number(d.count ?? d.results.length),
      next: d.next ?? null,
      previous: d.previous ?? null,
    };
  }

  // 3) Variantes comunes
  if (Array.isArray((data as any).items)) {
    const d = data as any;
    return {
      rows: d.items,
      count: Number(d.total ?? d.items.length),
      next: d.next ?? null,
      previous: d.prev ?? null,
    };
  }

  // 4) Fallback: mostrar el objeto como una fila
  return { rows: [data], count: 1, next: null, previous: null };
}

/* ==================== Página genérica de recurso ==================== */
export default function ResourcePage({
  res,
  mode,
}: {
  res: ResourceConfig;
  mode?: "create" | "edit";
}) {
  const nav = useNavigate();
  const { id } = useParams();
  const [sp, setSp] = useSearchParams();
  const [search, setSearch] = useState(sp.get("search") ?? "");
  const page = Number(sp.get("page") || 1);

  const listQ = useResourceList<any>(res, search, page);
  const one = useResourceOne<any>(res, id);
  const { createM, updateM, deleteM } = useResourceMutations(res);

  const defaults = useMemo(() => {
    if (mode === "edit" && one.data) return one.data;
    const d: Record<string, any> = {};
    res.fields.forEach((f) => {
      if (f.type === "checkbox") d[f.name] = false;
    });
    return d;
  }, [mode, one.data, res.fields]);

  const submit = async (values: any) => {
    res.fields.forEach((f) => {
      if (f.parseOut) values[f.name] = f.parseOut(values[f.name]);
      if (f.type === "checkbox") values[f.name] = values[f.name] ? 1 : 0;
      if (f.type === "number") values[f.name] = Number(values[f.name]);
    });
    if (mode === "create") await createM.mutateAsync(values);
    else if (mode === "edit" && id) await updateM.mutateAsync({ id, payload: values });
    nav(`/${res.key}`);
  };

  const onDelete = async (rid: number | string) => {
    if (!confirm("¿Seguro que querés borrar este registro?")) return;
    await deleteM.mutateAsync(rid);
    listQ.refetch();
  };

  /* -------------------- FORM -------------------- */
  if (mode === "create" || mode === "edit") {
    if (mode === "edit" && one.isLoading) return <p>Cargando…</p>;
    return (
      <section className="space-y-4">
        <header className="row" style={{ justifyContent: "space-between" }}>
          <h1 className="title">
            {mode === "create"
              ? `Nuevo ${res.title.slice(0, -1)}`
              : `Editar ${res.title.slice(0, -1)} #${id}`}
          </h1>
          <Link to={`/${res.key}`} className="btn">
            Volver
          </Link>
        </header>
        <CrudForm res={res} defaults={defaults} onSubmit={submit} />
      </section>
    );
  }

  /* -------------------- LISTADO -------------------- */
  const pageData = normalizePage(listQ.data);
  const hasPrev = Boolean(pageData.previous);
  const hasNext = Boolean(pageData.next);

  return (
    <section className="space-y-4">
      <header
        className="row"
        style={{ justifyContent: "space-between", marginBottom: 8 }}
      >
        <h1 className="title">{res.title}</h1>
        <div className="row">
          <input
            className="input"
            placeholder="Buscar…"
            style={{ width: 220 }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setSp({ search, page: "1" });
                listQ.refetch();
              }
            }}
          />
          <button
            className="btn btn-primary"
            onClick={() => {
              setSp({ search, page: "1" });
              listQ.refetch();
            }}
          >
            Buscar
          </button>
          <Link to={`/${res.key}/nuevo`} className="btn btn-success">
            Nuevo
          </Link>
        </div>
      </header>

      {listQ.isLoading && <p>Cargando…</p>}

      {!!pageData.rows.length && (
        <>
          <CrudTable
            rows={pageData.rows}
            cols={res.fields}
            onEdit={(id) => nav(`/${res.key}/${id}`)}
            onDelete={onDelete}
            extraActions={
              res.key === "parqueos"
                ? (row) => (
                    <Link
                      to={`/parqueos/${row.id}/espacios`}
                      className="btn"
                      style={{ marginRight: 6 }}
                    >
                      Mapa
                    </Link>
                  )
                : undefined
            }
          />

          <div
            className="row"
            style={{ justifyContent: "space-between", marginTop: 8 }}
          >
            <span className="text-xs">Total: {pageData.count}</span>
            <div className="row">
              <button
                className="btn"
                disabled={!hasPrev}
                onClick={() => {
                  setSp({ search, page: String(Math.max(1, page - 1)) });
                  listQ.refetch();
                }}
              >
                Anterior
              </button>
              <span style={{ padding: "8px 12px" }}>Página {page}</span>
              <button
                className="btn"
                disabled={!hasNext}
                onClick={() => {
                  setSp({ search, page: String(page + 1) });
                  listQ.refetch();
                }}
              >
                Siguiente
              </button>
            </div>
          </div>
        </>
      )}

      {!listQ.isLoading && pageData.rows.length === 0 && (
        <div className="table-wrap">
          <div className="empty">Sin registros</div>
        </div>
      )}

      {res.key === "usuarios" && <MiniDashboard />}
    </section>
  );
}

/* -------------------- Mini Dashboard (opcional) -------------------- */
function MiniDashboard() {
  const stats = useQuery({
    queryKey: ["stats"],
    queryFn: () => StatsAPI.get(),
  });
  const serie = useQuery({
    queryKey: ["stats7d"],
    queryFn: () => StatsAPI.reservas7d(),
  });

  return (
    <div style={{ marginTop: 24 }}>
      <h2 className="title">Resumen</h2>
      {stats.isLoading ? (
        <p>Cargando métricas…</p>
      ) : stats.isError ? (
        <p>Error al cargar métricas.</p>
      ) : (
        <div className="row" style={{ flexWrap: "wrap", gap: 12 }}>
          {Object.entries(stats.data || {}).map(([k, v]) => (
            <div
              key={k}
              className="btn"
              style={{
                minWidth: 180,
                justifyContent: "space-between",
                display: "flex",
              }}
            >
              <span style={{ opacity: 0.8 }}>{k}</span>
              <b>{v as number}</b>
            </div>
          ))}
        </div>
      )}

      <div
        style={{
          height: 260,
          marginTop: 12,
          background: "rgba(255,255,255,.06)",
          border: "1px solid var(--border)",
          borderRadius: 8,
          padding: 8,
        }}
      >
        {serie.isLoading ? (
          <p style={{ padding: 8 }}>Cargando gráfico…</p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={serie.data?.series || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="count" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
