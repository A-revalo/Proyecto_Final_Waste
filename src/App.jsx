import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";

// Layout
import Navbar from "./pages/Navbar.jsx";
import Footer from "./pages/Footer.jsx";

// Secciones públicas (Home)
import Hero from "./pages/Hero.jsx";
import HowItWorks from "./pages/HowItWorks.jsx";
import Benefits from "./pages/Benefits.jsx";
import AppPreview from "./pages/AppPreview.jsx";
import Testimonials from "./pages/Testimonials.jsx";
import CTA from "./pages/CTA.jsx";

// Auth
import Register from "./pages/Register.jsx";
import LoginApp from "./pages/LoginApp.jsx";


// Paneles / Rutas privadas
import Admin from "./pages/Admin.jsx";
import VentanaAdmin from "./pages/VentanaAdmin.jsx";
import Conductor from "./pages/Conductor.jsx";
import Ciudadano from "./pages/Ciudadano.jsx";
import VentanaCiudadano from "./pages/VentanaCiudadano.jsx";
import VentanaConductor from "./pages/VentanaConductor.jsx";
import VentanaSelectMap from "./pages/VentanaSelectMap.jsx";
import MapPrincipal from "./pages/MapPrincipal.jsx";
import MapSolicitudes from "./pages/MapSolicitudes.jsx";
import Crud from "./pages/Crud.jsx";
import SolicitarRestablecimiento from "./pages/ForgotPassword.jsx";
import PasswordRecovery from "./pages/PasswordRecovery.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";

// Layout principal que gestiona Navbar y Footer según la ruta
function Layout() {
  const location = useLocation();

  // Rutas donde NO se debe mostrar Navbar/Footer
  const hideNavbarFooterRoutes = [
    "/iniciarsesion",
    "/register",
    "/ForgotPassword",
    "/recuperar-password",
    "/restablecer-password",
    "/admin",
    "/ventana-admin",
    "/crud",
    "/conductor",
    "/ventana-conductor",
    "/ventana-ciudadano",
    "/ciudadano",
    "/map-solicitudes",
    "/MapaPrincipal",
    "/ventana-select-map"
  ];

  const showLayout = !hideNavbarFooterRoutes.includes(location.pathname);

  return (
    <>
      {showLayout && <Navbar />}

      <Routes>
        {/* Landing Page */}
        <Route
          path="/"
          element={
            <>
              <Hero />
              <HowItWorks />
              <Benefits />
              <AppPreview />
              <Testimonials />
              <CTA />
            </>
          }
        />

        {/* Auth */}
        <Route path="/register" element={<Register />} />
        <Route path="/iniciarsesion" element={<LoginApp />} />
        

        {/* Paneles privados / administrativos */}
        <Route path="/MapaPrincipal" element={<MapPrincipal />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/ventana-admin" element={<VentanaAdmin />} />
        <Route path="/conductor" element={<Conductor />} />
        <Route path="/ciudadano" element={<Ciudadano />} />
        <Route path="/ventana-ciudadano" element={<VentanaCiudadano />} />
        <Route path="/ventana-conductor" element={<VentanaConductor />} />
        <Route path="/ventana-select-map" element={<VentanaSelectMap />} />
        <Route path="/map-solicitudes" element={<MapSolicitudes />} />
        <Route path="/crud" element={<Crud />} />
        <Route path="/ForgotPassword" element={<SolicitarRestablecimiento />} />
        <Route path="/recuperar-password" element={<PasswordRecovery />} />
  <Route path="/restablecer-password" element={<ResetPassword />} />
  <Route path="/restablecer-password/:token" element={<ResetPassword />} />
      </Routes>

      {showLayout && <Footer />}
    </>
  );
}

// Componente principal
function App() {
  return (
    <Router>
      <Layout />
    </Router>
  );
}

export default App;
