/**
 * Controlador de Autenticación
 * Maneja las peticiones HTTP relacionadas con autenticación
 */

const { authenticateUser } = require('../services/auth.service')
const { signToken } = require('../utils/jwt')
const {
  sanitizeEmail,
  sanitizeCedula,
  sanitizePassword,
  validateLoginCredentials,
} = require('../utils/validators')

/**
 * Controlador para el endpoint de login
 * POST /api/auth/login
 * 
 * @param {object} req - Request object de Express
 * @param {object} res - Response object de Express
 */
async function login(req, res) {
  try {
    // Sanitizar y validar datos de entrada
    const email = sanitizeEmail(req.body?.email)
    const cedula = sanitizeCedula(req.body?.cedula)
    const password = sanitizePassword(req.body?.password)

    // Validar credenciales
    const validation = validateLoginCredentials({ email, cedula, password })
    if (!validation.valid) {
      return res.status(400).json({
        status: 'error',
        message: validation.error,
        data: null
      })
    }

    // Autenticar usuario
    const authResult = await authenticateUser({ email, cedula, password })

    if (!authResult.success) {
      // No revelar si el usuario existe o no por seguridad
      const statusCode = authResult.error.includes('inactivo') ? 403 : 401
      return res.status(statusCode).json({
        status: 'error',
        message: authResult.error,
        data: null
      })
    }

    // Emitir token JWT
    const token = signToken({
      cedula: authResult.user.cedula,
      email: authResult.user.email,
      nombre: authResult.user.nombre,
      apellido: authResult.user.apellido,
      rol: authResult.user.rol,
    })

    // Login exitoso
    return res.status(200).json({
      status: 'success',
      message: 'Inicio de sesión exitoso',
      data: {
        user: authResult.user,
        token,
      }
    })
  } catch (error) {
    console.error('[auth.controller] Error en login:', error)
    
    // No exponer detalles del error al cliente
    return res.status(500).json({
      status: 'error',
      message: 'Error interno del servidor',
      data: null
    })
  }
}

/**
 * Controlador para verificar el estado de autenticación
 * GET /api/auth/me (opcional, para futuras implementaciones)
 * 
 * @param {object} req - Request object de Express
 * @param {object} res - Response object de Express
 */
async function getCurrentUser(req, res) {
  const user = req.user
  if (!user) {
    return res.status(401).json({ status: 'error', message: 'No autorizado', data: null })
  }
  return res.status(200).json({ status: 'success', message: 'Usuario actual', data: { user } })
}

module.exports = {
  login,
  getCurrentUser,
}

