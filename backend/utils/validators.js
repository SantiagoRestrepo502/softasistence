/**
 * Utilidades de validación y sanitización
 * Proporciona funciones reutilizables para validar y limpiar datos de entrada
 */

/**
 * Sanitiza un email: convierte a minúsculas y elimina espacios
 * @param {string|null|undefined} value - Valor a sanitizar
 * @returns {string|null} Email sanitizado o null si es inválido
 */
function sanitizeEmail(value) {
  if (value == null || value === '') return null
  const trimmed = String(value).trim().toLowerCase()
  return trimmed || null
}

/**
 * Valida si un email tiene formato válido
 * @param {string} email - Email a validar
 * @returns {boolean} true si el email es válido
 */
function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
  return emailRegex.test(email.trim())
}

/**
 * Sanitiza una cédula: elimina caracteres no numéricos y convierte a número
 * @param {string|number|null|undefined} value - Valor a sanitizar
 * @returns {number|null} Cédula como número o null si es inválida
 */
function sanitizeCedula(value) {
  if (value == null || value === '') return null
  const cleaned = String(value).replace(/[^0-9]/g, '')
  if (!cleaned || cleaned.length === 0) return null
  const num = Number(cleaned)
  return isNaN(num) || num <= 0 ? null : num
}

/**
 * Valida si una cédula tiene formato válido
 * @param {string|number} cedula - Cédula a validar
 * @returns {boolean} true si la cédula es válida
 */
function isValidCedula(cedula) {
  if (cedula == null) return false
  const cleaned = String(cedula).replace(/[^0-9]/g, '')
  return cleaned.length >= 8 && cleaned.length <= 15
}

/**
 * Sanitiza una contraseña: mantiene el valor original pero valida formato
 * @param {string|null|undefined} value - Valor a sanitizar
 * @returns {string|null} Contraseña sanitizada o null si es inválida
 */
function sanitizePassword(value) {
  if (value == null) return null
  const trimmed = String(value).trim()
  return trimmed || null
}

/**
 * Valida si una contraseña cumple con los requisitos de seguridad
 * @param {string} password - Contraseña a validar
 * @returns {{valid: boolean, error: string|null}} Objeto con resultado de validación
 */
function validatePassword(password) {
  if (!password || typeof password !== 'string') {
    return { valid: false, error: 'La contraseña es requerida' }
  }

  const trimmed = password.trim()
  
  if (trimmed.length === 0) {
    return { valid: false, error: 'La contraseña no puede estar vacía' }
  }

  if (trimmed.length < 8) {
    return { valid: false, error: 'La contraseña debe tener al menos 8 caracteres' }
  }

  if (/\s/.test(trimmed)) {
    return { valid: false, error: 'La contraseña no puede contener espacios' }
  }

  return { valid: true, error: null }
}

/**
 * Valida las credenciales de login
 * @param {object} credentials - Objeto con email, cedula y password
 * @returns {{valid: boolean, error: string|null}} Objeto con resultado de validación
 */
function validateLoginCredentials(credentials) {
  const { email, cedula, password } = credentials || {}

  // Debe tener al menos email o cédula
  if (!email && !cedula) {
    return { valid: false, error: 'Debe proporcionar email o cédula' }
  }

  // Validar email si se proporciona
  if (email && !isValidEmail(email)) {
    return { valid: false, error: 'El formato del email no es válido' }
  }

  // Validar cédula si se proporciona
  if (cedula && !isValidCedula(cedula)) {
    return { valid: false, error: 'La cédula debe tener entre 8 y 15 dígitos' }
  }

  // Validar contraseña
  const passwordValidation = validatePassword(password)
  if (!passwordValidation.valid) {
    return { valid: false, error: passwordValidation.error }
  }

  return { valid: true, error: null }
}

module.exports = {
  sanitizeEmail,
  isValidEmail,
  sanitizeCedula,
  isValidCedula,
  sanitizePassword,
  validatePassword,
  validateLoginCredentials,
}


