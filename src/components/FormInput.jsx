import React from "react";

const FormInput = ({ label, name, type = "text", value, onChange, error, required = false, ...props }) => {
  return (
    <div className="form-column">
      <label htmlFor={name} className={required ? "required" : ""}>
        {label}
      </label>
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        aria-invalid={error ? "true" : "false"}
        {...props}
      />
      {error && <span className="error" id={`${name}-error`}>{error}</span>}
    </div>
  );
};

export default FormInput;
