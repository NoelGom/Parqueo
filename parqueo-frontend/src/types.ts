export type FieldType = "text" | "email" | "number" | "checkbox" | "date" | "datetime" | "select";

export type FieldConfig = {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  list?: boolean;
  width?: number;
  parseOut?: (v: any) => any;
  options?: { value: any; label: string }[]; // estáticas
  // dinámicas:
  optionsEndpoint?: string;  // ej: "/api/roles/"
  valueKey?: string;         // ej: "id"
  labelKey?: string;         // ej: "nombre"
};
