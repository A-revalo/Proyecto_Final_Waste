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
  const [user, setUser] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const toggleShowPassword = () => setShowPassword((prev) => !prev);

  // Configuración de bloqueo temporal
  const MAX_ATTEMPTS = 5;
  const LOCK_DURATION_MS = 30 * 1000; // 30 segundos

  const [, setAttempts] = useState(
    () => Number(localStorage.getItem("loginAttempts")) || 0
  );
  const [lockUntil, setLockUntil] = useState(
    () => Number(localStorage.getItem("loginLockUntil")) || 0
  );
  const [remainingLockMs, setRemainingLockMs] = useState(() =>
    Math.max(
      0,
      (Number(localStorage.getItem("loginLockUntil")) || 0) - Date.now()
    )
  );

  const isLocked = lockUntil && Date.now() < lockUntil;

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, lockUntil - now);
      setRemainingLockMs(remaining);
      if (lockUntil && now >= lockUntil) {
        setAttempts(0);
        setLockUntil(0);
        localStorage.removeItem("loginAttempts");
        localStorage.removeItem("loginLockUntil");
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [lockUntil]);

  const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);
  const validatePassword = (password) =>
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+{}:$;<>,.?~/-]).{8,}$/.test(
      password
    );

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    setEmailError(!isEmailValid);
    setPasswordError(!isPasswordValid);

    if (!isEmailValid || !isPasswordValid) {
      setLoginMessage("Por favor corrige los errores antes de continuar.");
      return;
    }

    if (isLocked) {
      const secondsLeft = Math.ceil(remainingLockMs / 1000);
      setLoginMessage(
        `Tu cuenta está bloqueada temporalmente. Intenta de nuevo en ${secondsLeft} segundos.`
      );
      return;
    }

    try {
      const res = await axios.post("http://localhost:3001/login", {
        email,
        password,
      });

      if (res.data.success) {
        const loggedUser = res.data.user;
        setUser(loggedUser);
        setLoginMessage("");

        // Redirigir según el rol
        switch (loggedUser.rol) {
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
            alert("✅ Login exitoso, pero no se reconoce el rol del usuario.");
        }
      } else {
        setAttempts((prev) => {
          const newAttempts = prev + 1;
          localStorage.setItem("loginAttempts", newAttempts);
          if (newAttempts >= MAX_ATTEMPTS) {
            const lockTime = Date.now() + LOCK_DURATION_MS;
            setLockUntil(lockTime);
            localStorage.setItem("loginLockUntil", lockTime);
            setTimeout(() => {
              setAttempts(0);
              setLockUntil(0);
              localStorage.removeItem("loginAttempts");
              localStorage.removeItem("loginLockUntil");
            }, LOCK_DURATION_MS);
            return newAttempts;
          }
          return newAttempts;
        });
        setLoginMessage("❌ Credenciales incorrectas");
      }
    } catch (error) {
      console.error(error);
      setLoginMessage("⚠️ Error conectando con el servidor.");
    }
  };

  return (
    <div className="container">
      <div id="loginForm" className="form-container">
        {/* Header */}
        <div className="form-header">
          <h1>Bienvenido</h1>
          <p>Inicia sesión en tu cuenta</p>
        </div>

        {/* Mostrar mensaje de error o bloqueo */}
        {isLocked ? (
          <div className="lockout-warning">
            <p style={{ fontWeight: 600, marginBottom: "8px" }}>
              Cuenta bloqueada temporalmente
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
            <div id="loginMessage" className="error-message">
              {loginMessage}
            </div>
          )
        )}

        {/* Si el usuario está logueado, mostrar sus datos */}
        {user ? (
          <div className="success-message">
            <h2 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "10px" }}>
              Datos del usuario
            </h2>
            <p>
              <strong>Nombre:</strong> {user.nombre}
            </p>
            <p>
              <strong>Correo:</strong> {user.email}
            </p>
            <p>
              <strong>Rol:</strong> {user.rol}
            </p>
          </div>
        ) : (
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
              />
              {emailError && (
                <span className="error">Ingresa un correo válido</span>
              )}
            </div>

            {/* Contraseña con botón DENTRO del input */}
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
                />
                <button
                  type="button"
                  className="toggle-password"
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  onClick={toggleShowPassword}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
              {passwordError && (
                <span className="error">
                  La contraseña no cumple con los requisitos
                </span>
              )}
            </div>

            {/* Botón de submit */}
            <button
              type="submit"
              className="btn btn-primary"
              id="loginBtn"
            >
              Iniciar Sesión
            </button>
          </form>
        )}

        {/* Footer */}
        {!user && (
          <div className="form-footer">
            <Link to="/register" aria-label="Registrarse">
              ¿No tienes cuenta? Regístrate
            </Link>
            <Link to="/ForgotPassword" aria-label="Restablecer contraseña">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default LoginApp;