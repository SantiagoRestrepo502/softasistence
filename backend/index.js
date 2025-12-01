const express = require('express');
const cors = require('cors');
const { ping } = require('./db');
const { pool } = require('./db');
const bcrypt = require('bcryptjs');
const authRoutes = require('./routes/auth.routes');
const aprendizRoutes = require('./routes/aprendiz.routes');
const usersRoutes = require('./routes/users.routes');
const formacionesRoutes = require('./routes/formaciones.routes');
const reportsRoutes = require('./routes/reports.routes');
const { sendToGoogleSheets } = require('./services/sheets.service');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors())
// Respuesta manual para preflight CORS (OPTIONS) compatible con Express v5
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Origin', '*')
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    res.set('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
    return res.sendStatus(204)
  }
  next()
})
app.use(express.json())

// Middleware de logging ANTES de las rutas para capturar todas las solicitudes
app.use((req, res, next) => {
  const start = Date.now()
  console.log(`[req] ${req.method} ${req.originalUrl} `)
  if (req.method === 'POST' && req.body) {
    console.log(`[req.body]`, JSON.stringify(req.body).substring(0, 200))
  }
  res.on('finish', () => {
    console.log(`[res] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${Date.now() - start}ms)`)
  })
  next()
})

// Rutas de autenticación
app.use('/api/auth', authRoutes)

// Rutas de gestión (protegidas con middleware de autenticación)
app.use('/api/users', usersRoutes)
app.use('/api/formaciones', formacionesRoutes)
app.use('/api/reports', reportsRoutes)

// Rutas de aprendices
app.use('/api/aprendices', aprendizRoutes)

// Rutas de asistencia
app.use('/api/asistencia', require('./routes/asistencia.routes'))
app.use('/api/biometric', require('./routes/biometric.routes'))

app.get('/api/db-ping', async (req, res) => {
  try {
    const rows = await ping()
    const [[info]] = await pool.query('SELECT DATABASE() AS db, VERSION() AS version')
    res.json({ ok: true, rows, info })
  } catch (error) {
    const msg = error?.message || error?.code || String(error) || 'Error'
    console.error('db-ping error:', error)
    res.status(500).json({ ok: false, error: msg })
  }
})

// Debug endpoint para ver todas las rutas
app.get('/api/debug/routes', (req, res) => {
  try {
    const routes = []
    const stack = (app._router && app._router.stack) || []

    for (const layer of stack) {
      if (layer.route && layer.route.path) {
        const methods = Object.keys(layer.route.methods || {}).filter(m => layer.route.methods[m])
        routes.push({
          path: layer.route.path,
          methods,
          fullPath: layer.route.path
        })
      } else if (layer.name === 'router' && layer.handle && layer.handle.stack) {
        const basePath = layer.regexp ? layer.regexp.source.replace(/\\\/|\^|\$|\?/g, '').replace(/\(.*?\)/g, '') : ''
        for (const nested of layer.handle.stack) {
          if (nested.route && nested.route.path) {
            const methods = Object.keys(nested.route.methods || {}).filter(m => nested.route.methods[m])
            let fullPath = nested.route.path
            if (layer.regexp) {
              const regexStr = layer.regexp.toString()
              const match = regexStr.match(/\^\\?\/?([^\\\/]+)/)
              if (match) {
                fullPath = `/${match[1]}${nested.route.path}`
              }
            }
            routes.push({
              path: nested.route.path,
              methods,
              fullPath: fullPath || nested.route.path,
              basePath: basePath || 'unknown'
            })
          }
        }
      }
    }

    const knownRoutes = [
      { path: '/api/auth/login', methods: ['POST'], description: 'Iniciar sesión' },
      { path: '/api/auth/me', methods: ['GET'], description: 'Usuario actual (requiere token)' },
      { path: '/api/users', methods: ['GET', 'POST', 'PUT', 'DELETE'], description: 'Gestión de usuarios (requiere auth)' },
      { path: '/api/formaciones', methods: ['GET', 'POST', 'PUT', 'DELETE'], description: 'Gestión de formaciones (requiere auth)' },
      { path: '/api/reports/*', methods: ['GET'], description: 'Reportes y estadísticas (requiere auth)' },
      { path: '/api/aprendices', methods: ['POST', 'GET'], description: 'Crear/Listar aprendices' },
      { path: '/api/asistencia', methods: ['POST'], description: 'Registrar asistencia' },
    ]

    res.json({
      ok: true,
      routes,
      knownRoutes,
      message: 'Rutas disponibles. Las rutas con "(requiere auth)" necesitan token JWT en header Authorization: Bearer TOKEN'
    })
  } catch (e) {
    res.status(500).json({ ok: false, error: e?.message || String(e) })
  }
})

app.get('/api/hello', (req, res) => {
  res.json({ message: 'hola desde backend' })
})

app.post('/api/attendance', async (req, res) => {
  try {
    const { jornada, ficha, nombreFormacion, rol, documento, instructor } = req.body

    // Validación básica
    if (!jornada || !ficha || !nombreFormacion) {
      return res.status(400).json({ ok: false, error: 'jornada, ficha y nombreFormacion son obligatorios' })
    }

    const roleValue = String(rol || '').trim().toLowerCase() || 'aprendiz'

    // Si es un registro de aprendiz individual (con documento)
    if (documento) {
      // 1. Buscar el aprendiz por documento
      const [aprendicesRows] = await pool.query('SELECT id_aprendices, nombres, apellidos FROM aprendices WHERE documento = ?', [documento])

      if (aprendicesRows.length === 0) {
        return res.status(404).json({ ok: false, error: `Aprendiz con documento ${documento} no encontrado` })
      }

      const aprendiz = aprendicesRows[0];

      // 2. Usar ficha (código) directamente como FK
      const fk_codigo_formacion = ficha;

      // 3. Verificar si ya registró asistencia hoy
      const [existing] = await pool.query(
        'SELECT id_asistencias FROM asistencias WHERE fk_aprendiz = ? AND DATE(hora_registro) = CURDATE()',
        [aprendiz.id_aprendices]
      );

      if (existing.length > 0) {
        return res.status(409).json({ ok: false, error: 'Asistencia ya registrada hoy' });
      }

      // 4. Registrar asistencia
      try {
        const horaEntrada = new Date().toLocaleTimeString('es-CO', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        });

        const [result] = await pool.query(
          'INSERT INTO asistencias (fk_codigo_formacion, fk_aprendiz, presente, documento, hora_registro) VALUES (?, ?, 1, ?, NOW())',
          [fk_codigo_formacion, aprendiz.id_aprendices, documento]
        );

        // 5. Enviar a Google Sheets con el nuevo formato
        sendToGoogleSheets({
          instructor: instructor || 'No especificado',
          formacion: `${ficha} - ${nombreFormacion}`,
          presente: 'Sí',
          hora_entrada: horaEntrada,
          nombre_aprendiz: `${aprendiz.nombres} ${aprendiz.apellidos}`
        });

        return res.status(201).json({ ok: true, id: result.insertId, message: 'Asistencia registrada' })
      } catch (sqlError) {
        console.error('Error SQL Insert Asistencia:', sqlError);
        return res.status(500).json({
          ok: false,
          error: 'Error al guardar asistencia en base de datos',
          details: sqlError.message
        })
      }
    } else {
      // Registro genérico (sin documento específico)
      const [result] = await pool.query(
        'INSERT INTO asistencias (presente, hora_registro) VALUES (1, NOW())',
        []
      )
      return res.status(201).json({ ok: true, id: result.insertId })
    }

  } catch (error) {
    const msg = error?.message || error?.code || String(error) || 'Error'
    console.error('POST /api/attendance error:', error)
    if (error && error.code === 'ER_NO_SUCH_TABLE') {
      return res.status(500).json({ ok: false, error: 'tabla asistencias no existe' })
    }
    res.status(500).json({ ok: false, error: msg, code: error?.code || null, sqlMessage: error?.sqlMessage || null })
  }
})

// Iniciar servidor (debe estar al final, después de todas las rutas)
app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`)
  console.log(`Rutas disponibles:`)
  console.log(`  - POST /api/aprendices - Crear aprendiz`)
  console.log(`  - GET  /api/aprendices - Listar aprendices`)
  console.log(`  - GET  /api/aprendices/:documento - Obtener aprendiz por documento`)
  console.log(`  - POST /api/auth/login - Iniciar sesión`)
  console.log(`  - POST /api/users - Crear usuario`)
  console.log(`  - GET  /api/debug/routes - Ver todas las rutas`)
})