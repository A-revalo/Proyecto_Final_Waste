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

            // Token simulado y URL de restablecimiento
            const tokenSimulado = 'XYZ123';
            const resetUrl = `https://zerowaste.com/reset-password?token=${tokenSimulado}`;

            // Variables para el template de EmailJS
            const templateParams = {
                from_email: email,
                to_name: 'Soporte de Tu App',
                to_email: email,
                reset_url: resetUrl,
                message: `Solicitud de restablecimiento de contraseña del correo: ${email}`
            };

            await emailjs.send(serviceId, templateId, templateParams, publicKey);

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
                        <div className={message.type === 'success' ? 'bg-green-100' : 'bg-red-100'}>
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
