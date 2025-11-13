export type FieldType =
  | "text"
  | "email"
  | "number"
  | "checkbox"
  | "date"
  | "datetime"
  | "select";

export type SelectOption = {
  value: string | number;
  label: string;
};

export type FieldConfig = {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  list?: boolean;
  width?: number;
  parseOut?: (v: unknown) => unknown;
  options?: SelectOption[]; // estáticas
  // dinámicas:
  optionsEndpoint?: string; // ej: "/api/roles/"
  valueKey?: string; // ej: "id"
  labelKey?: string; // ej: "nombre"
};

export type ResourceConfig = {
  key: string;
  title: string;
  endpoint: string;
  fields: FieldConfig[];
};
