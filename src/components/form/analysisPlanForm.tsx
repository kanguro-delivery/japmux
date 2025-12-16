import React, { useState, useEffect } from "react";
import AnalysisPlanEditor from "../common/AnalysisPlanEditor";
import AnalysisPlanPropertiesEditor from "./AnalysisPlanProperties";

interface AnalysisPlanFormProps {
  initialData?: { promptText?: string };
  onSubmit?: (data: { promptText: string }) => Promise<void>;
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
  const [formData, setFormData] = useState({
    promptText: initialData.promptText || "",
  });

  
  useEffect(() => {
    setFormData({
      promptText: initialData.promptText || "",
    });
  }, [initialData.promptText]);

  
  const handlePromptChange = (value: string) => {
    setFormData((prev) => ({ ...prev, promptText: value }));
  };

  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.promptText.trim()) return;

    await onSubmit?.(formData);
  };

  return (
    <form
      onSubmit={readOnly ? (e) => e.preventDefault() : handleSubmit}
      className="space-y-6"
    >
    
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
        <AnalysisPlanPropertiesEditor></AnalysisPlanPropertiesEditor>
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
            disabled={isLoading}
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
