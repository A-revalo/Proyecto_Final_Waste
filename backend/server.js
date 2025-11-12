import express from "express";
import mysql from "mysql2/promise";
import cors from "cors";
import bcrypt from "bcrypt";

const app = express();
app.use(cors());
app.use(express.json());

// Pool de conexiones
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "", // tu contraseña de MySQL
  database: "zerowaste",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Verificar conexión al iniciar
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log("✅ Conectado a MySQL - Base de datos: zerowaste");
    connection.release();
  } catch (err) {
    console.error("❌ Error conectando a MySQL:", err.message);
  }
})();

// ============================================
// RUTA DE LOGIN ACTUALIZADA
// ============================================
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ 
      success: false, 
      error: "Email y contraseña son requeridos" 
    });
  }

  try {
    // 1. Buscar el usuario en la tabla usuarios
    const [rows] = await pool.query(
      "SELECT * FROM usuarios WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      console.log("⚠️ Usuario no encontrado:", email);
      return res.status(401).json({ 
        success: false, 
        message: "Credenciales incorrectas" 
      });
    }

    const user = rows[0];
    let isPasswordValid = false;

    // 2. Verificar la contraseña
    // Primero intentamos con bcrypt (contraseñas hasheadas)
    if (user.contraseña.startsWith('$2b$') || user.contraseña.startsWith('$2a$') || user.contraseña.startsWith('$2y$')) {
      // Es una contraseña hasheada con bcrypt
      isPasswordValid = await bcrypt.compare(password, user.contraseña);
    } else {
      // Es una contraseña en texto plano (para testing o datos legacy)
      isPasswordValid = password === user.contraseña;
      
      // IMPORTANTE: Si la contraseña es correcta, la hasheamos y actualizamos
      if (isPasswordValid) {
        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.query(
          "UPDATE usuarios SET contraseña = ? WHERE id_usuario = ?",
          [hashedPassword, user.id_usuario]
        );
        console.log(`✅ Contraseña actualizada a hash para usuario: ${email}`);
      }
    }

    if (!isPasswordValid) {
      console.log("⚠️ Contraseña incorrecta para:", email);
      return res.status(401).json({ 
        success: false, 
        message: "Credenciales incorrectas" 
      });
    }

    // 3. Obtener información adicional según el rol
    let userData = {
      id_usuario: user.id_usuario,
      email: user.email,
      rol: user.rol
    };

    if (user.rol === 'ciudadano') {
      const [ciudadano] = await pool.query(
        `SELECT id_Ciudadano, nombre, apellido, documento, telefono, 
                direccion, localidad, barrio 
         FROM ciudadanos WHERE id_usuario = ?`,
        [user.id_usuario]
      );
      
      if (ciudadano.length > 0) {
        userData = { ...userData, ...ciudadano[0] };
      }
    } else if (user.rol === 'admin') {
      const [admin] = await pool.query(
        `SELECT id_Admin, nombre, apellido, documento, id_Empresa 
         FROM administrador WHERE id_usuario = ?`,
        [user.id_usuario]
      );
      
      if (admin.length > 0) {
        userData = { ...userData, ...admin[0] };
      }
    } else if (user.rol === 'conductor') {
      const [conductor] = await pool.query(
        `SELECT id_Conductor, nombre, apellido, telefono, 
                direccion, licencia 
         FROM conductor WHERE id_usuario = ?`,
        [user.id_usuario]
      );
      
      if (conductor.length > 0) {
        userData = { ...userData, ...conductor[0] };
      }
    }

    console.log(`✅ Login exitoso para: ${email} (${user.rol})`);
    
    res.json({ 
      success: true, 
      user: userData
    });

  } catch (err) {
    console.error("❌ Error en login:", err);
    res.status(500).json({ 
      success: false, 
      error: "Error en el servidor" 
    });
  }
});

// ============================================
// RUTA DE REGISTRO
// ============================================
app.post("/register", async (req, res) => {
  const {
    firstName,
    lastName,
    registerEmail,
    documentType,
    documentNumber,
    phone,
    address,
    populationType,
    localidad,
    password,
  } = req.body;

  console.log("📝 Intentando registrar usuario:", registerEmail);

  // Validación básica
  if (!firstName || !lastName || !registerEmail || !password || 
      !documentType || !documentNumber || !localidad) {
    return res.status(400).json({ 
      success: false, 
      error: "Todos los campos obligatorios deben ser completados" 
    });
  }

  try {
    // Verificar si el email ya existe en usuarios
    const [existingEmail] = await pool.query(
      "SELECT id_usuario FROM usuarios WHERE email = ?",
      [registerEmail]
    );

    if (existingEmail.length > 0) {
      console.log("⚠️ Email ya registrado:", registerEmail);
      return res.status(400).json({ 
        success: false, 
        error: "El email ya está registrado" 
      });
    }

    // Verificar si el documento ya existe en ciudadanos
    const [existingDoc] = await pool.query(
      "SELECT id_Ciudadano FROM ciudadanos WHERE documento = ?",
      [documentNumber]
    );

    if (existingDoc.length > 0) {
      console.log("⚠️ Documento ya registrado:", documentNumber);
      return res.status(400).json({ 
        success: false, 
        error: "El número de documento ya está registrado" 
      });
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Iniciar transacción
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // 1. Insertar en la tabla usuarios
      const [userResult] = await connection.query(
        "INSERT INTO usuarios (email, contraseña, rol) VALUES (?, ?, 'ciudadano')",
        [registerEmail, hashedPassword]
      );

      const userId = userResult.insertId;
      console.log("✅ Usuario creado en tabla usuarios con ID:", userId);

      // 2. Insertar en la tabla ciudadanos
      await connection.query(
        `INSERT INTO ciudadanos 
        (id_usuario, nombre, apellido, documento, telefono, direccion, localidad, email, contraseña) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          firstName,
          lastName,
          documentNumber,
          phone || null,
          address || null,
          localidad,
          registerEmail,
          hashedPassword
        ]
      );

      console.log("✅ Ciudadano registrado en tabla ciudadanos");

      // Confirmar transacción
      await connection.commit();
      connection.release();

      console.log("🎉 Registro completado exitosamente:", registerEmail);

      res.json({ 
        success: true, 
        message: "✅ Registro exitoso" 
      });

    } catch (err) {
      // Revertir cambios si algo falla
      await connection.rollback();
      connection.release();
      console.error("❌ Error en transacción, revertiendo cambios:", err.message);
      throw err;
    }

  } catch (err) {
    console.error("❌ Error detallado en registro:", {
      message: err.message,
      code: err.code,
      errno: err.errno,
      sql: err.sql
    });
    
    // Errores específicos de MySQL
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ 
        success: false, 
        error: "El email o documento ya está registrado" 
      });
    }

    if (err.code === 'ER_BAD_FIELD_ERROR') {
      return res.status(500).json({ 
        success: false, 
        error: "Error en la estructura de la base de datos. Contacta al administrador." 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      error: "Error al registrar usuario. Intenta nuevamente." 
    });
  }
});

// ============================================
// RUTA PARA OBTENER DATOS DEL CIUDADANO
// ============================================
app.get("/ciudadano/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // Obtener datos del usuario y ciudadano
    const [rows] = await pool.query(
      `SELECT 
        u.id_usuario,
        u.email,
        u.rol,
        c.nombre,
        c.apellido,
        c.documento,
        c.telefono,
        c.direccion,
        c.localidad
      FROM usuarios u
      INNER JOIN ciudadanos c ON u.id_usuario = c.id_usuario
      WHERE u.id_usuario = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: "Ciudadano no encontrado" 
      });
    }

    const ciudadano = rows[0];

    // Obtener solicitudes del ciudadano (si existen)
    const [solicitudes] = await pool.query(
      `SELECT 
        id_Solicitud as id,
        'Recolección' as tipo,
        fecha,
        localidad,
        direccion,
        'Pendiente' as estado
      FROM solicitudes
      WHERE id_Ciudadano = (SELECT id_Ciudadano FROM ciudadanos WHERE id_usuario = ?)
      ORDER BY fecha DESC
      LIMIT 10`,
      [id]
    );

    res.json({
      success: true,
      ciudadano: {
        id_usuario: ciudadano.id_usuario,
        nombre: ciudadano.nombre,
        apellido: ciudadano.apellido,
        email: ciudadano.email,
        telefono: ciudadano.telefono,
        documento: ciudadano.documento,
        direccion: ciudadano.direccion,
        localidad: ciudadano.localidad,
        rol: ciudadano.rol
      },
      solicitudes: solicitudes || []
    });

  } catch (err) {
    console.error("❌ Error obteniendo datos del ciudadano:", err);
    res.status(500).json({ 
      success: false, 
      error: "Error al obtener datos del ciudadano" 
    });
  }
});

// ============================================
// RUTA PARA ACTUALIZAR PERFIL DEL CIUDADANO
// ============================================
app.put("/ciudadano/:id", async (req, res) => {
  const { id } = req.params;
  const { nombre, apellido, telefono, direccion, localidad } = req.body;

  try {
    // Actualizar en la tabla ciudadanos
    await pool.query(
      `UPDATE ciudadanos 
       SET nombre = ?, apellido = ?, telefono = ?, direccion = ?, localidad = ?
       WHERE id_usuario = ?`,
      [nombre, apellido, telefono, direccion, localidad, id]
    );

    console.log(`✅ Perfil actualizado para usuario ID: ${id}`);

    res.json({ 
      success: true, 
      message: "Perfil actualizado correctamente" 
    });

  } catch (err) {
    console.error("❌ Error actualizando perfil:", err);
    res.status(500).json({ 
      success: false, 
      error: "Error al actualizar el perfil" 
    });
  }
});

// ============================================
// RUTAS DE PRUEBA Y SALUD
// ============================================
app.get("/", (req, res) => {
  res.json({ 
    message: "✅ Servidor Zero Waste funcionando correctamente",
    timestamp: new Date().toISOString()
  });
});

app.get("/health", async (req, res) => {
  try {
    const connection = await pool.getConnection();
    await connection.query("SELECT 1");
    connection.release();
    res.json({ 
      status: "healthy", 
      database: "connected",
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ 
      status: "unhealthy", 
      database: "disconnected",
      error: err.message
    });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`
  🚀 Servidor Zero Waste Iniciado     
  📍 Puerto: ${PORT}                      
  🌐 URL: http://localhost:${PORT}       
  💾 Base de datos: zerowaste          
  `);
});