// src/resources/resourcesConfig.ts
import type { ResourceConfig, SelectOption } from "../types";

const toNumber = (value: unknown) => Number(value);
const booleanToInt = (value: unknown) => (Boolean(value) ? 1 : 0);

const estadoOcupacionOptions: SelectOption[] = [
  { value: "libre", label: "Libre" },
  { value: "ocupado", label: "Ocupado" },
  { value: "reservado", label: "Reservado" },
  { value: "fuera_servicio", label: "Fuera de servicio" },
];

const espacioTipoOptions: SelectOption[] = [
  { value: "auto", label: "Auto" },
  { value: "moto", label: "Moto" },
  { value: "discapacitado", label: "Discapacitado" },
  { value: "electrico", label: "Eléctrico" },
];

const vehiculoTipoOptions: SelectOption[] = [
  { value: "auto", label: "Auto" },
  { value: "moto", label: "Moto" },
];

const reservaEstadoOptions: SelectOption[] = [
  { value: "pendiente", label: "Pendiente" },
  { value: "activa", label: "Activa" },
  { value: "cancelada", label: "Cancelada" },
  { value: "finalizada", label: "Finalizada" },
];

const pagoEstadoOptions: SelectOption[] = [
  { value: "pendiente", label: "Pendiente" },
  { value: "aprobado", label: "Aprobado" },
  { value: "fallido", label: "Fallido" },
  { value: "reembolsado", label: "Reembolsado" },
];

const sensorTipoOptions: SelectOption[] = [
  { value: "ultrasonico", label: "Ultrasónico" },
  { value: "magnetico", label: "Magnético" },
  { value: "camaras", label: "Cámaras" },
  { value: "otro", label: "Otro" },
];

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
      { name: "activo", label: "Activo", type: "checkbox", list: true, parseOut: booleanToInt },
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
      { name: "activo", label: "Activo", type: "checkbox", list: true, parseOut: booleanToInt },
    ],
  },
  {
    key: "espacios",
    title: "Espacios",
    endpoint: "/api/espacios/",
    fields: [
      { name: "id", label: "ID", type: "number", list: true },
      {
        name: "parqueo",
        label: "Parqueo",
        type: "select",
        required: true,
        list: true,
        optionsEndpoint: "/api/parqueos/",
        valueKey: "id",
        labelKey: "nombre",
      },
      { name: "codigo", label: "Código", type: "text", required: true, list: true },
      { name: "nivel", label: "Nivel", type: "text", list: true },
      {
        name: "tipo",
        label: "Tipo",
        type: "select",
        list: true,
        options: espacioTipoOptions,
      },
      {
        name: "estado",
        label: "Estado",
        type: "select",
        required: true,
        list: true,
        options: estadoOcupacionOptions,
      },
    ],
  },
  {
    key: "vehiculos",
    title: "Vehículos",
    endpoint: "/api/vehiculos/",
    fields: [
      { name: "id", label: "ID", type: "number", list: true },
      {
        name: "usuario",
        label: "Usuario",
        type: "select",
        required: true,
        list: true,
        optionsEndpoint: "/api/usuarios/",
        valueKey: "id",
        labelKey: "nombres",
        // El backend espera el ID numérico, así que convertimos si llega como string
        parseOut: toNumber,
      },
      { name: "placa", label: "Placa", type: "text", required: true, list: true },
      {
        name: "tipo",
        label: "Tipo",
        type: "select",
        list: true,
        options: vehiculoTipoOptions,
      },
    ],
  },
  {
    key: "reservas",
    title: "Reservas",
    endpoint: "/api/reservas/",
    fields: [
      { name: "id", label: "ID", type: "number", list: true },
      {
        name: "usuario",
        label: "Usuario",
        type: "select",
        required: true,
        list: true,
        optionsEndpoint: "/api/usuarios/",
        valueKey: "id",
        labelKey: "nombres",
        parseOut: toNumber,
      },
      {
        name: "parqueo",
        label: "Parqueo",
        type: "select",
        required: true,
        list: true,
        optionsEndpoint: "/api/parqueos/",
        valueKey: "id",
        labelKey: "nombre",
        parseOut: toNumber,
      },
      {
        name: "espacio",
        label: "Espacio",
        type: "select",
        required: false,
        list: true,
        optionsEndpoint: "/api/espacios/",
        valueKey: "id",
        labelKey: "codigo",
        parseOut: toNumber,
      },
      {
        name: "inicio_previsto",
        label: "Inicio previsto",
        type: "datetime",
        required: true,
        list: true,
      },
      {
        name: "fin_previsto",
        label: "Fin previsto",
        type: "datetime",
        required: true,
        list: true,
      },
      {
        name: "estado",
        label: "Estado",
        type: "select",
        list: true,
        options: reservaEstadoOptions,
      },
      { name: "total_q", label: "Total (Q)", type: "number", list: true },
    ],
  },
  {
    key: "pagos",
    title: "Pagos",
    endpoint: "/api/pagos/",
    fields: [
      { name: "id", label: "ID", type: "number", list: true },
      {
        name: "reserva",
        label: "Reserva",
        type: "select",
        required: true,
        list: true,
        optionsEndpoint: "/api/reservas/",
        valueKey: "id",
        labelKey: "id",
        parseOut: toNumber,
      },
      { name: "monto", label: "Monto", type: "number", list: true },
      {
        name: "estado",
        label: "Estado",
        type: "select",
        list: true,
        options: pagoEstadoOptions,
      },
      { name: "fecha", label: "Fecha", type: "date", list: true },
    ],
  },
  {
    key: "sensores",
    title: "Sensores",
    endpoint: "/api/sensores/",
    fields: [
      { name: "id", label: "ID", type: "number", list: true },
      {
        name: "espacio",
        label: "Espacio",
        type: "select",
        required: true,
        list: true,
        optionsEndpoint: "/api/espacios/",
        valueKey: "id",
        labelKey: "codigo",
        parseOut: toNumber,
      },
      {
        name: "tipo",
        label: "Tipo",
        type: "select",
        list: true,
        options: sensorTipoOptions,
      },
      {
        name: "identificador_hardware",
        label: "Identificador HW",
        type: "text",
        required: true,
        list: true,
      },
      {
        name: "activo",
        label: "Activo",
        type: "checkbox",
        list: true,
        parseOut: booleanToInt,
      },
    ],
  },
  {
    key: "lecturas",
    title: "Lecturas",
    endpoint: "/api/lecturas/",
    fields: [
      { name: "id", label: "ID", type: "number", list: true },
      {
        name: "sensor",
        label: "Sensor",
        type: "select",
        required: true,
        list: true,
        optionsEndpoint: "/api/sensores/",
        valueKey: "id",
        labelKey: "id",
        parseOut: toNumber,
      },
      { name: "valor", label: "Valor", type: "number", list: true },
      { name: "fecha_hora", label: "Fecha/Hora", type: "datetime", list: true },
    ],
  },
];
