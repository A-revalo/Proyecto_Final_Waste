import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "../styles/styles.css";

function LoginApp() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [loginMessage, setLoginMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const toggleShowPassword = () => setShowPassword((prev) => !prev);

  // Configuración de bloqueo temporal
  const MAX_ATTEMPTS = 5;
  const LOCK_DURATION_MS = 30 * 1000; // 30 segundos

  const [attempts, setAttempts] = useState(
    () => Number(sessionStorage.getItem("loginAttempts")) || 0
  );
  const [lockUntil, setLockUntil] = useState(
    () => Number(sessionStorage.getItem("loginLockUntil")) || 0
  );
  const [remainingLockMs, setRemainingLockMs] = useState(() =>
    Math.max(
      0,
      (Number(sessionStorage.getItem("loginLockUntil")) || 0) - Date.now()
    )
  );

  const isLocked = lockUntil && Date.now() < lockUntil;

  // Verificar si ya hay sesión activa
  useEffect(() => {
    const userId = localStorage.getItem('userId');
    const userRole = localStorage.getItem('userRole');
    
    if (userId && userRole) {
      // Ya hay sesión activa, redirigir según el rol
      switch (userRole) {
        case "ciudadano":
          navigate("/ciudadano");
          break;
        case "admin":
          navigate("/admin");
          break;
        case "conductor":
          navigate("/conductor");
          break;
        default:
          break;
      }
    }
  }, [navigate]);

  // Temporizador de bloqueo
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, lockUntil - now);
      setRemainingLockMs(remaining);
      if (lockUntil && now >= lockUntil) {
        setAttempts(0);
        setLockUntil(0);
        sessionStorage.removeItem("loginAttempts");
        sessionStorage.removeItem("loginLockUntil");
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [lockUntil]);

  const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);
  const validatePassword = (password) => password.length >= 8;

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    setEmailError(!isEmailValid);
    setPasswordError(!isPasswordValid);

    if (!isEmailValid) {
      setLoginMessage("❌ Por favor ingresa un correo válido");
      return;
    }
    
    if (!isPasswordValid) {
      setLoginMessage("❌ La contraseña debe tener al menos 8 caracteres");
      return;
    }

    if (isLocked) {
      const secondsLeft = Math.ceil(remainingLockMs / 1000);
      setLoginMessage(
        `Tu cuenta está bloqueada temporalmente. Intenta de nuevo en ${secondsLeft} segundos.`
      );
      return;
    }

    setIsLoading(true);
    setLoginMessage("");

    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
      
      console.log("🔄 Intentando login con:", email.trim());
      
      const res = await axios.post(`${API_URL}/login`, {
        email: email.trim(),
        password,
      });

      console.log("📥 Respuesta del servidor:", res.data);

      if (res.data.success) {
        const loggedUser = res.data.user;
        
        console.log("✅ Login exitoso:", loggedUser);
        console.log("👤 Rol del usuario:", loggedUser.rol);
        
        // Guardar datos del usuario en localStorage
        localStorage.setItem('userId', loggedUser.id_usuario);
        localStorage.setItem('userEmail', loggedUser.email);
        localStorage.setItem('userRole', loggedUser.rol);
        
        // Guardar datos adicionales según el rol
        if (loggedUser.nombre) {
          localStorage.setItem('userName', `${loggedUser.nombre} ${loggedUser.apellido || ''}`);
        }
        
        if (loggedUser.id_Ciudadano) {
          localStorage.setItem('ciudadanoId', loggedUser.id_Ciudadano);
        }
        
        // Limpiar intentos de login
        setAttempts(0);
        setLockUntil(0);
        sessionStorage.removeItem("loginAttempts");
        sessionStorage.removeItem("loginLockUntil");
        
        setLoginMessage("✅ Inicio de sesión exitoso. Redirigiendo...");

        // Redirigir según el rol
        setTimeout(() => {
          console.log("🔄 Redirigiendo a:", loggedUser.rol);
          
          switch (loggedUser.rol) {
            case "ciudadano":
              navigate("/ciudadano", { replace: true });
              break;
            case "admin":
              navigate("/admin", { replace: true });
              break;
            case "conductor":
              navigate("/conductor", { replace: true });
              break;
            default:
              console.error("⚠️ Rol no reconocido:", loggedUser.rol);
              setLoginMessage("⚠️ Rol de usuario no reconocido");
              setIsLoading(false);
          }
        }, 1000);
      } else {
        console.error("⚠️ Login fallido - success: false");
        setLoginMessage("❌ Credenciales incorrectas");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("❌ Error en login:", error);
      
      // Manejar error 401 (credenciales incorrectas)
      if (error.response && error.response.status === 401) {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        sessionStorage.setItem("loginAttempts", newAttempts);
        
        if (newAttempts >= MAX_ATTEMPTS) {
          const lockTime = Date.now() + LOCK_DURATION_MS;
          setLockUntil(lockTime);
          sessionStorage.setItem("loginLockUntil", lockTime);
          setLoginMessage(
            `❌ Demasiados intentos fallidos. Cuenta bloqueada por 30 segundos.`
          );
          
          // Auto-desbloquear después del tiempo
          setTimeout(() => {
            setAttempts(0);
            setLockUntil(0);
            sessionStorage.removeItem("loginAttempts");
            sessionStorage.removeItem("loginLockUntil");
            setRemainingLockMs(0);
          }, LOCK_DURATION_MS);
        } else {
          const remainingAttempts = MAX_ATTEMPTS - newAttempts;
          setLoginMessage(
            `❌ Credenciales incorrectas. Te quedan ${remainingAttempts} intento${remainingAttempts !== 1 ? 's' : ''}.`
          );
        }
      } else if (error.response) {
        // Otros errores del servidor
        console.error("Error del servidor:", error.response.data);
        setLoginMessage(
          `⚠️ ${error.response.data.error || error.response.data.message || "Error en el servidor"}`
        );
      } else if (error.request) {
        // No hubo respuesta del servidor
        console.error("No hay respuesta del servidor");
        setLoginMessage("⚠️ No se pudo conectar con el servidor. Verifica que esté ejecutándose en http://localhost:3001");
      } else {
        // Error al configurar la petición
        console.error("Error de configuración:", error.message);
        setLoginMessage("⚠️ Error al procesar la solicitud.");
      }
      
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      <div id="loginForm" className="form-container">
        {/* Header */}
        <div className="form-header">
          <h1>Bienvenido a Zero Waste</h1>
          <p>Inicia sesión en tu cuenta</p>
        </div>

        {/* Mostrar mensaje de error o bloqueo */}
        {isLocked ? (
          <div className="lockout-warning">
            <p style={{ fontWeight: 600, marginBottom: "8px" }}>
              ⚠️ Cuenta bloqueada temporalmente
            </p>
            <p>
              Intenta de nuevo en:{" "}
              <span style={{ fontWeight: "bold" }}>
                {Math.ceil(remainingLockMs / 1000)}
              </span>{" "}
              segundos
            </p>
          </div>
        ) : (
          loginMessage && (
            <div 
              id="loginMessage" 
              className={loginMessage.includes('✅') ? 'success-message' : 'error-message'}
            >
              {loginMessage}
            </div>
          )
        )}

        <form
          id="loginFormElement"
          onSubmit={handleSubmit}
          style={{ opacity: isLocked ? 0.5 : 1, pointerEvents: isLocked ? "none" : "auto" }}
        >
          {/* Email */}
          <div className="form-group">
            <label htmlFor="loginEmail" className="required">
              Correo electrónico
            </label>
            <input
              type="email"
              id="loginEmail"
              name="email"
              required
              placeholder="ejemplo@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                borderColor: emailError ? "#b00020" : "#000"
              }}
              disabled={isLocked}
            />
            {emailError && (
              <span className="error">Ingresa un correo válido</span>
            )}
          </div>

          {/* Contraseña */}
          <div className="form-group">
            <label htmlFor="loginPassword" className="required">
              Contraseña
            </label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                id="loginPassword"
                name="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  borderColor: passwordError ? "#b00020" : "#000"
                }}
                disabled={isLocked}
              />
              <button
                type="button"
                className="toggle-password"
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                onClick={toggleShowPassword}
                disabled={isLocked}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
            {passwordError && (
              <span className="error">
                Mínimo 8 caracteres
              </span>
            )}
          </div>

          {/* Botón de submit */}
          <button
            type="submit"
            className="btn btn-primary"
            id="loginBtn"
            disabled={isLoading || isLocked}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            {isLoading ? (
              <>
                <span className="spinner"></span>
                Iniciando sesión...
              </>
            ) : (
              "Iniciar Sesión"
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="form-footer">
          <Link to="/register" aria-label="Registrarse">
            ¿No tienes cuenta? Regístrate
          </Link>
          <Link to="/ForgotPassword" aria-label="Restablecer contraseña">
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
      </div>
    </div>
  );
}

export default LoginApp;