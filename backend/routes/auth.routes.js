/**
 * Rutas de Autenticación
 * Define los endpoints relacionados con autenticación
 */

const express = require('express')
const { login, getCurrentUser } = require('../controllers/auth.controller')
const { authMiddleware } = require('../middleware/auth.middleware')

const router = express.Router()

/**
 * @route   POST /api/auth/login
 * @desc    Iniciar sesión con email o cédula y contraseña
 * @access  Public
 * @body    {email?: string, cedula?: number, password: string}
 */
router.post('/login', login)

/**
 * @route   GET /api/auth/me
 * @desc    Obtener información del usuario actual
 * @access  Private (Requiere token JWT)
 */
router.get('/me', authMiddleware, getCurrentUser)

module.exports = router


