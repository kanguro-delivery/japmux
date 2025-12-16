import React, { useState } from "react";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import RequiredCheckbox from "../common/RequiredCheckbox";
import MultiInput from "../common/MultiInput";
import TextInput from "./form-elements/TextInput";
import SelectInput from "./form-elements/SelectInput";

interface PropertyRow {
  name: string;
  type: "string" | "boolean";
  enumValues: string[];
  required: boolean;
}

interface AnalysisPlanPropertiesEditorProps {
  initialProperties?: PropertyRow[];
  onChange?: (properties: PropertyRow[]) => void;
}

const defaultProperty: PropertyRow = {
  name: "",
  type: "string",
  enumValues: [],
  required: false,
};

const AnalysisPlanPropertiesEditor: React.FC<AnalysisPlanPropertiesEditorProps> = ({
  initialProperties = [],
  onChange,
}) => {
  const [properties, setProperties] = useState<PropertyRow[]>(initialProperties);

  const handleAddProperty = () => {
    const newProperties = [...properties, { ...defaultProperty }];
    setProperties(newProperties);
    onChange?.(newProperties);
  };

  const handleDeleteProperty = (index: number) => {
    const newProperties = properties.filter((_, i) => i !== index);
    setProperties(newProperties);
    onChange?.(newProperties);
  };

  const handlePropertyChange = (index: number, field: keyof PropertyRow, value: any) => {
    setProperties(prev => {
      const newProps = [...prev];
      newProps[index] = { ...newProps[index], [field]: value };

      if (field === "type" && value === "boolean") {
        newProps[index].enumValues = ["true", "false"];
      } else if (field === "type") {
        newProps[index].enumValues = [];
      }

      onChange?.(newProps);
      return newProps;
    });
  };

  return (
    <div className="space-y-4">
      {properties.map((prop, index) => (
        <div
  key={index}
  className="grid items-center gap-2 p-2 border rounded"
  style={{ gridTemplateColumns: "auto 1fr 0.8fr 2fr auto" }}
>
  {/* Required checkbox */}
  <RequiredCheckbox
    checked={prop.required}
    onChange={(value) => handlePropertyChange(index, "required", value)}
    tooltip="Required"
  />

  {/* Property Name */}
  <TextInput
    label=""
    value={prop.name}
    onChange={(e) => handlePropertyChange(index, "name", e.target.value)}
  />

  <SelectInput value={prop.type} onChange={(e) => handlePropertyChange(index, "type", e.target.value)} options={[
    { value: "string", label: "string" },
    { value: "boolean", label: "boolean" },
  ]}></SelectInput>

  {/* Enum or MultiInput */}
  {prop.type === "string" ? (
    <MultiInput
      values={prop.enumValues}
      onChange={(values) => handlePropertyChange(index, "enumValues", values)}
      placeholder="Press Enter to add values"
      className="w-full"
    />
  ) : (
    <TextInput
      label=""
      value={prop.enumValues.join(",")}
      onChange={(e) =>
        handlePropertyChange(
          index,
          "enumValues",
          e.target.value.split(",").map((v) => v.trim())
        )
      }
      disabled={prop.type === "boolean"}
    />
  )}

  {/* Delete button */}
  <button type="button" onClick={() => handleDeleteProperty(index)}>
    <TrashIcon className="w-5 h-5 text-red-500" />
  </button>
</div>
      ))}

      <button
        type="button"
        onClick={handleAddProperty}
        className="flex items-center px-3 py-2 bg-indigo-600 text-white rounded-md disabled:opacity-50"
      >
        <PlusIcon className="w-5 h-5 mr-1" />
        Add Property
      </button>
    </div>
  );
};

export default AnalysisPlanPropertiesEditor;
