import React from "react";
import "../styles/Navbar.css"

import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="navbar">
      <Link to="/" className="logo">
        <img src="/src/assets/img/logo.png" alt="Zero Waste Logo" />
      </Link>

       <button className="mobile-menu-btn" id="hamburger">
            <div className="hamburger-line"></div>
            <div className="hamburger-line"></div>
            <div className="hamburger-line"></div>
          </button>
    
      <ul className="nav-links">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/how-it-works">Como Funciona</Link></li>
        <li><Link to="/benefits">Beneficios</Link></li>
        <li><Link to="/the-app">La App</Link></li>
        <li><Link to="/testimonials">Testimonios</Link></li>
        <li><Link to="/contact">Contacto</Link></li>
        <li><Link to="/iniciarsesion" className="auth-link">Iniciar sesión</Link></li>
        <li>
          <Link to="/register" className="auth-link">Register</Link>
        </li>

      </ul>
    </nav>
  );
}