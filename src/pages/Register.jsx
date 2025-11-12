import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import DOMPurify from "isomorphic-dompurify";
import useForm from "../hooks/useForm";
import "../styles/styles.css";
import FormInput from "../components/FormInput";
import FormSelect from "../components/FormSelect";
import { DOCUMENT_TYPES, LOCALIDADES } from "../constants/constants";

function Register() {
  const navigate = useNavigate();
  
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

    if (strength < 3) return { level: "Débil", color: "#ef4444" };
    if (strength < 5) return { level: "Media", color: "#f97316" };
    return { level: "Fuerte", color: "#22c55e" };
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    let fieldError = "";
    
    // Validaciones específicas por campo
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

    // Validación de coincidencia de emails en tiempo real
    if (name === "registerEmail" && formData.confirmEmail && value !== formData.confirmEmail) {
      setErrors((s) => ({ ...s, confirmEmail: "Los correos no coinciden" }));
    } else if (name === "confirmEmail" && formData.registerEmail && value !== formData.registerEmail) {
      setErrors((s) => ({ ...s, confirmEmail: "Los correos no coinciden" }));
    } else if (name === "registerEmail" || name === "confirmEmail") {
      setErrors((s) => ({ ...s, confirmEmail: "" }));
    }

    // Validación de coincidencia de contraseñas en tiempo real
    if (name === "password" && formData.confirmPassword && value !== formData.confirmPassword) {
      setErrors((s) => ({ ...s, confirmPassword: "Las contraseñas no coinciden" }));
    } else if (name === "confirmPassword" && formData.password && value !== formData.password) {
      setErrors((s) => ({ ...s, confirmPassword: "Las contraseñas no coinciden" }));
    } else if (name === "password" || name === "confirmPassword") {
      setErrors((s) => ({ ...s, confirmPassword: "" }));
    }

    setErrors((prev) => ({ ...prev, [name]: fieldError }));
  };

  // Prevenir copiar/pegar en campos de confirmación
  const handlePreventCopyPaste = (e) => {
    e.preventDefault();
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

    // Limpiar errores previos
    setMessage("");
    let hasErrors = false;
    const newErrors = {};

    // Validar todos los campos obligatorios
    if (!formData.firstName.trim()) {
      newErrors.firstName = "El nombre es obligatorio";
      hasErrors = true;
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = "El apellido es obligatorio";
      hasErrors = true;
    }
    if (!formData.registerEmail.trim()) {
      newErrors.registerEmail = "El correo es obligatorio";
      hasErrors = true;
    } else if (!validateEmail(formData.registerEmail)) {
      newErrors.registerEmail = "Email inválido";
      hasErrors = true;
    }
    if (!formData.confirmEmail.trim()) {
      newErrors.confirmEmail = "Debes confirmar el correo";
      hasErrors = true;
    } else if (formData.registerEmail !== formData.confirmEmail) {
      newErrors.confirmEmail = "Los correos no coinciden";
      hasErrors = true;
    }
    if (!formData.documentType) {
      newErrors.documentType = "Selecciona un tipo de documento";
      hasErrors = true;
    }
    if (!formData.documentNumber.trim()) {
      newErrors.documentNumber = "El número de documento es obligatorio";
      hasErrors = true;
    } else if (!/^\d+$/.test(formData.documentNumber)) {
      newErrors.documentNumber = "Solo números";
      hasErrors = true;
    }
    if (!formData.phone.trim()) {
      newErrors.phone = "El teléfono es obligatorio";
      hasErrors = true;
    } else if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = "El teléfono debe tener 10 dígitos";
      hasErrors = true;
    }
    if (!formData.address.trim()) {
      newErrors.address = "La dirección es obligatoria";
      hasErrors = true;
    }
    if (!formData.populationType) {
      newErrors.populationType = "Selecciona una caracterización";
      hasErrors = true;
    }
    if (!formData.localidad) {
      newErrors.localidad = "Selecciona una localidad";
      hasErrors = true;
    }
    if (!formData.password) {
      newErrors.password = "La contraseña es obligatoria";
      hasErrors = true;
    } else if (!validatePassword(formData.password)) {
      newErrors.password = "La contraseña debe tener mínimo 8 caracteres, incluir mayúscula, número y símbolo";
      hasErrors = true;
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Debes confirmar la contraseña";
      hasErrors = true;
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden";
      hasErrors = true;
    }

    // Si hay errores, mostrarlos y hacer scroll al primer error
    if (hasErrors) {
      setErrors(newErrors);
      setMessage("❌ Por favor corrige los errores del formulario");
      
      // Scroll al primer campo con error
      const firstErrorField = Object.keys(newErrors)[0];
      const element = document.getElementById(
        firstErrorField === "registerEmail" ? "registerEmail" :
        firstErrorField === "confirmEmail" ? "confirmEmail" :
        firstErrorField === "documentType" ? "documentType" :
        firstErrorField === "documentNumber" ? "documentNumber" :
        firstErrorField === "phone" ? "phone" :
        firstErrorField === "address" ? "address" :
        firstErrorField === "populationType" ? "populationType" :
        firstErrorField === "localidad" ? "localidad" :
        firstErrorField === "password" ? "registerPassword" :
        firstErrorField === "confirmPassword" ? "confirmPassword" :
        firstErrorField
      );
      
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        element.focus();
      }
      return;
    }

    // Preparar datos sanitizados
    const sanitizedData = {
      firstName: DOMPurify.sanitize(formData.firstName.trim()),
      lastName: DOMPurify.sanitize(formData.lastName.trim()),
      registerEmail: DOMPurify.sanitize(formData.registerEmail.trim().toLowerCase()),
      documentType: DOMPurify.sanitize(formData.documentType),
      documentNumber: DOMPurify.sanitize(formData.documentNumber.trim()),
      phone: DOMPurify.sanitize(formData.phone.trim()),
      address: DOMPurify.sanitize(formData.address.trim()),
      populationType: DOMPurify.sanitize(formData.populationType),
      localidad: DOMPurify.sanitize(formData.localidad),
      password: formData.password, // No sanitizar (bcrypt lo manejará)
    };

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

    setIsLoading(true);
    setMessage("");

    try {
      const res = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sanitizedData),
      });

      const data = await res.json();
      
      if (res.ok && data.success) {
        setMessage("✅ Registro exitoso. Redirigiendo al inicio de sesión...");
        resetForm();
        setPasswordStrength({ level: "", color: "" });
        
        // Redirigir al login después de 2 segundos
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        // Mostrar error específico del servidor
        setMessage("⚠️ " + (data.error || data.message || "Error en el servidor"));
      }
    } catch (error) {
      console.error("Error de conexión:", error);
      setMessage("⚠️ Error conectando con el servidor. Verifica que el backend esté ejecutándose en el puerto 3001.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      <div id="registerForm" className="form-container">
        <div className="form-header">
          <h1>Regístrate en Zero Waste</h1>
          <p>Completa el formulario para crear tu cuenta</p>
        </div>

        {message && (
          <div 
            id="registerMessage" 
            role="status" 
            className={message.includes("✅") ? "success-message" : "error-message"}
            aria-live="polite"
          >
            {message}
          </div>
        )}

        <form id="registerFormElement" onSubmit={handleSubmit} noValidate>
          {/* Nombre y Apellido */}
          <div className="form-row">
            <FormInput 
              label="Nombre" 
              name="firstName" 
              value={formData.firstName} 
              onChange={handleChange} 
              required 
              autoComplete="given-name"
              placeholder="Ingresa tu nombre"
              error={errors.firstName}
              id="firstName"
            />
            <FormInput 
              label="Apellido" 
              name="lastName" 
              value={formData.lastName} 
              onChange={handleChange} 
              required 
              autoComplete="family-name"
              placeholder="Ingresa tu apellido"
              error={errors.lastName}
              id="lastName"
            />
          </div>

          {/* Email y Confirmación */}
          <div className="form-row">
            <FormInput 
              label="Correo electrónico" 
              name="registerEmail" 
              type="email" 
              value={formData.registerEmail} 
              onChange={handleChange} 
              required 
              autoComplete="email" 
              placeholder="ejemplo@correo.com" 
              error={errors.registerEmail}
              id="registerEmail"
            />
            
            <div className="form-column">
              <label htmlFor="confirmEmail" className="required">
                Confirmar correo electrónico
              </label>
              <input
                type="email"
                id="confirmEmail"
                name="confirmEmail"
                value={formData.confirmEmail}
                onChange={handleChange}
                onCopy={handlePreventCopyPaste}
                onPaste={handlePreventCopyPaste}
                onCut={handlePreventCopyPaste}
                required
                autoComplete="off"
                placeholder="Confirma tu correo"
                aria-required="true"
                aria-invalid={errors.confirmEmail ? "true" : "false"}
              />
              {errors.confirmEmail && (
                <span className="error" role="alert">{errors.confirmEmail}</span>
              )}
            </div>
          </div>

          {/* Tipo y Número de Documento */}
          <div className="form-row">
            <FormSelect 
              label="Tipo de documento" 
              name="documentType" 
              value={formData.documentType} 
              onChange={handleChange} 
              options={DOCUMENT_TYPES} 
              required
              error={errors.documentType}
              id="documentType"
            />
            <FormInput 
              label="Número de documento" 
              name="documentNumber" 
              value={formData.documentNumber} 
              onChange={handleChange} 
              required 
              placeholder="Ej: 1234567890"
              error={errors.documentNumber}
              id="documentNumber"
            />
          </div>

          {/* Teléfono y Dirección */}
          <div className="form-row">
            <FormInput 
              label="Teléfono" 
              name="phone" 
              type="tel" 
              value={formData.phone} 
              onChange={handleChange} 
              required 
              placeholder="Ej: 3001234567" 
              autoComplete="tel"
              error={errors.phone}
              id="phone"
            />
            <FormInput 
              label="Dirección" 
              name="address" 
              value={formData.address} 
              onChange={handleChange} 
              required 
              placeholder="Ej: Calle 123 # 45-67" 
              autoComplete="street-address"
              error={errors.address}
              id="address"
            />
          </div>

          {/* Caracterización y Localidad */}
          <div className="form-row">
            <FormSelect 
              label="Caracterización de población" 
              name="populationType" 
              value={formData.populationType} 
              onChange={handleChange} 
              options={[
                { value: "Indígena", label: "Indígena" },
                { value: "Afrodescendiente", label: "Afrodescendiente" },
                { value: "Persona con discapacidad", label: "Persona con discapacidad" },
                { value: "Desplazado", label: "Desplazado" },
                { value: "Víctima del conflicto", label: "Víctima del conflicto" },
                { value: "Ninguna", label: "Ninguna" },
              ]} 
              required
              error={errors.populationType}
              id="populationType"
            />
            <FormSelect 
              label="Localidad de Bogotá" 
              name="localidad" 
              value={formData.localidad} 
              onChange={handleChange} 
              options={LOCALIDADES} 
              required
              error={errors.localidad}
              id="localidad"
            />
          </div>

          {/* Contraseña */}
          <div className="form-row">
            <div className="form-column">
              <label htmlFor="registerPassword" className="required">
                Contraseña
              </label>
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
                  placeholder="Crea una contraseña segura"
                  aria-required="true"
                  aria-invalid={errors.password ? "true" : "false"}
                  aria-describedby="password-hint password-strength"
                />
                <button 
                  type="button" 
                  className="toggle-password" 
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"} 
                  onClick={() => setShowPassword((s) => !s)}
                  tabIndex="-1"
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
              <small id="password-hint" className="password-hint">
                Mínimo 8 caracteres, incluir mayúscula, minúscula, número y símbolo (@$!%*?&).
              </small>

              {passwordStrength.level && (
                <div id="password-strength" className="strength-meter" aria-live="polite">
                  <div 
                    className="strength-bar" 
                    style={{ 
                      width: passwordStrength.level === "Débil" ? "33%" : 
                             passwordStrength.level === "Media" ? "66%" : "100%",
                      backgroundColor: passwordStrength.color,
                      transition: "all 0.3s ease"
                    }} 
                  />
                  <span className="strength-text" style={{ color: passwordStrength.color }}>
                    {passwordStrength.level}
                  </span>
                </div>
              )}
              {errors.password && (
                <span className="error" role="alert">{errors.password}</span>
              )}
            </div>
          </div>

          {/* Confirmar Contraseña */}
          <div className="form-row">
            <div className="form-column">
              <label htmlFor="confirmPassword" className="required">
                Confirmar contraseña
              </label>
              <input
                type={showPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                onCopy={handlePreventCopyPaste}
                onPaste={handlePreventCopyPaste}
                onCut={handlePreventCopyPaste}
                required
                autoComplete="new-password"
                placeholder="Repite tu contraseña"
                aria-required="true"
                aria-invalid={errors.confirmPassword ? "true" : "false"}
              />
              {errors.confirmPassword && (
                <span className="error" role="alert">{errors.confirmPassword}</span>
              )}
            </div>
          </div>

          {/* Botón de Registro */}
          <button 
            type="submit" 
            className="btn btn-primary" 
            id="registerBtn" 
            disabled={isLoading}
            aria-busy={isLoading}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            {isLoading ? (
              <>
                <span className="spinner"></span>
                Registrando...
              </>
            ) : (
              "Crear Cuenta"
            )}
          </button>
        </form>

        <div className="form-footer">
          <p>
            ¿Ya tienes cuenta? <Link to="/login">Inicia sesión aquí</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;