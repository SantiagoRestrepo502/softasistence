/**
 * Servicio de Usuario
 * Contiene la lógica de acceso a datos de usuarios
 */

const { pool } = require('../db')

let schemaVerified = false

/**
 * Verifica que la tabla usuarios tenga la estructura correcta
 * @returns {Promise<boolean>} true si la estructura es válida
 * @throws {Error} Si la estructura de la tabla es inválida
 */
async function verifyUserTableSchema() {
  if (schemaVerified) return true

  try {
    const [rows] = await pool.query('DESCRIBE usuarios')
    const columns = new Set(rows.map(r => r.Field))
    const requiredColumns = ['cedula', 'nombre', 'apellido', 'email', 'password_hash', 'rol', 'activo']

    const missingColumns = requiredColumns.filter(col => !columns.has(col))
    if (missingColumns.length > 0) {
      throw new Error(`Estructura de tabla usuarios inválida. Faltan columnas: ${missingColumns.join(', ')}`)
    }

    schemaVerified = true
    return true
  } catch (error) {
    console.error('[user.service] Error al verificar esquema:', error)
    throw error
  }
}

/**
 * Obtiene un usuario por su email
 * @param {string} email - Email del usuario
 * @returns {Promise<object|null>} Usuario encontrado o null
 */
async function getUserByEmail(email) {
  if (!email || typeof email !== 'string') {
    return null
  }

  try {
    await verifyUserTableSchema()

    const [rows] = await pool.query(
      `SELECT cedula, nombre, apellido, email, password_hash, rol, activo 
       FROM usuarios 
       WHERE email = ? 
       LIMIT 1`,
      [email.trim().toLowerCase()]
    )

    return rows[0] || null
  } catch (error) {
    console.error('[user.service] Error al buscar usuario por email:', error)
    throw error
  }
}

/**
 * Obtiene un usuario por su cédula
 * @param {number} cedula - Cédula del usuario
 * @returns {Promise<object|null>} Usuario encontrado o null
 */
async function getUserByCedula(cedula) {
  if (!cedula || isNaN(Number(cedula)) || Number(cedula) <= 0) {
    return null
  }

  try {
    await verifyUserTableSchema()

    const [rows] = await pool.query(
      `SELECT cedula, nombre, apellido, email, password_hash, rol, activo 
       FROM usuarios 
       WHERE cedula = ? 
       LIMIT 1`,
      [Number(cedula)]
    )

    return rows[0] || null
  } catch (error) {
    console.error('[user.service] Error al buscar usuario por cédula:', error)
    throw error
  }
}

module.exports = {
  verifyUserTableSchema,
  getUserByEmail,
  getUserByCedula,
  getAllUsers,
  createUser,
  updateUser,
  toggleUserStatus,
  changeUserRole,
  updateUserPassword,
}

/**
 * Obtiene lista de usuarios con filtros opcionales
 * @param {object} filters - Filtros { rol, activo, search }
 * @returns {Promise<Array>} Lista de usuarios
 */
async function getAllUsers(filters = {}) {
  try {
    await verifyUserTableSchema();

    let query = `
      SELECT cedula, nombre, apellido, email, rol, activo, 
             fecha_creacion, fecha_actualizacion
      FROM usuarios
      WHERE 1=1
    `;
    const params = [];

    if (filters.rol) {
      query += ' AND rol = ?';
      params.push(filters.rol);
    }

    if (filters.activo !== undefined) {
      query += ' AND activo = ?';
      params.push(filters.activo ? 1 : 0);
    }

    if (filters.search) {
      query += ' AND (nombre LIKE ? OR apellido LIKE ? OR email LIKE ? OR cedula LIKE ?)';
      const searchPattern = `%${filters.search}%`;
      params.push(searchPattern, searchPattern, searchPattern, searchPattern);
    }

    query += ' ORDER BY fecha_creacion DESC';

    const [rows] = await pool.query(query, params);
    return rows;
  } catch (error) {
    console.error('[user.service] Error en getAllUsers:', error);
    throw error;
  }
}

/**
 * Crea un nuevo usuario
 * @param {object} userData - Datos del usuario
 * @returns {Promise<number>} Cédula del usuario creado
 */
async function createUser(userData) {
  try {
    await verifyUserTableSchema();

    const { cedula, nombre, apellido, email, password_hash, rol, activo } = userData;

    // Verificar si ya existe
    const existingByCedula = await getUserByCedula(cedula);
    if (existingByCedula) {
      throw new Error('Ya existe un usuario con esa cédula');
    }

    if (email) {
      const existingByEmail = await getUserByEmail(email);
      if (existingByEmail) {
        throw new Error('Ya existe un usuario con ese email');
      }
    }

    const [result] = await pool.query(
      `INSERT INTO usuarios 
       (cedula, nombre, apellido, email, password_hash, rol, activo, fecha_creacion, fecha_actualizacion) 
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [Number(cedula), nombre, apellido, email || null, password_hash, rol, activo ? 1 : 0]
    );

    return Number(cedula);
  } catch (error) {
    console.error('[user.service] Error en createUser:', error);
    throw error;
  }
}

/**
 * Actualiza datos de un usuario
 * @param {number} cedula - Cédula del usuario
 * @param {object} updateData - Datos a actualizar
 * @returns {Promise<boolean>} true si se actualizó
 */
async function updateUser(cedula, updateData) {
  try {
    await verifyUserTableSchema();

    const user = await getUserByCedula(cedula);
    if (!user) {
      return false;
    }

    // Si se está actualizando email, verificar que no esté en uso
    if (updateData.email && updateData.email !== user.email) {
      const existingByEmail = await getUserByEmail(updateData.email);
      if (existingByEmail && existingByEmail.cedula !== Number(cedula)) {
        throw new Error('El email ya está en uso por otro usuario');
      }
    }

    const fields = [];
    const values = [];

    if (updateData.nombre) {
      fields.push('nombre = ?');
      values.push(updateData.nombre);
    }
    if (updateData.apellido) {
      fields.push('apellido = ?');
      values.push(updateData.apellido);
    }
    if (updateData.email !== undefined) {
      fields.push('email = ?');
      values.push(updateData.email || null);
    }

    if (fields.length === 0) {
      return true;
    }

    fields.push('fecha_actualizacion = NOW()');
    values.push(Number(cedula));

    const [result] = await pool.query(
      `UPDATE usuarios SET ${fields.join(', ')} WHERE cedula = ?`,
      values
    );

    return result.affectedRows > 0;
  } catch (error) {
    console.error('[user.service] Error en updateUser:', error);
    throw error;
  }
}

/**
 * Activa o desactiva un usuario
 * @param {number} cedula - Cédula del usuario
 * @param {number} adminCedula - Cédula del admin que hace el cambio
 * @returns {Promise<boolean>} true si se actualizó
 */
async function toggleUserStatus(cedula, adminCedula) {
  try {
    await verifyUserTableSchema();

    // No permitir que un usuario se desactive a sí mismo
    if (adminCedula && Number(cedula) === Number(adminCedula)) {
      throw new Error('No puedes desactivar tu propia cuenta');
    }

    const [result] = await pool.query(
      `UPDATE usuarios 
       SET activo = NOT activo, fecha_actualizacion = NOW() 
       WHERE cedula = ?`,
      [Number(cedula)]
    );

    return result.affectedRows > 0;
  } catch (error) {
    console.error('[user.service] Error en toggleUserStatus:', error);
    throw error;
  }
}

/**
 * Cambia el rol de un usuario
 * @param {number} cedula - Cédula del usuario
 * @param {string} newRol - Nuevo rol
 * @param {number} adminCedula - Cédula del admin que hace el cambio
 * @returns {Promise<boolean>} true si se actualizó
 */
async function changeUserRole(cedula, newRol, adminCedula) {
  try {
    await verifyUserTableSchema();

    const rolesPermitidos = ['administrador', 'coordinador', 'instructor'];
    if (!rolesPermitidos.includes(newRol)) {
      throw new Error(`Rol inválido. Roles permitidos: ${rolesPermitidos.join(', ')}`);
    }

    // No permitir que un usuario cambie su propio rol
    if (adminCedula && Number(cedula) === Number(adminCedula)) {
      throw new Error('No puedes cambiar tu propio rol');
    }

    const [result] = await pool.query(
      `UPDATE usuarios 
       SET rol = ?, fecha_actualizacion = NOW() 
       WHERE cedula = ?`,
      [newRol, Number(cedula)]
    );

    return result.affectedRows > 0;
  } catch (error) {
    console.error('[user.service] Error en changeUserRole:', error);
    throw error;
  }
}

/**
 * Actualiza la contraseña de un usuario
 * @param {number} cedula - Cédula del usuario
 * @param {string} password_hash - Hash de la nueva contraseña
 * @returns {Promise<boolean>} true si se actualizó
 */
async function updateUserPassword(cedula, password_hash) {
  try {
    await verifyUserTableSchema();

    const [result] = await pool.query(
      `UPDATE usuarios 
       SET password_hash = ?, fecha_actualizacion = NOW() 
       WHERE cedula = ?`,
      [password_hash, Number(cedula)]
    );

    return result.affectedRows > 0;
  } catch (error) {
    console.error('[user.service] Error en updateUserPassword:', error);
    throw error;
  }
}
