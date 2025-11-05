import { useParams, Link } from "react-router-dom";
import ParqueoMap from "../components/ParqueoMap";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";

type Parqueo = {
  id: number;
  nombre: string;
  direccion: string;
  capacidad: number;
  horario: string;
};

export default function ParqueoDetalle() {
  const { id } = useParams();
  const parqueoId = Number(id);

  // Cargar información general del parqueo
  const parqueoQuery = useQuery({
    queryKey: ["parqueo", parqueoId],
    queryFn: async () => {
      const { data } = await api.get<Parqueo>(`/api/parqueos/${parqueoId}/`);
      return data;
    },
    enabled: !!parqueoId,
  });

  if (parqueoQuery.isLoading) {
    return <div className="text-center p-6">Cargando información del parqueo...</div>;
  }

  if (parqueoQuery.isError || !parqueoQuery.data) {
    return (
      <div className="text-center p-6 text-red-500">
        Error cargando datos del parqueo.
        <br />
        <Link to="/parqueos" className="text-blue-400 hover:underline">Volver a lista</Link>
      </div>
    );
  }

  const parqueo = parqueoQuery.data;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Encabezado del parqueo */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Parqueo {parqueo.nombre}
          </h1>
          <p className="opacity-80 text-gray-300">
            {parqueo.direccion || "Sin dirección"} • Capacidad: {parqueo.capacidad} • Horario: {parqueo.horario || "No especificado"}
          </p>
        </div>
        <Link
          to="/parqueos"
          className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded"
        >
          ← Volver
        </Link>
      </div>

      {/* Mapa de espacios */}
      <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
        <ParqueoMap parqueoId={parqueoId} />
      </div>
    </div>
  );
}
