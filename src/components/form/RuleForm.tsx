import React, { useState, useEffect } from 'react';
import TextInput from '../form/form-elements/TextInput';
import TextareaInput from '../form/form-elements/TextAreaInput';
import SelectInput from '../form/form-elements/SelectInput';

interface RuleFormProps {
  initialData?: { title?: string; content?: string; language?: string; version?: string };
  onSubmit?: (data: { title: string; content: string; language: string; version: string; }) => Promise<void>; 
  onCancel: () => void;
  submitLabel?: string;
  isLoading?: boolean;
  readOnly?: boolean;  
}


const RuleForm: React.FC<RuleFormProps> = ({
  initialData = {},
  onSubmit,
  onCancel,
  submitLabel = "Save",
  isLoading = false,
  readOnly = false
}) => {

  const [formData, setFormData] = useState({
    title: initialData.title || "",
    content: initialData.content || "",
    language: initialData.language || "en-US",
    version: initialData.version || "1.0",
  });

  useEffect(() => {
    setFormData({
      title: initialData.title || "",
      content: initialData.content || "",
      language: initialData.language || "en-US",
      version: initialData.version || "1.0",
    });
  }, [initialData]);

  const handleChange =
    (field: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setFormData(prev => ({ ...prev, [field]: e.target.value }));
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) return;
    if (!formData.content.trim()) return;

    await onSubmit?.(formData);
  };

  return (
    <form onSubmit={readOnly ? (e) => e.preventDefault() : handleSubmit} className="space-y-6">

      
      {/* Title */}
      <TextInput
        label="Title *"
        value={formData.title}
        onChange={handleChange("title")}
        required
        readOnly={readOnly}
        disabled={readOnly}
      />


      {/* Content */}
      <TextareaInput
        label="Content *"
        value={formData.content}
        onChange={handleChange("content")}
        required
        readOnly={readOnly}
        disabled={readOnly}
      />


      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SelectInput
          label="Language *"
          value={formData.language}
          onChange={handleChange("language")}
          disabled={readOnly}
          options={[
            { value: "en-US", label: "en-US" },
            { value: "es-ES", label: "es-ES" },
            { value: "fr-FR", label: "fr-FR" },
          ]}
        />


        {/* Version */}
        <TextInput
          label="Version *"
          value={formData.version}
          onChange={handleChange("version")}
          required
          readOnly={readOnly}
          disabled={readOnly}
        />


      </div>

      {/* Buttons */}
      <div className="flex justify-end space-x-3">
        <button type="button" onClick={onCancel} className="px-4 py-2 border rounded-md">
          Cancel
        </button>

       {onSubmit &&
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md"
        >
          {isLoading ? "Saving..." : submitLabel}
        </button>}
      </div>
    </form>
  );
};

export default RuleForm;
