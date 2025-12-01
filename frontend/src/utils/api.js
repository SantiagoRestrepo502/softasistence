// utils/api.js - API utility functions

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:3000/api`;

/**
 * Maneja la respuesta de la API y convierte errores HTTP en excepciones
 * @param {Response} response - Objeto Response de fetch
 * @returns {Promise<object>} Datos JSON parseados
 * @throws {Error} Error con información del servidor
 */
async function handleApiResponse(response) {
  const contentType = response.headers.get('content-type') || ''
  const raw = await response.text()
  let json = null

  try {
    json = contentType.includes('application/json') ? JSON.parse(raw) : null
  } catch (e) {
    // Si no es JSON válido, continuar con raw
  }

  // Verificar si la respuesta es exitosa
  if (!response.ok || (json && (json.status === 'error' || json.ok === false))) {
    const message = (json && (json.message || json.error)) || response.statusText || raw || 'Error desconocido'
    const error = new Error(message)
    error.status = response.status
    error.json = json
    error.raw = raw
    throw error
  }

  return json || { status: 'success' }
}

export const api = {
  /**
   * Inicia sesión con cédula o email y contraseña
   * @param {object} credentials - Credenciales de login
   * @param {string} [credentials.email] - Email del usuario (opcional si se proporciona cédula)
   * @param {string|number} [credentials.cedula] - Cédula del usuario (opcional si se proporciona email)
   * @param {string} credentials.password - Contraseña del usuario
   * @returns {Promise<object>} Objeto con status, message y data.user
   * @throws {Error} Error si el login falla
   */
  async login(credentials) {
    if (!credentials) {
      throw new Error('Credenciales requeridas')
    }

    // Validar que se proporcione al menos email o cédula
    if (!credentials.email && !credentials.cedula) {
      throw new Error('Debe proporcionar email o cédula')
    }

    // Validar que se proporcione contraseña
    if (!credentials.password) {
      throw new Error('La contraseña es requerida')
    }

    // Preparar payload
    const payload = {
      email: credentials.email || null,
      cedula: credentials.cedula ? Number(String(credentials.cedula).replace(/\D/g, '')) : null,
      password: credentials.password,
    }

    // Validar que la cédula sea válida si se proporciona
    if (payload.cedula && (isNaN(payload.cedula) || payload.cedula <= 0)) {
      throw new Error('Cédula inválida')
    }

    console.log('[api.login] Enviando solicitud de login...')

    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    return await handleApiResponse(response)
  },

  async getAttendance() {
    const response = await fetch(`${API_BASE_URL}/attendance`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.json();
  },

  async registerAttendance(data) {
    const response = await fetch(`${API_BASE_URL}/attendance`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    const contentType = response.headers.get('content-type') || ''
    const raw = await response.text()
    let json = null
    try { json = contentType.includes('application/json') ? JSON.parse(raw) : null } catch (e) { void e }
    if (!response.ok || (json && json.ok === false)) {
      const message = (json && json.error) || response.statusText || raw || 'Error'
      const err = new Error(message)
      err.status = response.status
      err.json = json
      err.raw = raw
      throw err
    }
    return json || { ok: true }
  },

  async registerUser(data) {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    const contentType = response.headers.get('content-type') || ''
    const raw = await response.text()
    let json = null
    try { json = contentType.includes('application/json') ? JSON.parse(raw) : null } catch (e) { void e }
    if (!response.ok || (json && json.ok === false)) {
      const message = (json && json.error) || response.statusText || raw || 'Error'
      const err = new Error(message)
      err.status = response.status
      err.json = json
      err.raw = raw
      throw err
    }
    return json || { ok: true }
  },

  async registerAprendiz(data) {
    const response = await fetch(`${API_BASE_URL}/aprendices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    const contentType = response.headers.get('content-type') || ''
    const raw = await response.text()
    let json = null
    try { json = contentType.includes('application/json') ? JSON.parse(raw) : null } catch (e) { void e }
    if (!response.ok || (json && json.ok === false)) {
      const message = (json && json.error) || response.statusText || raw || 'Error'
      const err = new Error(message)
      err.status = response.status
      err.json = json
      err.raw = raw
      throw err
    }
    return json || { ok: true }
  },

  async registerBiometricAttendance(data) {
    const response = await fetch(`${API_BASE_URL}/asistencia/biometrica`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const json = await response.json();

    if (!response.ok) {
      const message = json.error || json.message || 'Error en registro biométrico';
      const err = new Error(message);
      err.status = response.status;
      err.json = json;
      throw err;
    }

    return json;
  },
  async getFormaciones() {
    try {
      const response = await fetch(`${API_BASE_URL}/formaciones`);
      const json = await response.json();
      return json;
    } catch (error) {
      console.error('Error fetching formaciones:', error);
      return { ok: false, error: 'Error de conexión' };
    }
  },

  async getAprendices() {
    try {
      const response = await fetch(`${API_BASE_URL}/aprendices`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const json = await response.json();
      return json;
    } catch (error) {
      console.error('Error fetching aprendices:', error);
      return { ok: false, error: 'Error de conexión', data: [] };
    }
  },
};

export default api;