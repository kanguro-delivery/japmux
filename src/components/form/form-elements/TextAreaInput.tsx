
import React from "react";

interface TextareaInputProps {
  label: string;
  value: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  required?: boolean;
  readOnly?: boolean;
  disabled?: boolean;
}

const TextareaInput: React.FC<TextareaInputProps> = ({
  label,
  value,
  onChange,
  required = false,
  readOnly = false,
  disabled = false,
}) => {
  return (
    <div>
      <label className="block text-sm font-medium mb-2">{label}</label>
      <textarea
        value={value}
        onChange={onChange}
        rows={6}
        className="w-full px-3 py-2 border rounded-md"
        required={required}
        readOnly={readOnly}
        disabled={disabled}
      />
    </div>
  );
};

export default TextareaInput;
