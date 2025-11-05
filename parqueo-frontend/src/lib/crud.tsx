// src/lib/crud.tsx
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "./api";
import type { ResourceConfig } from "../types";

/* ----------------- LIST ----------------- */
export function useResourceList<T = any>(
  res: ResourceConfig,
  search: string,
  page: number
) {
  return useQuery({
    queryKey: ["list", res.key, search ?? "", page ?? 1],
    queryFn: async () => {
      const params: Record<string, any> = {
        page: page || 1,
        page_size: 100,             // <- evita que tu API devuelva vacío por defecto
      };
      if (search && search.trim()) params.search = search.trim();

      const { data } = await api.get(`/api/${res.key}/`, { params });

      // devuelvo tal cual; ResourcePage lo normaliza
      return data;
    },
    // si quieres, para que no parpadee al paginar
    keepPreviousData: true,
  });
}

/* ----------------- ONE ----------------- */
export function useResourceOne<T = any>(res: ResourceConfig, id?: string) {
  return useQuery({
    queryKey: ["one", res.key, id ?? ""],
    queryFn: async () => (await api.get<T>(`/api/${res.key}/${id}/`)).data,
    enabled: Boolean(id),
  });
}

/* ----------------- MUTATIONS ----------------- */
export function useResourceMutations(res: ResourceConfig) {
  const qc = useQueryClient();

  const createM = useMutation({
    mutationFn: (payload: any) => api.post(`/api/${res.key}/`, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["list", res.key] }),
  });

  const updateM = useMutation({
    mutationFn: ({ id, payload }: { id: string | number; payload: any }) =>
      api.put(`/api/${res.key}/${id}/`, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["list", res.key] });
      qc.invalidateQueries({ queryKey: ["one", res.key] });
    },
  });

  const deleteM = useMutation({
    mutationFn: (id: string | number) => api.delete(`/api/${res.key}/${id}/`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["list", res.key] }),
  });

  return { createM, updateM, deleteM };
}
