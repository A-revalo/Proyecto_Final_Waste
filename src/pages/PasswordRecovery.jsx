import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import emailjs from '@emailjs/browser';
import '../styles/PasswordRecovery.css';

function PasswordRecovery() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = async () => {
    setError('');

    if (!email) {
      setError('⚠ El correo electrónico es requerido');
      return;
    }

    if (!validateEmail(email)) {
      setError('⚠ Por favor ingresa un correo electrónico válido');
      return;
    }

    setLoading(true);

    try {
      // Reemplaza estos valores con los de tu cuenta de EmailJS
      const serviceId = 'ZeroWaste'; // Por ejemplo: 'service_abc123'
      const templateId = 'Zero_Waste1'; // Por ejemplo: 'template_xyz789'
      const publicKey = 'VQqu9FaIjwqHyV8tH'; // Por ejemplo: 'HJ7d_kLM9n0pQrsT'
      
        // Generar un token más seguro
        const resetToken = Array.from(crypto.getRandomValues(new Uint8Array(32)))
          .map(b => b.toString(16).padStart(2, "0"))
          .join("");

        // Construir la URL absoluta apuntando al componente de restablecimiento
        const baseUrl = window.location.origin;
        const resetUrl = `${baseUrl}/restablecer-password/${resetToken}`;

        // Log para depuración: muestra la URL que se enviará en el email
        // Abre la consola del navegador y envía un email de prueba para verificar
        // que la URL use tu entorno local (ej. http://localhost:3000) y no zerowaste.com
        console.log('🔗 URL que se enviará en el email:', resetUrl);

      const templateParams = {
        from_email: email,
        reset_url: resetUrl,
        to_email: email
      };

      await emailjs.send(serviceId, templateId, templateParams, publicKey);
      setSuccess(true);
    } catch (error) {
      console.error('Error al enviar el correo:', error);
      setError('❌ Error al enviar el correo. Por favor intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="recovery-wrapper">
      <div className="container">
        <div className="recovery-icon">🔒</div>
        
        <h1>Recuperar Contraseña</h1>
        <p className="subtitle">
          Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña
        </p>

        {success ? (
          <>
            <div className="success-message">
              <div className="success-icon">✓</div>
              <div className="success-title">¡Correo Enviado!</div>
              <div className="success-text">
                Revisa tu bandeja de entrada para restablecer tu contraseña
              </div>
            </div>
            <button 
              className="map-button private"
              onClick={() => setSuccess(false)}
            >
              <span className="icon">←</span>
              Enviar otro correo
            </button>
          </>
        ) : (
          <>
            <div className="input-group">
              <label className="input-label" htmlFor="email">
                Correo Electrónico
              </label>
              <input
                type="email"
                id="email"
                className={`input-field ${error ? 'has-error' : ''}`}
                placeholder="ejemplo@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              {error && (
                <div className="error-text">{error}</div>
              )}
            </div>

            <button 
              className="map-button"
              disabled={loading}
              onClick={handleSubmit}
            >
              <span className="icon">📧</span>
              {loading ? 'Enviando...' : 'Enviar Enlace de Recuperación'}
            </button>

            <button 
              className="map-button private"
              onClick={() => navigate('/iniciarsesion')}
            >
              <span className="icon">←</span>
              Volver al Inicio de Sesión
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default PasswordRecovery;