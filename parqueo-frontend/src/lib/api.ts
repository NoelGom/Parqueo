// src/lib/api.ts
import axios from "axios";

export const api = axios.create({
  baseURL: "http://127.0.0.1:8000",
  withCredentials: false, // <- NO mandamos cookies/CSRF desde el front SPA
});

// Helpers para CRUD genérico
export async function list<T>(endpoint: string, params?: any) {
  const { data } = await api.get(endpoint, { params });
  // soporta paginado (DRF) y lista simple
  if (Array.isArray(data)) {
    return { results: data, count: data.length, next: null, previous: null };
  }
  return data as { results: T[]; count: number; next: string | null; previous: string | null };
}

export async function getOne<T>(endpoint: string, id: string | number) {
  const { data } = await api.get(`${endpoint}${id}/`);
  return data as T;
}

export async function createOne(endpoint: string, payload: any) {
  const { data } = await api.post(endpoint, payload);
  return data;
}

export async function updateOne(endpoint: string, id: string | number, payload: any) {
  const { data } = await api.put(`${endpoint}${id}/`, payload);
  return data;
}

export async function removeOne(endpoint: string, id: string | number) {
  const { data } = await api.delete(`${endpoint}${id}/`);
  return data;
}

/* Endpoints opcionales de estadísticas */
export const StatsAPI = {
  async get() {
    const { data } = await api.get("/api/stats/");
    return data as Record<string, number>;
  },
  async reservas7d() {
    const { data } = await api.get("/api/stats/reservas7d/");
    return data as { series: { date: string; count: number }[] };
  },
};
