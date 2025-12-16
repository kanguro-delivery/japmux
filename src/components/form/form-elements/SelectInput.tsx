import React from "react";

interface SelectInputProps {
  label?: string;
  value: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string; label: string }[];
  disabled?: boolean;
}

const SelectInput: React.FC<SelectInputProps> = ({
  label,
  value,
  onChange,
  options,
  disabled = false,
}) => {
  return (
    <div>
      {label&& <label className="block text-sm font-medium mb-2">{label}</label>}
      <select
        value={value}
        onChange={onChange}
        className="w-full px-3 py-2 border rounded-md"
        disabled={disabled}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SelectInput;
