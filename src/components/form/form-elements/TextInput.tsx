import React from "react";

interface TextInputProps {
  label: string;
  value: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  readOnly?: boolean;
  disabled?: boolean;
}

const TextInput: React.FC<TextInputProps> = ({
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
      <input
        type="text"
        value={value}
        onChange={onChange}
        className="w-full px-3 py-2 border rounded-md"
        required={required}
        readOnly={readOnly}
        disabled={disabled}
      />
    </div>
  );
};

export default TextInput;
