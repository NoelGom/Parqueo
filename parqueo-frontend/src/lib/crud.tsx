import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { list, getOne, createOne, updateOne, removeOne, api } from "./api";
import type { ResourceConfig, FieldConfig } from "../types";
import toast from "react-hot-toast";

/* ====== Tabla ====== */
export function CrudTable<T>({
  rows,
  cols,
  onEdit,
  onDelete,
  extraActions,            // 👈 acciones extra por fila
}: {
  rows: T[];
  cols: FieldConfig[];
  onEdit: (id: number | string) => void;
  onDelete: (id: number | string) => void;
  extraActions?: (row: any) => React.ReactNode;
}) {
  const listCols = cols.filter((c) => c.list !== false);
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {listCols.map((c) => (
              <th key={c.name}>{c.label}</th>
            ))}
            <th className="actions">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {(rows as any[]).map((r) => (
            <tr key={(r as any).id}>
              {listCols.map((c) => (
                <td key={c.name}>{renderCell((r as any)[c.name], c.type)}</td>
              ))}
              <td className="actions">
                {/* 👇 si hay acciones extra, se pintan aquí */}
                {extraActions?.(r)}{extraActions && " "}
                <button
                  className="btn btn-primary"
                  onClick={() => onEdit((r as any).id)}
                >
                  Editar
                </button>{" "}
                <button
                  className="btn btn-danger"
                  onClick={() => onDelete((r as any).id)}
                >
                  Borrar
                </button>
              </td>
            </tr>
          ))}
          {(!rows || (rows as any[]).length === 0) && (
            <tr>
              <td className="empty" colSpan={listCols.length + 1}>
                Sin registros
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function renderCell(v: any, type: FieldConfig["type"]) {
  if (type === "checkbox") return Number(v) ? "Sí" : "No";
  return String(v ?? "");
}

/* ====== Form ====== */
export function CrudForm({
  res,
  defaults,
  onSubmit,
}: {
  res: ResourceConfig;
  defaults?: Record<string, any>;
  onSubmit: (values: any) => Promise<void>;
}) {
  const { register, handleSubmit, reset } = useForm({ defaultValues: defaults });
  useEffect(() => {
    reset(defaults);
  }, [defaults, reset]);

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="row"
      style={{ flexDirection: "column", gap: 12 }}
    >
      <div className="row" style={{ flexWrap: "wrap" }}>
        {res.fields.map((f) => (
          <label
            key={f.name}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 6,
              minWidth: 260,
              flex: "1 1 260px",
            }}
          >
            <span className="text-sm">{f.label}</span>
            {f.type === "checkbox" ? (
              <input type="checkbox" className="checkbox" {...register(f.name)} />
            ) : f.type === "select" && f.optionsEndpoint ? (
              <OptionsLoader
                endpoint={f.optionsEndpoint}
                valueKey={f.valueKey || "id"}
                labelKey={f.labelKey || "nombre"}
              >
                {(opts) => (
                  <select
                    className="select"
                    {...register(f.name, { required: f.required })}
                  >
                    {opts.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                )}
              </OptionsLoader>
            ) : f.type === "select" ? (
              <select
                className="select"
                {...register(f.name, { required: f.required })}
              >
                {(f.options || []).map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                className="input"
                type={mapInputType(f.type)}
                {...register(f.name, { required: f.required })}
              />
            )}
          </label>
        ))}
      </div>
      <div className="row">
        <button className="btn btn-success" type="submit">
          Guardar
        </button>
        <button
          className="btn"
          type="button"
          onClick={() => history.back()}
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}

function mapInputType(t: FieldConfig["type"]) {
  if (t === "email") return "email";
  if (t === "number") return "number";
  if (t === "date") return "date";
  if (t === "datetime") return "datetime-local";
  return "text";
}

/* ====== Loader de opciones dinámicas ====== */
function OptionsLoader({
  endpoint,
  valueKey,
  labelKey,
  children,
}: {
  endpoint: string;
  valueKey: string;
  labelKey: string;
  children: (opts: { value: any; label: string }[]) => React.ReactNode;
}) {
  const q = useQuery({
    queryKey: ["opts", endpoint],
    queryFn: async () => {
      const { data } = await api.get(endpoint);
      const arr = Array.isArray(data) ? data : data.results || [];
      return arr.map((x: any) => ({
        value: x[valueKey],
        label: String(x[labelKey]),
      }));
    },
  });
  if (q.isLoading) return <div className="input">Cargando…</div>;
  if (q.isError) return <div className="input">Error al cargar opciones</div>;
  return <>{children(q.data || [])}</>;
}

/* ====== Hooks por recurso ====== */
export function useResourceList<T>(
  res: ResourceConfig,
  search?: string,
  page = 1
) {
  return useQuery({
    queryKey: [res.key, search, page],
    queryFn: () => list<T>(res.endpoint, { search, page }),
  });
}

export function useResourceOne<T>(res: ResourceConfig, id?: string) {
  return useQuery({
    queryKey: [res.key, "one", id],
    queryFn: () => getOne<T>(res.endpoint, id!),
    enabled: !!id,
  });
}

export function useResourceMutations(res: ResourceConfig) {
  const qc = useQueryClient();

  const createM = useMutation({
    mutationFn: (payload: any) => createOne(res.endpoint, payload),
    onSuccess: () => {
      toast.success("Creado correctamente");
      qc.invalidateQueries({ queryKey: [res.key] });
    },
    onError: () => toast.error("Error al crear"),
  });

  const updateM = useMutation({
    mutationFn: ({ id, payload }: { id: string | number; payload: any }) =>
      updateOne(res.endpoint, id, payload),
    onSuccess: () => {
      toast.success("Actualizado correctamente");
      qc.invalidateQueries({ queryKey: [res.key] });
    },
    onError: () => toast.error("Error al actualizar"),
  });

  const deleteM = useMutation({
    mutationFn: (id: string | number) => removeOne(res.endpoint, id),
    onSuccess: () => {
      toast.success("Eliminado correctamente");
      qc.invalidateQueries({ queryKey: [res.key] });
    },
    onError: () => toast.error("Error al eliminar"),
  });

  return { createM, updateM, deleteM };
}
