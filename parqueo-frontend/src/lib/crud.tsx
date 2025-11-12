// src/lib/crud.tsx
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type FormEvent,
  type ReactNode,
} from "react";
import { api } from "./api";
import type { FieldConfig, ResourceConfig, SelectOption } from "../types";

type ApiListResponse<T> =
  | T[]
  | {
      results?: T[];
      count?: number;
      next?: string | null;
      previous?: string | null;
    };

function joinDetailUrl(base: string, id: string | number) {
  if (base.endsWith("/")) return `${base}${id}/`;
  return `${base}/${id}/`;
}

function normalizeOptions(raw: unknown, field: FieldConfig): SelectOption[] {
  if (!raw) return [];
  const arr = Array.isArray(raw)
    ? raw
    : Array.isArray((raw as any).results)
      ? (raw as any).results
      : Array.isArray((raw as any).items)
        ? (raw as any).items
        : [];

  return arr.map((item: any) => {
    const valueKey = field.valueKey ?? "id";
    const labelKey = field.labelKey ?? "nombre";
    const value = item?.[valueKey] ?? item?.id ?? item?.value ?? item?.pk ?? "";
    const label = item?.[labelKey] ?? item?.label ?? String(value ?? "");
    return {
      value: typeof value === "number" || typeof value === "string" ? value : String(value ?? ""),
      label: String(label ?? value ?? ""),
    };
  });
}

/* ----------------- LIST ----------------- */
export function useResourceList(
  res: ResourceConfig,
  search: string,
  page: number,
) {
  return useQuery<ApiListResponse<any>>({
    queryKey: ["list", res.key, search ?? "", page ?? 1],
    queryFn: async () => {
      const params: Record<string, unknown> = {
        page: page || 1,
        page_size: 100,
      };
      if (search && search.trim()) params.search = search.trim();

      const response = await api.get<ApiListResponse<any>>(res.endpoint, { params });
      return response.data;
    },
    placeholderData: (prev) => prev,
  });
}

/* ----------------- ONE ----------------- */
export function useResourceOne<T = any>(res: ResourceConfig, id?: string) {
  return useQuery<T>({
    queryKey: ["one", res.key, id ?? ""],
    queryFn: async () => {
      if (!id) throw new Error("id requerido");
      const response = await api.get<T>(joinDetailUrl(res.endpoint, id));
      return response.data;
    },
    enabled: Boolean(id),
  });
}

/* ----------------- MUTATIONS ----------------- */
export function useResourceMutations(res: ResourceConfig) {
  const qc = useQueryClient();

  const createM = useMutation({
    mutationFn: (payload: any) => api.post(res.endpoint, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["list", res.key] }),
  });

  const updateM = useMutation({
    mutationFn: ({ id, payload }: { id: string | number; payload: any }) =>
      api.put(joinDetailUrl(res.endpoint, id), payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["list", res.key] });
      qc.invalidateQueries({ queryKey: ["one", res.key] });
    },
  });

  const deleteM = useMutation({
    mutationFn: (id: string | number) => api.delete(joinDetailUrl(res.endpoint, id)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["list", res.key] }),
  });

  return { createM, updateM, deleteM };
}

/* ----------------- FORM ----------------- */
type CrudFormProps = {
  res: ResourceConfig;
  defaults: Record<string, any>;
  onSubmit: (values: Record<string, any>) => void | Promise<void>;
};

export function CrudForm({ res, defaults, onSubmit }: CrudFormProps) {
  const [values, setValues] = useState<Record<string, any>>(() => ({ ...defaults }));
  const [submitting, setSubmitting] = useState(false);
  const formFields = useMemo(() => res.fields.filter((f) => f.name !== "id"), [res.fields]);

  useEffect(() => {
    setValues({ ...defaults });
  }, [defaults]);

  const handleChange = (name: string, value: any) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const submit = async (evt: FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    try {
      setSubmitting(true);
      await onSubmit(values);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="space-y-3" onSubmit={submit}>
      {formFields.map((field) => (
        <FieldControl
          key={field.name}
          field={field}
          value={values[field.name] ?? ""}
          onChange={handleChange}
        />
      ))}

      <div className="row" style={{ justifyContent: "flex-end" }}>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? "Guardando…" : "Guardar"}
        </button>
      </div>
    </form>
  );
}

type FieldControlProps = {
  field: FieldConfig;
  value: any;
  onChange: (name: string, value: any) => void;
};

function FieldControl({ field, value, onChange }: FieldControlProps) {
  const commonStyle = useMemo(() => ({ width: field.width ?? "100%" }), [field.width]);

  if (field.type === "checkbox") {
    const checked = Boolean(value);
    return (
      <label className="row" style={{ alignItems: "center" }}>
        <span>{field.label}</span>
        <input
          className="checkbox"
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(field.name, e.target.checked)}
        />
      </label>
    );
  }

  if (field.type === "select") {
    return (
      <SelectControl field={field} value={value} onChange={onChange} style={commonStyle} />
    );
  }

  const inputType = field.type === "datetime" ? "datetime-local" : field.type === "date" ? "date" : field.type;
  const inputValue = formatValueForInput(field, value);

  return (
    <label className="space-y-1" style={{ display: "block" }}>
      <span>{field.label}</span>
      <input
        className="input"
        style={commonStyle}
        required={field.required}
        type={inputType}
        value={inputValue}
        onChange={(e) => onChange(field.name, e.target.value)}
      />
    </label>
  );
}

type SelectControlProps = {
  field: FieldConfig;
  value: any;
  onChange: (name: string, value: any) => void;
  style?: CSSProperties;
};

function SelectControl({ field, value, onChange, style }: SelectControlProps) {
  const staticOptions = field.options ?? [];

  const optsQuery = useQuery<SelectOption[]>({
    queryKey: ["field-options", field.name, field.optionsEndpoint, field.valueKey, field.labelKey],
    queryFn: async () => {
      if (!field.optionsEndpoint) return staticOptions;
      const response = await api.get(field.optionsEndpoint);
      return normalizeOptions(response.data, field);
    },
    enabled: Boolean(field.optionsEndpoint),
    staleTime: 5 * 60 * 1000,
    placeholderData: staticOptions,
  });

  const options = field.optionsEndpoint ? optsQuery.data ?? staticOptions : staticOptions;
  const loading = field.optionsEndpoint ? optsQuery.isLoading : false;

  return (
    <label className="space-y-1" style={{ display: "block" }}>
      <span>{field.label}</span>
      <select
        className="select"
        style={style}
        required={field.required}
        value={value ?? ""}
        onChange={(e) => onChange(field.name, e.target.value)}
      >
        <option value="">— seleccionar —</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {loading && <small style={{ opacity: 0.7 }}>Cargando opciones…</small>}
    </label>
  );
}

/* ----------------- TABLE ----------------- */
type CrudTableProps = {
  rows: any[];
  cols: FieldConfig[];
  onEdit?: (id: string | number) => void;
  onDelete?: (id: string | number) => void;
  extraActions?: (row: any) => ReactNode;
};

export function CrudTable({ rows, cols, onEdit, onDelete, extraActions }: CrudTableProps) {
  const visibleCols = useMemo(() => cols.filter((c) => c.list !== false), [cols]);

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {visibleCols.map((col) => (
              <th key={col.name}>{col.label}</th>
            ))}
            {(onEdit || onDelete || extraActions) && <th className="actions">Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const id = row?.id ?? row?.pk;
            return (
              <tr key={id ?? JSON.stringify(row)}>
                {visibleCols.map((col) => (
                  <td key={col.name}>{renderValue(row[col.name])}</td>
                ))}
                {(onEdit || onDelete || extraActions) && (
                  <td className="actions">
                    {extraActions?.(row)}
                    {onEdit && (
                      <button className="btn" onClick={() => onEdit(id)}>
                        Editar
                      </button>
                    )}
                    {onDelete && (
                      <button className="btn btn-danger" onClick={() => onDelete(id)}>
                        Eliminar
                      </button>
                    )}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function renderValue(value: unknown) {
  if (value === null || value === undefined || value === "") return "-";
  if (typeof value === "boolean") return value ? "Sí" : "No";
  if (value instanceof Date) return value.toLocaleString();
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "object") {
    if ("nombre" in (value as any)) return String((value as any).nombre);
    if ("label" in (value as any)) return String((value as any).label);
    return JSON.stringify(value);
  }
  return String(value);
}

function formatValueForInput(field: FieldConfig, rawValue: any) {
  if (rawValue === null || rawValue === undefined) return "";

  if (field.type === "number") {
    return rawValue === "" ? "" : String(rawValue);
  }

  if (field.type === "date" || field.type === "datetime") {
    const date = new Date(rawValue);
    if (!Number.isNaN(date.getTime())) {
      if (field.type === "date") {
        return date.toISOString().slice(0, 10);
      }
      const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
      return local.toISOString().slice(0, 16);
    }
  }

  return String(rawValue);
}
