import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import emailjs from '@emailjs/browser';
import '../styles/ForgotPassword.css';

const SolicitarRestablecimiento = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const validateEmail = (email) => {
        return email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    };

    // Función para generar token aleatorio
    const generateToken = () => {
        return Math.random().toString(36).substring(2, 15) + 
               Math.random().toString(36).substring(2, 15);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateEmail(email)) {
            setMessage({ 
                type: 'error', 
                text: 'Por favor ingresa un correo electrónico válido' 
            });
            return;
        }

        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            // IDs de EmailJS
            const serviceId = 'ZeroWaste';
            const templateId = 'Zero_Waste1';
            const publicKey = 'VQqu9FaIjwqHyV8tH';

            // Generar token único
            const token = generateToken();
            
            // URL de restablecimiento que apunta al componente RestablecerContrasena
            // Cambia la URL base según tu dominio en producción
            const baseUrl = window.location.origin; // En producción será: https://zerowaste.com
            const resetUrl = `${baseUrl}/restablecer-contrasena?token=${token}`;

            // Variables para el template de EmailJS
            const templateParams = {
                from_email: email,
                to_name: email.split('@')[0], // Usa el nombre del email como nombre
                to_email: email,
                reset_url: resetUrl,
                message: `Solicitud de restablecimiento de contraseña del correo: ${email}`
            };

            // Enviar email con EmailJS
            await emailjs.send(serviceId, templateId, templateParams, publicKey);

            // Opcional: Aquí puedes guardar el token en tu base de datos
            // junto con el email y la fecha de expiración (5 minutos)
            /*
            await fetch('https://tu-api.com/api/save-reset-token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    token: token,
                    expiresAt: new Date(Date.now() + 5 * 60 * 1000) // 5 minutos
                })
            });
            */

            setMessage({ 
                type: 'success', 
                text: 'Si existe una cuenta asociada a este correo, recibirás las instrucciones para restablecer tu contraseña.' 
            });
            setEmail('');
        } catch (error) {
            console.error('Error enviando email:', error);
            setMessage({ 
                type: 'error', 
                text: 'Ha ocurrido un error al enviar el correo. Por favor intenta nuevamente más tarde.' 
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="forgot-password-container">
            <div className="fp-card">
                <h2>Recuperar Contraseña</h2>
                <p>
                    Ingresa tu correo electrónico y te enviaremos las instrucciones para restablecer tu contraseña.
                </p>

                <form onSubmit={handleSubmit}>
                    <div className="mb-6">
                        <label htmlFor="email">
                            Correo Electrónico
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="ejemplo@correo.com"
                            disabled={loading}
                            required
                        />
                    </div>

                    {message.text && (
                        <div 
                            className={message.type === 'success' ? 'bg-green-100' : 'bg-red-100'}
                            style={{
                                padding: '12px',
                                borderRadius: '6px',
                                marginBottom: '16px',
                                backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da',
                                color: message.type === 'success' ? '#155724' : '#721c24',
                                border: `1px solid ${message.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`
                            }}
                        >
                            {message.text}
                        </div>
                    )}

                    <button 
                        type="submit" 
                        disabled={loading}
                    >
                        {loading ? 'Enviando...' : 'Enviar Instrucciones'}
                    </button>

                    <div className="text-center mt-4">
                        <Link to="/iniciarsesion">
                            ← Volver al inicio de sesión
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SolicitarRestablecimiento;