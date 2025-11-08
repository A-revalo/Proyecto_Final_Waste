import React, { useState, useEffect } from "react";
import DOMPurify from "isomorphic-dompurify";  // Cambiar a isomorphic-dompurify
import useForm from "../hooks/useForm";
import "../styles/styles.css";
import FormInput from "../components/FormInput";
import FormSelect from "../components/FormSelect";
import { DOCUMENT_TYPES, LOCALIDADES } from "../constants/constants";

function Register() {
  const initialState = {
    firstName: "",
    lastName: "",
    registerEmail: "",
    confirmEmail: "",
    documentType: "",
    documentNumber: "",
    phone: "",
    address: "",
    populationType: "",
    localidad: "",
    password: "",
    confirmPassword: "",
  };

  const { formData, setFormData, errors, setErrors, resetForm } = useForm(initialState);

  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ level: "", color: "" });

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePassword = (password) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password);

  const getPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[@$!%*?&]/.test(password)) strength++;

    if (strength < 3) return { level: "Débil", color: "red" };
    if (strength < 5) return { level: "Media", color: "orange" };
    return { level: "Fuerte", color: "green" };
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    let fieldError = "";
    if ((name === "registerEmail" || name === "confirmEmail") && value && !validateEmail(value)) {
      fieldError = "Email inválido";
    }
    if (name === "documentNumber" && value && !/^\d+$/.test(value)) {
      fieldError = "Solo números";
    }
    if (name === "phone" && value && !/^\d{10}$/.test(value)) {
      fieldError = "Teléfono debe tener 10 dígitos";
    }
    if (name === "password") {
      setPasswordStrength(getPasswordStrength(value));
      if (value && !validatePassword(value)) {
        fieldError = "Contraseña débil (8+, mayúscula, número y símbolo)";
      }
    }

    // coincidencias en tiempo real
    if (name === "registerEmail" && formData.confirmEmail && value !== formData.confirmEmail) {
      setErrors((s) => ({ ...s, confirmEmail: "Los correos no coinciden" }));
    } else if (name === "confirmEmail" && formData.registerEmail && value !== formData.registerEmail) {
      setErrors((s) => ({ ...s, confirmEmail: "Los correos no coinciden" }));
    } else {
      setErrors((s) => ({ ...s, confirmEmail: "" }));
    }

    if (name === "password" && formData.confirmPassword && value !== formData.confirmPassword) {
      setErrors((s) => ({ ...s, confirmPassword: "Las contraseñas no coinciden" }));
    } else if (name === "confirmPassword" && formData.password && value !== formData.password) {
      setErrors((s) => ({ ...s, confirmPassword: "Las contraseñas no coinciden" }));
    } else {
      setErrors((s) => ({ ...s, confirmPassword: "" }));
    }

    setErrors((prev) => ({ ...prev, [name]: fieldError }));
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setMessage("");
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.registerEmail !== formData.confirmEmail) {
      setMessage("❌ Los correos electrónicos no coinciden");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setMessage("❌ Las contraseñas no coinciden");
      return;
    }
    if (!validatePassword(formData.password)) {
      setMessage("❌ La contraseña no cumple requisitos");
      return;
    }
    if (!validateEmail(formData.registerEmail)) {
      setMessage("❌ Email inválido");
      return;
    }

    const sanitizedData = {
      firstName: DOMPurify.sanitize(formData.firstName),
      lastName: DOMPurify.sanitize(formData.lastName),
      registerEmail: DOMPurify.sanitize(formData.registerEmail),
      confirmEmail: DOMPurify.sanitize(formData.confirmEmail),
      documentType: DOMPurify.sanitize(formData.documentType),
      documentNumber: DOMPurify.sanitize(formData.documentNumber),
      phone: DOMPurify.sanitize(formData.phone),
      address: DOMPurify.sanitize(formData.address),
      populationType: DOMPurify.sanitize(formData.populationType),
      localidad: DOMPurify.sanitize(formData.localidad),
      password: DOMPurify.sanitize(formData.password),
    };

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sanitizedData),
      });

      const data = await res.json();
      if (data.success) {
        setMessage("✅ Registro exitoso");
        resetForm();
        setPasswordStrength({ level: "", color: "" });
      } else {
        setMessage("⚠️ Error: " + (data.error || "Servidor"));
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage("⚠️ Error conectando con el servidor.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      <div id="registerForm" className="form-container">
        <div className="form-header">
          <h1>Regístrate</h1>
        </div>

        {message && <div id="registerMessage" role="status">{message}</div>}

        <form id="registerFormElement" onSubmit={handleSubmit}>
          <div className="form-row">
            <FormInput label="Nombre" name="firstName" value={formData.firstName} onChange={handleChange} required autoComplete="given-name" />
            <FormInput label="Apellido" name="lastName" value={formData.lastName} onChange={handleChange} required autoComplete="family-name" />
          </div>

          <div className="form-row">
            <FormInput label="Correo electrónico" name="registerEmail" type="email" value={formData.registerEmail} onChange={handleChange} required autoComplete="email" placeholder="ejemplo@correo.com" error={errors.registerEmail} />
            <FormInput label="Confirmar correo electrónico" name="confirmEmail" type="email" value={formData.confirmEmail} onChange={handleChange} required autoComplete="email" placeholder="confirma tu correo" error={errors.confirmEmail} />
          </div>

          <div className="form-row">
            <FormSelect label="Tipo de documento" name="documentType" value={formData.documentType} onChange={handleChange} options={DOCUMENT_TYPES} required />
            <FormInput label="Número de documento" name="documentNumber" value={formData.documentNumber} onChange={handleChange} required error={errors.documentNumber} />
          </div>

          <div className="form-row">
            <FormInput label="Teléfono" name="phone" type="tel" value={formData.phone} onChange={handleChange} required placeholder="Ej: 3001234567" autoComplete="tel" />
            <FormInput label="Dirección" name="address" value={formData.address} onChange={handleChange} required placeholder="Ej: Calle 123 # 45-67" autoComplete="street-address" />
          </div>

          <div className="form-row">
            <FormSelect label="Caracterización de población" name="populationType" value={formData.populationType} onChange={handleChange} options={[
              { value: "indigena", label: "Indígena" },
              { value: "Afrodescendiente", label: "Afrodescendiente" },
              { value: "Discapacitado", label: "Discapacitado" },
              { value: "Desplazado", label: "Desplazado" },
              { value: "discapacidad", label: "Persona con discapacidad" },
              { value: "Ninguna", label: "Ninguna" },
            ]} required />
            <FormSelect label="Elija localidad" name="localidad" value={formData.localidad} onChange={handleChange} options={LOCALIDADES} required />
          </div>

          {/* Contraseña con botón DENTRO del input */}
          <div className="form-row">
            <div className="form-column">
              <label htmlFor="registerPassword" className="required">Contraseña</label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  id="registerPassword"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength="8"
                  autoComplete="new-password"
                  aria-required="true"
                  aria-invalid={errors.password ? "true" : "false"}
                  aria-describedby="password-hint password-strength"
                />
                <button 
                  type="button" 
                  className="toggle-password" 
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"} 
                  onClick={() => setShowPassword((s) => !s)}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
              <small id="password-hint" className="password-hint">
                Mínimo 8 caracteres, incluir mayúscula, número y símbolo.
              </small>

              {passwordStrength.level && (
                <div id="password-strength" className="strength-meter" aria-live="polite">
                  <div className="strength-bar" style={{ backgroundColor: passwordStrength.color }} />
                  <span className="strength-text">{passwordStrength.level}</span>
                </div>
              )}
              {errors.password && <span className="error">{errors.password}</span>}
            </div>
          </div>

          {/* Confirmar contraseña SIN botón de mostrar/ocultar */}
          <div className="form-row">
            <FormInput
              label="Confirmar contraseña"
              name="confirmPassword"
              type={showPassword ? "text" : "password"}
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              autoComplete="new-password"
              error={errors.confirmPassword}
            />
          </div>

          {/* Botón */}
          <button type="submit" className="btn btn-primary" id="registerBtn" disabled={isLoading}>
            {isLoading ? "Registrando..." : "Crear Cuenta"}
          </button>
        </form>

        <div className="form-footer">
          <a href="/login">¿Ya tienes cuenta? Inicia sesión</a>
        </div>
      </div>
    </div>
  );
}

export default Register;