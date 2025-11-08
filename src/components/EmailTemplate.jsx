import React from 'react';
import './EmailTemplate.css';

export const EmailTemplate = ({ email }) => {
  return (
    <div className="email-template">
      <div className="email-header">
        🔒 Zero Waste
      </div>
      <div className="email-content">
        <h2>Restablecer tu contraseña</h2>
        <p>Hola <strong>{email}</strong> 👋</p>
        <p>Has solicitado restablecer tu contraseña en <strong>Zero Waste</strong>.</p>
        <p>Si fuiste tú, haz clic en el siguiente botón para continuar:</p>

        <a href="#preview" className="reset-button">
          Restablecer contraseña
        </a>

        <p className="email-note">
          Si no solicitaste este cambio, puedes ignorar este mensaje.<br/>
          Por motivos de seguridad, este enlace expirará en <strong>5 minutos</strong>.
        </p>
      </div>
      <div className="email-footer">
        © 2025 Zero Waste — Plataforma de recolección segura 🌱
      </div>
    </div>
  );
};
