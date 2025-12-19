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
          className="grid items-center  gap-3 p-3 border rounded"
          style={{ gridTemplateColumns: "auto 1fr 0.5fr 2fr auto" }}
        >
          {/* Required checkbox */}
      <div className="flex items-center justify-center h-10">
        <RequiredCheckbox
          checked={prop.required}
          onChange={(value) => handlePropertyChange(index, "required", value)}
          tooltip="Required"
          disabled={readOnly}
        />
      </div>

          {/* Property Name */}
          <div className="flex flex-col justify-center h-10">
          <TextInput
            label=""
            value={prop.name}
            onChange={(e) => handlePropertyChange(index, "name", e.target.value)}
            placeholder="Property Name"
            disabled={readOnly}
          />
          {errors[index] && (
            <p className="text-red-500 text-xs mt-1 ml-1">{errors[index]}</p>
          )}
        </div>

          {/* Type select */}
         <div className="flex items-center h-10">
          <SelectInput
            disabled={readOnly}
            value={prop.type}
            onChange={(e) => handlePropertyChange(index, "type", e.target.value)}
            options={[
              { value: "string", label: "string" },
              { value: "boolean", label: "boolean" },
            ]}
          />
        </div>

          {/* Enum / MultiInput */}
         <div className="flex items-center">
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
              disabled
              label=""
              value="true, false"
              // value={prop.enumValues.join(",")}
              onChange={(e) =>
                handlePropertyChange(
                  index,
                  "enumValues",
                  e.target.value.split(",").map((v) => v.trim())
                )
              }
            />
          )}
        </div>

          {/* Delete button */}
            {!readOnly && (
              <div className="flex items-center justify-center h-10">
                <button type="button" onClick={() => handleDeleteProperty(index)}>
                  <TrashIcon className="w-5 h-5 text-red-500" />
                </button>
              </div>
            )}

           </div>
                  ))}

          {!readOnly && (
        <div className="flex justify-end mt-3">
        <button
        type="button"
        onClick={handleAddProperty}
        className="inline-flex items-center gap-2 rounded-md bg-white border dark:text-indigo-400/70 px-3 py-2 text-sm font-medium text-indigo-600 shadow-sm hover:bg-indigo-50 hover:border-indigo-600 transition-colors"
        title="Add a new property"
      >
        <span className="flex items-center justify-center">
          <PlusIcon className="h-4 w-4" />
        </span>
        <span>Add property</span>
      </button>
        </div>
      )}
    </div>
  );
};

export default AnalysisPlanPropertiesEditor;
