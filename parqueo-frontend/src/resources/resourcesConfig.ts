// src/resources/resourcesConfig.ts
import type { ResourceConfig } from "../types";

export const resources: ResourceConfig[] = [
  {
    key: "roles",
    title: "Roles",
    endpoint: "/api/roles/",
    fields: [
      { name: "id", label: "ID", type: "number", list: true },
      { name: "nombre", label: "Nombre", type: "text", required: true, list: true },
      { name: "descripcion", label: "Descripción", type: "text", list: true },
    ],
  },
  
     {
    key: "usuarios",
    title: "Usuarios",
    endpoint: "/api/usuarios/",
    fields: [
      { name: "id", label: "ID", type: "number", list: true },
      { name: "nombres", label: "Nombres", type: "text", required: true, list: true },
      { name: "apellidos", label: "Apellidos", type: "text", required: true, list: true },
      { name: "email", label: "Email", type: "email", required: true, list: true },
      { name: "telefono", label: "Teléfono", type: "text", list: true },
      // 👇 dinámico: carga de /api/roles/
      {
        name: "rol",
        label: "Rol",
        type: "select",
        required: true,
        list: true,
        optionsEndpoint: "/api/roles/",
        valueKey: "id",
        labelKey: "nombre",
      },
      {
        name: "activo",
        label: "Activo",
        type: "checkbox",
        list: true,
        parseOut: (v: unknown) => (Boolean(v) ? 1 : 0),
      },
      { name: "password", label: "Password (solo crear)", type: "text", list: false },
    ],
  },
  {
    key: "parqueos",
    title: "Parqueos",
    endpoint: "/api/parqueos/",
    fields: [
      { name: "id", label: "ID", type: "number", list: true },
      { name: "nombre", label: "Nombre", type: "text", required: true, list: true },
      { name: "direccion", label: "Dirección", type: "text", list: true },
      {
        name: "activo",
        label: "Activo",
        type: "checkbox",
        list: true,
        parseOut: (v: unknown) => (Boolean(v) ? 1 : 0),
      },
    ],
  },
  {
    key: "espacios",
    title: "Espacios",
    endpoint: "/api/espacios/",
    fields: [
      { name: "id", label: "ID", type: "number", list: true },
      { name: "parqueo", label: "Parqueo (ID)", type: "number", required: true, list: true },
      { name: "codigo", label: "Código", type: "text", required: true, list: true },
      {
        name: "disponible",
        label: "Disponible",
        type: "checkbox",
        list: true,
        parseOut: (v: unknown) => (Boolean(v) ? 1 : 0),
      },
    ],
  },
  {
    key: "vehiculos",
    title: "Vehículos",
    endpoint: "/api/vehiculos/",
    fields: [
      { name: "id", label: "ID", type: "number", list: true },
      { name: "usuario", label: "Usuario (ID)", type: "number", required: true, list: true },
      { name: "placa", label: "Placa", type: "text", required: true, list: true },
    ],
  },
  {
    key: "reservas",
    title: "Reservas",
    endpoint: "/api/reservas/",
    fields: [
      { name: "id", label: "ID", type: "number", list: true },
      { name: "usuario", label: "Usuario (ID)", type: "number", required: true, list: true },
      { name: "espacio", label: "Espacio (ID)", type: "number", required: true, list: true },
      { name: "inicio", label: "Inicio", type: "datetime", list: true },
      { name: "fin", label: "Fin", type: "datetime", list: true },
      { name: "estado", label: "Estado", type: "text", list: true },
    ],
  },
  {
    key: "pagos",
    title: "Pagos",
    endpoint: "/api/pagos/",
    fields: [
      { name: "id", label: "ID", type: "number", list: true },
      { name: "reserva", label: "Reserva (ID)", type: "number", required: true, list: true },
      { name: "monto", label: "Monto", type: "number", list: true },
      { name: "estado", label: "Estado", type: "text", list: true },
      { name: "fecha", label: "Fecha", type: "date", list: true },
    ],
  },
  {
    key: "sensores",
    title: "Sensores",
    endpoint: "/api/sensores/",
    fields: [
      { name: "id", label: "ID", type: "number", list: true },
      { name: "espacio", label: "Espacio (ID)", type: "number", required: true, list: true },
      { name: "tipo", label: "Tipo", type: "text", list: true },
      {
        name: "activo",
        label: "Activo",
        type: "checkbox",
        list: true,
        parseOut: (v: unknown) => (Boolean(v) ? 1 : 0),
      },
    ],
  },
  {
    key: "lecturas",
    title: "Lecturas",
    endpoint: "/api/lecturas/",
    fields: [
      { name: "id", label: "ID", type: "number", list: true },
      { name: "sensor", label: "Sensor (ID)", type: "number", required: true, list: true },
      { name: "valor", label: "Valor", type: "number", list: true },
      { name: "fecha_hora", label: "Fecha/Hora", type: "datetime", list: true },
    ],
  },
];
