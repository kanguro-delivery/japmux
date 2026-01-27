import React from "react";

interface RequiredCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  tooltip?: string;
  disabled?:boolean
}

const RequiredCheckbox: React.FC<RequiredCheckboxProps> = ({
  checked,
  onChange,
  tooltip = "Mark this property as required",
  disabled=false
}) => {
  return (
    <div
      className="checkbox-wrapper-29"
      title={tooltip} 
    >
      <label className="checkbox">
        <input
          type="checkbox"
          className="checkbox__input"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
        />
        <span className="checkbox__label"></span>
      </label>
    </div>
  );
};

export default RequiredCheckbox;
