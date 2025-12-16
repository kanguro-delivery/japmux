import React, { useState, KeyboardEvent } from "react";

interface MultiInputProps {
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  className?: string;
}

const MultiInput: React.FC<MultiInputProps> = ({ values, onChange, placeholder, className }) => {
  const [inputValue, setInputValue] = useState("");

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault();
      onChange([...values, inputValue.trim()]);
      setInputValue("");
    }
    if (e.key === "Backspace" && !inputValue) {
      onChange(values.slice(0, -1));
    }
  };

  const handleRemove = (index: number) => {
    const newValues = values.filter((_, i) => i !== index);
    onChange(newValues);
  };

  return (
    <div className={`flex flex-wrap items-center gap-1 ${className}`}>
      {values.map((val, idx) => (
        <div
          key={idx}
          className="flex items-center bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded px-2 py-1 text-sm"
        >
          {val}
          <button
            type="button"
            onClick={() => handleRemove(idx)}
            className="ml-1 text-red-500 font-bold"
          >
            ×
          </button>
        </div>
      ))}
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="flex-1 min-w-[80px] px-2 py-1 border rounded text-sm dark:bg-gray-800 dark:text-gray-100"
      />
    </div>
  );
};

export default MultiInput;
