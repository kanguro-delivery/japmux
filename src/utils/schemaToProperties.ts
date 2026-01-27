import { AnalysisPlanProperty } from "@/components/form/AnalysisPlanProperties";

export function schemaToProperties(schema: {
  properties?: Record<string, any>;
  required?: string[];
}): AnalysisPlanProperty[] {
  if (!schema?.properties) return [];

  return Object.entries(schema.properties).map(([name, value]: [string, any]) => ({
    name,
    type: value.type as "string" | "boolean",
    enumValues: value.enum ?? [],
    required: schema.required?.includes(name) ?? false,
  }));
}
