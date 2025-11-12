import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, Mail, Phone, MapPin, Calendar, Edit2, Save, X, 
  LogOut, Home, FileText, Bell, MessageSquare, BookOpen,
  Map, Plus, CheckCircle, Clock, AlertCircle, Trash2, Zap, Info
} from 'lucide-react';
import '../styles/ciudadano.css';

const Ciudadano = () => {
  const navigate = useNavigate();
  const [pestanaActiva, setPestanaActiva] = useState('perfil');
  const [editando, setEditando] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState('');

  // Estado del usuario desde la BD
  const [usuario, setUsuario] = useState(null);
  const [formData, setFormData] = useState({});
  const [solicitudes, setSolicitudes] = useState([]);
  
  // Obtener ID del usuario desde localStorage (guardado al hacer login)
  const userId = localStorage.getItem('userId') || '1'; // Por defecto 1 para testing

  // Notificaciones de ejemplo (estas podrían venir de la BD también)
  const [notificaciones] = useState([
    { id: 1, tipo: 'Alerta', mensaje: 'Tu solicitud ha cambiado a **"En Progreso"**.', fecha: '2025-11-06T12:00:00', leida: false, icon: Clock, color: 'yellow' },
    { id: 2, tipo: 'Información', mensaje: 'El camión de reciclaje estará en tu sector mañana a las 8:00 AM.', fecha: '2025-11-05T18:30:00', leida: false, icon: Info, color: 'blue' },
    { id: 3, tipo: 'Éxito', mensaje: 'Tu solicitud ha sido **Completada**.', fecha: '2025-10-01T15:00:00', leida: true, icon: CheckCircle, color: 'green' },
  ]);

  const [posicionCamion] = useState({ lat: 4.6097, lng: -74.0817 });

  // Cargar datos del ciudadano al montar el componente
  useEffect(() => {
    cargarDatosCiudadano();
  }, []);

  const cargarDatosCiudadano = async () => {
    setLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
      const res = await fetch(`${API_URL}/ciudadano/${userId}`);
      const data = await res.json();

      if (data.success) {
        setUsuario(data.ciudadano);
        setFormData(data.ciudadano);
        setSolicitudes(data.solicitudes || []);
        console.log('✅ Datos del ciudadano cargados:', data.ciudadano);
      } else {
        setMensaje('⚠️ Error al cargar los datos del usuario');
        console.error('Error:', data.error);
      }
    } catch (error) {
      console.error('❌ Error conectando con el servidor:', error);
      setMensaje('⚠️ No se pudo conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleEdit = () => {
    setFormData(usuario); 
    setEditando(true);
  };

  const handleSave = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
      const res = await fetch(`${API_URL}/ciudadano/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: formData.nombre,
          apellido: formData.apellido,
          telefono: formData.telefono,
          direccion: formData.direccion,
          localidad: formData.localidad
        })
      });

      const data = await res.json();

      if (data.success) {
        setUsuario(formData);
        setEditando(false);
        setMensaje('✅ Perfil actualizado correctamente');
        setTimeout(() => setMensaje(''), 3000);
      } else {
        setMensaje('⚠️ Error al actualizar el perfil');
      }
    } catch (error) {
      console.error('Error:', error);
      setMensaje('⚠️ Error al guardar los cambios');
    }
  };

  const handleCancel = () => {
    setFormData(usuario); 
    setEditando(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  const formatearFecha = (fechaString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(fechaString).toLocaleDateString('es-CO', options);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
          <p>Cargando datos del ciudadano...</p>
        </div>
      </div>
    );
  }

  if (!usuario) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⚠️</div>
          <p>No se pudieron cargar los datos del usuario</p>
          <button onClick={() => navigate('/login')} style={{ marginTop: '1rem', padding: '0.5rem 1rem' }}>
            Volver al Login
          </button>
        </div>
      </div>
    );
  }

  const iniciales = `${usuario.nombre?.[0] || ''}${usuario.apellido?.[0] || ''}`.toUpperCase();
  const mapUrl = `https://maps.google.com/maps?q=${posicionCamion.lat},${posicionCamion.lng}&z=13&output=embed`;

  const renderContenido = () => {
    switch (pestanaActiva) {
      case 'perfil':
        return (
          <div className="perfil-card">
            {mensaje && (
              <div className={mensaje.includes('✅') ? 'success-message' : 'error-message'} style={{ marginBottom: '1rem' }}>
                {mensaje}
              </div>
            )}

            <div className="perfil-header-container">
              <div>
                <h2 className="titulo-seccion">Mi Perfil</h2>
                <p className="subtitulo-seccion">Información personal desde la base de datos</p>
              </div>
              
              {!editando ? (
                <button onClick={handleEdit} className="btn btn-primary">
                  <Edit2 size={18} />
                  Editar Perfil
                </button>
              ) : (
                <div className="perfil-acciones-container">
                  <button onClick={handleSave} className="btn btn-save">
                    <Save size={18} />
                    Guardar
                  </button>
                  <button onClick={handleCancel} className="btn btn-cancel">
                    <X size={18} />
                    Cancelar
                  </button>
                </div>
              )}
            </div>

            <div className="perfil-avatar-info">
              <div className="avatar">
                <span className="avatar-iniciales">{iniciales}</span>
              </div>
              <div>
                {editando ? (
                  <div className="nombre-edicion">
                    <input
                      type="text"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      className="input-editable input-nombre"
                    />
                    <input
                      type="text"
                      name="apellido"
                      value={formData.apellido}
                      onChange={handleChange}
                      className="input-editable input-nombre"
                    />
                  </div>
                ) : (
                  <h3 className="perfil-nombre">
                    {usuario.nombre} {usuario.apellido}
                  </h3>
                )}
                <p className="perfil-rol">{usuario.rol}</p>
              </div>
            </div>

            <div className="perfil-datos-grid">
              <div className="campo-container">
                <label className="campo-label">
                  <Mail size={16} className="icon-campo" />
                  Correo Electrónico
                </label>
                <p className="campo-valor campo-valor-noeditable">
                  {usuario.email} (No editable)
                </p>
              </div>

              <div className="campo-container">
                <label className="campo-label">
                  <Phone size={16} className="icon-campo" />
                  Teléfono
                </label>
                {editando ? (
                  <input
                    type="tel"
                    name="telefono"
                    value={formData.telefono || ''}
                    onChange={handleChange}
                    className="input-editable input-campo"
                  />
                ) : (
                  <p className="campo-valor campo-valor-normal">
                    {usuario.telefono || 'No registrado'}
                  </p>
                )}
              </div>

              <div className="campo-container">
                <label className="campo-label">
                  <User size={16} className="icon-campo" />
                  Documento
                </label>
                <p className="campo-valor campo-valor-noeditable">
                  {usuario.documento} (No editable)
                </p>
              </div>

              <div className="campo-container">
                <label className="campo-label">
                  <MapPin size={16} className="icon-campo" />
                  Dirección
                </label>
                {editando ? (
                  <input
                    type="text"
                    name="direccion"
                    value={formData.direccion || ''}
                    onChange={handleChange}
                    className="input-editable input-campo"
                  />
                ) : (
                  <p className="campo-valor campo-valor-normal">
                    {usuario.direccion || 'No registrada'}
                  </p>
                )}
              </div>

              <div className="campo-container">
                <label className="campo-label">
                  <MapPin size={16} className="icon-campo" />
                  Localidad
                </label>
                {editando ? (
                  <input
                    type="text"
                    name="localidad"
                    value={formData.localidad || ''}
                    onChange={handleChange}
                    className="input-editable input-campo"
                  />
                ) : (
                  <p className="campo-valor campo-valor-normal">
                    {usuario.localidad}
                  </p>
                )}
              </div>

              <div className="campo-container campo-full-width">
                <label className="campo-label">
                  <User size={16} className="icon-campo" />
                  ID de Usuario
                </label>
                <p className="campo-valor campo-valor-noeditable">
                  #{usuario.id_usuario}
                </p>
              </div>
            </div>

            <div className="perfil-stats-grid">
              <div className="stat-card stat-blue">
                <FileText className="stat-icon" size={32} />
                <p className="stat-number">{solicitudes.length}</p>
                <p className="stat-label">Solicitudes Totales</p>
              </div>
              <div className="stat-card stat-green">
                <CheckCircle className="stat-icon" size={32} />
                <p className="stat-number">{solicitudes.filter(s => s.estado === 'Completada').length}</p>
                <p className="stat-label">Completadas</p>
              </div>
              <div className="stat-card stat-yellow">
                <Bell className="stat-icon" size={32} />
                <p className="stat-number">{notificaciones.filter(n => !n.leida).length}</p>
                <p className="stat-label">Notificaciones sin leer</p>
              </div>
              <div className="stat-card stat-purple">
                <Trash2 className="stat-icon" size={32} />
                <p className="stat-number">95%</p>
                <p className="stat-label">Separación Promedio</p>
              </div>
            </div>
          </div>
        );

      case 'solicitudes':
        return (
          <div className="solicitudes-card">
            <h2 className="titulo-seccion">Mis Solicitudes</h2>
            <p className="subtitulo-seccion">Solicitudes registradas en la base de datos</p>

            <button className="btn btn-success btn-nueva-solicitud">
              <Plus size={18} /> Crear Nueva Solicitud
            </button>
            
            <div className="lista-solicitudes">
              {solicitudes.map(solicitud => (
                <div key={solicitud.id} className={`solicitud-item`}>
                  <div className="solicitud-header">
                    <Zap size={20} className="solicitud-icon" />
                    <h3 className="solicitud-titulo">{solicitud.tipo} - ID: {solicitud.id}</h3>
                    <span className={`solicitud-estado estado-${solicitud.estado.toLowerCase()}`}>
                      <Clock size={16} />
                      {solicitud.estado}
                    </span>
                  </div>
                  <p className="solicitud-descripcion">
                    Dirección: {solicitud.direccion}, Localidad: {solicitud.localidad}
                  </p>
                  <div className="solicitud-footer">
                    <Calendar size={14} /> Fecha: {new Date(solicitud.fecha).toLocaleDateString('es-CO')}
                  </div>
                </div>
              ))}
            </div>

            {solicitudes.length === 0 && (
              <div className="alerta-vacio">
                <Info size={24} />
                <p>No tienes solicitudes registradas en la base de datos.</p>
              </div>
            )}
          </div>
        );

      case 'notificaciones':
        return (
          <div className="notificaciones-card">
            <h2 className="titulo-seccion">Notificaciones</h2>
            <p className="subtitulo-seccion">Mensajes importantes sobre tu actividad</p>

            <div className="lista-notificaciones">
              {notificaciones.map(notif => {
                const IconComponent = notif.icon;
                return (
                  <div key={notif.id} className={`notificacion-item notificacion-${notif.color} ${notif.leida ? 'leida' : 'no-leida'}`}>
                    <div className="notificacion-icon-container">
                      <IconComponent size={24} />
                    </div>
                    <div className="notificacion-content">
                      <h4 className="notificacion-titulo">{notif.tipo}</h4>
                      <p className="notificacion-mensaje" dangerouslySetInnerHTML={{ __html: notif.mensaje }}></p>
                      <span className="notificacion-fecha">{formatearFecha(notif.fecha)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 'rutas':
        return (
          <div className="rutas-card">
            <h2 className="titulo-seccion">Rutas Ecológicas y Recolección</h2>
            <p className="subtitulo-seccion">Sigue en tiempo real el camión de recolección</p>

            <div className="mapa-container">
              <h3 className="mapa-titulo"><Map size={20} /> Seguimiento en Tiempo Real</h3>
              
              <iframe
                title="Mapa de Recolección"
                width="100%"
                height="400"
                frameBorder="0"
                style={{ border: 0, borderRadius: '8px' }}
                src={mapUrl}
                allowFullScreen
              />

              <div className="alerta-info alerta-mapa">
                <AlertCircle className="alerta-icon" size={20} />
                <p>Tu localidad: <strong>{usuario.localidad}</strong></p>
              </div>
            </div>
          </div>
        );

      case 'recursos':
        return (
          <div className="recursos-card">
            <h2 className="titulo-seccion">Recursos y Guías</h2>
            <p className="subtitulo-seccion">Aprende sobre reciclaje y compostaje</p>

            <div className="recursos-grid">
              <div className="recurso-item recurso-green">
                <BookOpen size={32} />
                <h3>Guía de Separación</h3>
                <p>Todo sobre separación de residuos.</p>
              </div>
              <div className="recurso-item recurso-blue">
                <MessageSquare size={32} />
                <h3>Preguntas Frecuentes</h3>
                <p>Resuelve tus dudas.</p>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="app-container">
      <div className="app-layout">
        <aside className="sidebar">
          <div className="sidebar-content">
            <div className="logo-container">
              <div className="logo-icon">
                <Trash2 size={24} color="white" />
              </div>
              <div>
                <h2 className="logo-titulo">Zero Waste</h2>
                <p className="logo-subtitulo">Portal Ciudadano</p>
              </div>
            </div>

            <nav className="nav-menu">
              <button onClick={() => setPestanaActiva('perfil')} className={`nav-link ${pestanaActiva === 'perfil' ? 'active' : ''}`}>
                <Home size={20} /> Mi Perfil
              </button>
              <button onClick={() => setPestanaActiva('solicitudes')} className={`nav-link ${pestanaActiva === 'solicitudes' ? 'active' : ''}`}>
                <FileText size={20} /> Solicitudes
              </button>
              <button onClick={() => setPestanaActiva('notificaciones')} className={`nav-link ${pestanaActiva === 'notificaciones' ? 'active' : ''}`}>
                <Bell size={20} /> Notificaciones
                <span className="badge-notificaciones">{notificaciones.filter(n => !n.leida).length}</span>
              </button>
              <button onClick={() => setPestanaActiva('rutas')} className={`nav-link ${pestanaActiva === 'rutas' ? 'active' : ''}`}>
                <Map size={20} /> Rutas Ecológicas
              </button>
              <button onClick={() => setPestanaActiva('recursos')} className={`nav-link ${pestanaActiva === 'recursos' ? 'active' : ''}`}>
                <BookOpen size={20} /> Recursos
              </button>
            </nav>

            <button className="btn btn-logout" onClick={handleLogout}>
              <LogOut size={20} />
              Cerrar Sesión
            </button>
          </div>
        </aside>

        <main className="main-content">
          <div className="main-header">
            <h1 className="main-title">¡Hola, {usuario.nombre}! 👋</h1>
            <p className="main-subtitle">Datos cargados desde la base de datos</p>
          </div>

          {renderContenido()}
        </main>
      </div>
    </div>
  );
};

export default Ciudadano;