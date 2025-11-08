import React from "react";

const FormSelect = ({ label, name, value, onChange, options = [], error, required = false, ...props }) => {
  return (
    <div className="form-column">
      <label htmlFor={name} className={required ? "required" : ""}>
        {label}
      </label>
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        aria-invalid={error ? "true" : "false"}
        {...props}
      >
        <option value="">Seleccione...</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <span className="error" id={`${name}-error`}>{error}</span>}
    </div>
  );
};

export default FormSelect;
