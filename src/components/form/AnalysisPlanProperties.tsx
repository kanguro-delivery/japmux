import React, { useState, useEffect } from "react";
import { PlusIcon } from "@heroicons/react/24/solid";
import { TrashIcon } from "@heroicons/react/24/outline";

import RequiredCheckbox from "../common/RequiredCheckbox";
import MultiInput from "../common/MultiInput";
import TextInput from "./form-elements/TextInput";
import SelectInput from "./form-elements/SelectInput";

export interface AnalysisPlanProperty {
  name: string;
  type: "string" | "boolean";
  enumValues: string[];
  required: boolean;
}

interface AnalysisPlanPropertiesEditorProps {
  initialProperties?: AnalysisPlanProperty[];
  onChange?: (properties: AnalysisPlanProperty[]) => void;
  onErrorsChange?: (hasErrors: boolean) => void;
  readOnly?: boolean;
}


const defaultProperty: AnalysisPlanProperty = {
  name: "",
  type: "string",
  enumValues: [],
  required: false,
};

const AnalysisPlanPropertiesEditor: React.FC<AnalysisPlanPropertiesEditorProps> = ({
  initialProperties = [],
  onChange,
  onErrorsChange,
  readOnly = false,
}) => {
  const [properties, setProperties] = useState<AnalysisPlanProperty[]>(initialProperties);
  const [errors, setErrors] = useState<{ [key: number]: string }>({});

  
useEffect(() => {
  if (initialProperties) setProperties(initialProperties);
  console.log('initialPropertiesss', initialProperties);
}, [initialProperties]);

  useEffect(() => {
    if (onErrorsChange) {
      const hasErrors = Object.values(errors).some((err) => err && err.length > 0);
      onErrorsChange(hasErrors);
    }
  }, [errors, onErrorsChange]);

  const handleAddProperty = () => {
     if (readOnly) return;
    const newProperties = [...properties, { ...defaultProperty }];
    setProperties(newProperties);
    onChange?.(newProperties);
  };

  const handleDeleteProperty = (index: number) => {
     if (readOnly) return;
    const newProperties = properties.filter((_, i) => i !== index);
    setProperties(newProperties);
    onChange?.(newProperties);
    const newErrors = { ...errors };
    delete newErrors[index];
    setErrors(newErrors);
  };

  const handlePropertyChange = (index: number, field: keyof AnalysisPlanProperty, value: any) => {
     if (readOnly) return;
    setProperties((prev) => {
      const newProps = [...prev];

      if (field === "name") {
        const isDuplicate = newProps.some((p, i) => i !== index && p.name.trim() === value.trim());
        setErrors((prevErrors) => ({
          ...prevErrors,
          [index]: isDuplicate ? "Property Name must be unique" : "",
        }));
      }

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
          className="grid items-start gap-2 p-2 border rounded"
          style={{ gridTemplateColumns: "auto 1fr 0.5fr 2fr auto" }}
        >
          {/* Required checkbox */}
          <RequiredCheckbox
            checked={prop.required}
            onChange={(value) => handlePropertyChange(index, "required", value)}
            tooltip="Required"
            disabled={readOnly}
          />

          {/* Property Name */}
          <div className="flex flex-col">
            <TextInput
              label=""
              value={prop.name}
              onChange={(e) => handlePropertyChange(index, "name", e.target.value)}
              placeholder="Property Name"
              disabled={readOnly}
            />
            {errors[index] && <p className="text-red-500 text-xs mt-1 ml-1">{errors[index]}</p>}
          </div>

          {/* Type select */}
          <SelectInput
            disabled={readOnly}
            value={prop.type}
            onChange={(e) => handlePropertyChange(index, "type", e.target.value)}
            options={[
              { value: "string", label: "string" },
              { value: "boolean", label: "boolean" },
            ]}
          />

          {/* Enum / MultiInput */}
          {prop.type === "string" ? (
            <MultiInput
             disabled={readOnly}
              values={prop.enumValues}
              onChange={(values) => handlePropertyChange(index, "enumValues", values)}
              placeholder="Press Enter to add values"
              className="w-full"
            />
          ) : (
            <TextInput
            disabled={readOnly}
              label=""
              value={prop.enumValues.join(",")}
              onChange={(e) =>
                handlePropertyChange(
                  index,
                  "enumValues",
                  e.target.value.split(",").map((v) => v.trim())
                )
              }
              
            />
          )}

          {/* Delete button */}
          {!readOnly && (
        <button type="button" onClick={() => handleDeleteProperty(index)}>
          <TrashIcon className="w-5 h-5 text-red-500" />
        </button>
      )}

        </div>
      ))}

    {!readOnly && (
      <div className="flex justify-start">
        <div className="relative group">
          <button type="button" onClick={handleAddProperty} title="Add Property">
            <PlusIcon
              className="w-8 h-8"
              style={{
                stroke: "url(#plus-gradient)",
                strokeWidth: 2.2,
              }}
            />
          </button>

          <svg width="0" height="0">
            <defs>
              <linearGradient id="plus-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#465fff" />
                <stop offset="100%" stopColor="#a855f7" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>
    )}
    </div>
  );
};

export default AnalysisPlanPropertiesEditor;
