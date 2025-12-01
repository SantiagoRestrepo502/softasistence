/**
 * Servicio de Autenticación
 * Contiene la lógica de negocio para autenticación de usuarios
 */

const { pool } = require('../db')
const bcrypt = require('bcryptjs')
const { getUserByEmail, getUserByCedula } = require('./user.service')

/**
 * Compara una contraseña en texto plano con un hash bcrypt
 * @param {string} plainPassword - Contraseña en texto plano
 * @param {string} hash - Hash bcrypt almacenado
 * @returns {Promise<boolean>} true si la contraseña coincide
 */
async function comparePassword(plainPassword, hash) {
  if (!plainPassword || !hash) {
    return false
  }
  try {
    return await bcrypt.compare(String(plainPassword), String(hash))
  } catch (error) {
    console.error('[auth.service] Error al comparar contraseña:', error)
    return false
  }
}

/**
 * Autentica un usuario con email o cédula y contraseña
 * @param {object} credentials - Credenciales de login
 * @param {string|null} credentials.email - Email del usuario
 * @param {number|null} credentials.cedula - Cédula del usuario
 * @param {string} credentials.password - Contraseña en texto plano
 * @returns {Promise<{success: boolean, user: object|null, error: string|null}>}
 */
async function authenticateUser(credentials) {
  const { email, cedula, password } = credentials || {}

  try {
    // Buscar usuario por email o cédula
    let user = null
    if (email) {
      user = await getUserByEmail(email)
    } else if (cedula) {
      user = await getUserByCedula(cedula)
    }

    // Verificar si el usuario existe
    if (!user) {
      return {
        success: false,
        user: null,
        error: 'Credenciales inválidas'
      }
    }

    // Verificar si el usuario está activo
    if (!user.activo) {
      return {
        success: false,
        user: null,
        error: 'Usuario inactivo. Contacte al administrador'
      }
    }

    // Verificar contraseña
    const passwordMatch = await comparePassword(password, user.password_hash)
    if (!passwordMatch) {
      return {
        success: false,
        user: null,
        error: 'Credenciales inválidas'
      }
    }

    // Retornar usuario sin información sensible
    const safeUser = {
      cedula: user.cedula,
      nombre: user.nombre,
      apellido: user.apellido,
      email: user.email,
      rol: user.rol,
      activo: Boolean(user.activo),
    }

    return {
      success: true,
      user: safeUser,
      error: null
    }
  } catch (error) {
    console.error('[auth.service] Error en authenticateUser:', error)
    return {
      success: false,
      user: null,
      error: 'Error interno del servidor'
    }
  }
}

module.exports = {
  comparePassword,
  authenticateUser,
}


