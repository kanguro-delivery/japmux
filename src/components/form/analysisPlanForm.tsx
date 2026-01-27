import React, { useState, useEffect } from "react";
import AnalysisPlanEditor from "../common/AnalysisPlanEditor";
import AnalysisPlanPropertiesEditor, { AnalysisPlanProperty } from "./AnalysisPlanProperties";
import TextInput from "./form-elements/TextInput";
import { showErrorToast } from "@/utils/toastUtils";

interface AnalysisPlanFormProps {
  initialData?: {
    name?: string;
    promptText?: string;
    properties?: AnalysisPlanProperty[];
  };
 onSubmit?: (data: 
   { name: string;
    structuredDataPrompt: string;
    structuredDataSchema: {
      type: string;
      properties: Record<string, any>;
      required: string[];
    };
  }
  ) => Promise<void>;
  onCancel: () => void;
  submitLabel?: string;
  isLoading?: boolean;
  readOnly?: boolean;
}


const AnalysisPlanForm: React.FC<AnalysisPlanFormProps> = ({
  initialData = {},
  onSubmit,
  onCancel,
  submitLabel = "Save",
  isLoading = false,
  readOnly = false,
}) => {
  const [formData, setFormData] = useState<{
    name: string;
    promptText: string;
    properties: AnalysisPlanProperty[];
  }>({
    name: initialData.name || "",
    promptText: initialData.promptText || "",
    properties: initialData.properties || [],
  });

const [canSubmit, setCanSubmit] = useState<boolean>(false);
const [hasPropertyErrors, setHasPropertyErrors] = useState(false);

 useEffect(() => {
    setCanSubmit(
      formData.name.trim() !== "" &&
      formData.promptText.trim() !== "" &&
      !hasPropertyErrors
    );
  }, [formData.name, formData.promptText, hasPropertyErrors]);
  
  useEffect(() => {
    setFormData({
      name:initialData.name || "",
      promptText: initialData.promptText || "",
      properties: initialData.properties ||[],
    });
  }, [initialData.name, initialData.promptText , initialData.properties]);

  const handleChange =
      (field: string) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [field]: e.target.value }));
      };

  const handlePromptChange = (value: string) => {
    setFormData((prev) => ({ ...prev, promptText: value }));
  };

   const handlePropertiesChange = (properties: AnalysisPlanProperty[]) => {
    setFormData(prev => ({ ...prev, properties }));
  };

  
 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!canSubmit) return;

  // Build structuredDataSchema
  const schemaProperties: Record<string, any> = {};
  const requiredFields: string[] = [];

  formData.properties.forEach((prop) => {
    if (!prop.name) return; // skip empty names

    schemaProperties[prop.name] = {
      type: prop.type,
    };

    if (prop.type === "string" && prop.enumValues.length > 0) {
      schemaProperties[prop.name].enum = prop.enumValues;
    }

    if (prop.required) {
      requiredFields.push(prop.name);
    }
  });

  const payload = {
    name: formData.name.trim(),
    structuredDataPrompt: formData.promptText.trim(),
    structuredDataSchema: {
      type: "object",
      properties: schemaProperties,
      required: requiredFields,
    },
  };

  // Optional: simple validation before sending
  if (!payload.structuredDataPrompt) {
    return showErrorToast("Structured Data Prompt cannot be empty");
  }

  if (
    !payload.structuredDataSchema ||
    !payload.structuredDataSchema.properties ||
    Object.keys(payload.structuredDataSchema.properties).length === 0
  ) {
    return showErrorToast("Structured Data Schema cannot be empty");
  }

  await onSubmit?.(payload);
};




  return (
    <form
      onSubmit={readOnly ? (e) => e.preventDefault() : handleSubmit}
      className="space-y-6"
    >
      <TextInput
        label="Analysis Plan Name *"
        value={formData.name}
        onChange={handleChange("name")}
        required
        readOnly={readOnly}
        disabled={readOnly}
      />
    
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Analysis Plan Text *
        </label>

        <div className="mt-2">
          <AnalysisPlanEditor
            value={formData.promptText}
            onChange={handlePromptChange}
            placeholder="Enter your analysis plan text here..."
            readOnly={readOnly}
          />
        </div>
        

      <AnalysisPlanPropertiesEditor
       initialProperties={formData.properties}
        onChange={handlePropertiesChange}
        onErrorsChange={(hasErrors) => setHasPropertyErrors(hasErrors)}
        readOnly={readOnly}
      />

      </div>

     
      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border rounded-md"
        >
          Cancel
        </button>

        {onSubmit && !readOnly && (
          <button
            type="submit"
            disabled={isLoading ||!canSubmit}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md disabled:opacity-50"
          >
            {isLoading ? "Saving..." : submitLabel}
          </button>
        )}
      </div>
    </form>
  );
};

export default AnalysisPlanForm;
