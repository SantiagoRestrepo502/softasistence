/**
 * Servicio de Aprendiz
 * Contiene la lógica de acceso a datos de aprendices
 * Actualizado para trabajar con MediaPipe (embeddings de ~190 dimensiones)
 */

const { pool } = require('../db')

let schemaVerified = false



/**
 * Verifica que la tabla aprendices tenga la estructura correcta
 * @returns {Promise<boolean>} true si la estructura es válida
 * @throws {Error} Si la estructura de la tabla es inválida
 */
async function verifyAprendizTableSchema() {
  if (schemaVerified) return true

  try {
    const [rows] = await pool.query('DESCRIBE aprendices')
    const columns = new Set(rows.map(r => r.Field))
    const requiredColumns = ['id_aprendices', 'documento', 'tipo_documento', 'nombres', 'apellidos', 'email', 'telefono', 'activo', 'fecha_creacion']

    const missingColumns = requiredColumns.filter(col => !columns.has(col))
    if (missingColumns.length > 0) {
      throw new Error(`Estructura de tabla aprendices inválida. Faltan columnas: ${missingColumns.join(', ')}`)
    }

    schemaVerified = true
    return true
  } catch (error) {
    if (error.code === 'ER_NO_SUCH_TABLE') {
      throw new Error('La tabla aprendices no existe en la base de datos')
    }
    throw error
  }
}

/**
 * Crea un nuevo aprendiz
 * @param {object} aprendizData - Datos del aprendiz
 * @param {string|number} aprendizData.documento - Número de documento (se almacena como VARCHAR)
 * @param {string} aprendizData.tipo_documento - Tipo de documento (CC, TI, CE, PASAPORTE)
 * @param {string} aprendizData.nombres - Nombres del aprendiz
 * @param {string} aprendizData.apellidos - Apellidos del aprendiz
 * @param {string} aprendizData.email - Email del aprendiz
 * @param {string|null} aprendizData.telefono - Teléfono del aprendiz (opcional)
 * @param {boolean} aprendizData.activo - Estado activo del aprendiz
 * @param {Array|string|null} aprendizData.face_descriptor - Embedding de MediaPipe (~190 dimensiones)
 * @param {string|null} aprendizData.fk_codigo_formacion - Código de la formación a vincular
 * @returns {Promise<{id: number, documento: string}>} ID del aprendiz creado
 * @throws {Error} Si hay un error al crear el aprendiz
 */
async function createAprendiz(aprendizData) {
  const { documento, tipo_documento, nombres, apellidos, email, telefono, activo, fk_codigo_formacion, face_descriptor } = aprendizData

  try {
    await verifyAprendizTableSchema()

    // Validar y normalizar documento
    const docStr = String(documento).replace(/\D/g, '')
    if (!docStr || docStr.length === 0) {
      throw new Error('documento inválido: debe contener al menos un dígito')
    }
    if (docStr.length > 50) {
      throw new Error('documento inválido: excede la longitud máxima (50 caracteres)')
    }

    // Validar tipo de documento
    const tipoNorm = String(tipo_documento).trim().toUpperCase();
    const allowedTypes = ['CC', 'TI', 'CE', 'PASAPORTE'];

    let tipoVal = tipoNorm;
    if (tipoNorm === 'CEDULA') tipoVal = 'CC';
    if (tipoNorm === 'TARJETA_IDENTIDAD' || tipoNorm === 'TARJETA DE IDENTIDAD') tipoVal = 'TI';
    if (tipoNorm === 'PAS') tipoVal = 'PASAPORTE';

    if (!allowedTypes.includes(tipoVal)) {
      throw new Error(`tipo_documento inválido. Valores permitidos: ${allowedTypes.join(', ')}`);
    }

    // Validar email
    const emailStr = String(email).trim().toLowerCase()
    const emailRegex = /^\S+@\S+\.\S+$/
    if (!emailRegex.test(emailStr)) {
      throw new Error('email inválido')
    }

    // Validar nombres y apellidos
    const nombresStr = String(nombres).trim()
    const apellidosStr = String(apellidos).trim()

    if (!nombresStr || nombresStr.length === 0) {
      throw new Error('nombres es obligatorio')
    }

    if (!apellidosStr || apellidosStr.length === 0) {
      throw new Error('apellidos es obligatorio')
    }

    const telStr = telefono ? String(telefono).replace(/\D/g, '') : null
    const activoVal = typeof activo === 'boolean' ? activo : (activo !== undefined ? Boolean(activo) : true)

    // Procesar face_descriptor (Array de números o JSON string)
    let faceDescriptorVal = null;
    if (face_descriptor) {
      try {
        // Si es array, convertir a string
        if (Array.isArray(face_descriptor)) {
          faceDescriptorVal = JSON.stringify(face_descriptor);
        } else if (typeof face_descriptor === 'string') {
          // Verificar si es JSON válido
          JSON.parse(face_descriptor);
          faceDescriptorVal = face_descriptor;
        }
      } catch (e) {
        console.warn('[aprendiz.service] Error procesando face_descriptor:', e);
        faceDescriptorVal = null;
      }
    }



    // Preparar datos para inserción
    const insertData = {
      documento: docStr,
      tipo_documento: tipoVal,
      nombres: nombresStr,
      apellidos: apellidosStr,
      email: emailStr,
      telefono: telStr,
      activo: activoVal ? 1 : 0,
      face_descriptor: faceDescriptorVal
    }

    // Insertar en la base de datos
    const [result] = await pool.query(
      'INSERT INTO aprendices (documento, tipo_documento, nombres, apellidos, email, telefono, activo, face_descriptor, fecha_creacion) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())',
      [insertData.documento, insertData.tipo_documento, insertData.nombres, insertData.apellidos, insertData.email, insertData.telefono, insertData.activo, insertData.face_descriptor]
    )

    const newAprendizId = result.insertId;

    // Si hay formación, crear relación
    if (fk_codigo_formacion) {
      try {
        await pool.query(
          'INSERT INTO formaciones_aprendices (fk_codigo_formacion, id_aprendiz) VALUES (?, ?)',
          [fk_codigo_formacion, newAprendizId]
        );
        console.log(`[aprendiz.service] Relación creada con formación ${fk_codigo_formacion}`);
      } catch (relError) {
        console.error('[aprendiz.service] Error al crear relación con formación:', relError.message);
      }
    }

    console.log('[aprendiz.service] ✓ Aprendiz creado exitosamente:', {
      id: newAprendizId,
      documento: insertData.documento,
    });

    return {
      id: newAprendizId,
      documento: insertData.documento
    };
  } catch (error) {
    // Manejar errores específicos de MySQL
    if (error.code === 'ER_DUP_ENTRY') {
      const sqlMessage = (error.sqlMessage || '').toLowerCase()
      if (sqlMessage.includes('documento') || sqlMessage.includes('primary') || sqlMessage.includes('id_aprendices')) {
        throw new Error('Ya existe un aprendiz con este documento')
      }
      if (sqlMessage.includes('email') || sqlMessage.includes('uk_email')) {
        throw new Error('Ya existe un aprendiz con este email')
      }
      throw new Error('El aprendiz ya existe (duplicado)')
    }

    if (error.code === 'ER_NO_SUCH_TABLE') {
      throw new Error('La tabla aprendices no existe en la base de datos')
    }

    if (error.code === 'ER_BAD_FIELD_ERROR') {
      throw new Error(`Campo inválido en la tabla: ${error.sqlMessage || 'campo desconocido'}`)
    }

    if (error.code === 'ER_TRUNCATED_WRONG_VALUE_FOR_FIELD') {
      throw new Error(`Error de tipo de dato: ${error.sqlMessage || 'valor incompatible con el campo'}`)
    }

    // Re-lanzar errores de validación personalizados
    if (error.message && (
      error.message.includes('inválido') ||
      error.message.includes('obligatorio') ||
      error.message.includes('no existe')
    )) {
      throw error
    }

    // Error genérico con más detalles
    const errorMsg = error.sqlMessage || error.message || 'Error desconocido'
    throw new Error(`Error al crear aprendiz: ${errorMsg}`)
  }
}

/**
 * Actualiza un aprendiz existente
 * @param {number} id - ID del aprendiz
 * @param {object} updateData - Datos a actualizar
 * @returns {Promise<boolean>} true si se actualizó correctamente
 */
async function updateAprendiz(id, updateData) {
  const { documento, tipo_documento, nombres, apellidos, email, telefono, fk_codigo_formacion } = updateData;

  try {
    await verifyAprendizTableSchema();

    if (!id) throw new Error('ID de aprendiz requerido');

    const updates = [];
    const values = [];

    if (documento) {
      const docStr = String(documento).replace(/\D/g, '');
      if (docStr.length > 0) {
        updates.push('documento = ?');
        values.push(docStr);
      }
    }

    if (tipo_documento) {
      const tipoNorm = String(tipo_documento).trim().toUpperCase();
      let tipoVal = tipoNorm;
      if (tipoNorm === 'CEDULA') tipoVal = 'CC';
      if (tipoNorm === 'TARJETA_IDENTIDAD' || tipoNorm === 'TARJETA DE IDENTIDAD') tipoVal = 'TI';
      if (tipoNorm === 'PAS') tipoVal = 'PASAPORTE';

      updates.push('tipo_documento = ?');
      values.push(tipoVal);
    }

    if (nombres) {
      updates.push('nombres = ?');
      values.push(String(nombres).trim());
    }
    if (apellidos) {
      updates.push('apellidos = ?');
      values.push(String(apellidos).trim());
    }
    if (email) {
      updates.push('email = ?');
      values.push(String(email).trim().toLowerCase());
    }
    if (telefono !== undefined) {
      updates.push('telefono = ?');
      values.push(telefono ? String(telefono).replace(/\D/g, '') : null);
    }

    if (updates.length > 0) {
      values.push(id);
      await pool.query(`UPDATE aprendices SET ${updates.join(', ')} WHERE id_aprendices = ?`, values);
    }

    // Actualizar formación si se proporciona
    if (fk_codigo_formacion) {
      const [existing] = await pool.query('SELECT id_relacion FROM formaciones_aprendices WHERE id_aprendiz = ?', [id]);

      if (existing.length > 0) {
        await pool.query('UPDATE formaciones_aprendices SET fk_codigo_formacion = ? WHERE id_aprendiz = ?', [fk_codigo_formacion, id]);
      } else {
        await pool.query('INSERT INTO formaciones_aprendices (fk_codigo_formacion, id_aprendiz) VALUES (?, ?)', [fk_codigo_formacion, id]);
      }
    }

    return true;
  } catch (error) {
    console.error('[aprendiz.service] Error al actualizar aprendiz:', error);
    throw error;
  }
}

/**
 * Cambia el estado activo/inactivo de un aprendiz
 * @param {number} id - ID del aprendiz
 * @returns {Promise<boolean>} Nuevo estado
 */
async function toggleAprendizStatus(id) {
  try {
    const [rows] = await pool.query('SELECT activo FROM aprendices WHERE id_aprendices = ?', [id]);
    if (rows.length === 0) throw new Error('Aprendiz no encontrado');

    const nuevoEstado = !rows[0].activo;
    await pool.query('UPDATE aprendices SET activo = ? WHERE id_aprendices = ?', [nuevoEstado, id]);

    return nuevoEstado;
  } catch (error) {
    console.error('[aprendiz.service] Error al cambiar estado:', error);
    throw error;
  }
}

/**
 * Obtiene un aprendiz por su documento
 * @param {number} documento - Número de documento del aprendiz
 * @returns {Promise<object|null>} Aprendiz encontrado o null
 */
async function getAprendizByDocumento(documento) {
  if (!documento) return null

  const docStr = String(documento).replace(/\D/g, '')
  if (!docStr || docStr.length === 0) return null

  try {
    await verifyAprendizTableSchema()

    const [rows] = await pool.query(
      `SELECT 
        a.id_aprendices, a.documento, a.tipo_documento, a.nombres, a.apellidos, a.email, a.telefono, a.activo, a.fecha_creacion,
        f.codigo as formacion_codigo, f.nombre as formacion_nombre
       FROM aprendices a
       LEFT JOIN formaciones_aprendices fa ON a.id_aprendices = fa.id_aprendiz
       LEFT JOIN formaciones f ON fa.fk_codigo_formacion = f.codigo
       WHERE a.documento = ? 
       LIMIT 1`,
      [docStr]
    )

    return rows[0] || null
  } catch (error) {
    console.error('[aprendiz.service] Error al buscar aprendiz por documento:', error)
    throw error
  }
}

/**
 * Obtiene un aprendiz por su email
 * @param {string} email - Email del aprendiz
 * @returns {Promise<object|null>} Aprendiz encontrado o null
 */
async function getAprendizByEmail(email) {
  if (!email || typeof email !== 'string') return null

  try {
    await verifyAprendizTableSchema()

    const [rows] = await pool.query(
      `SELECT 
        a.id_aprendices, a.documento, a.tipo_documento, a.nombres, a.apellidos, a.email, a.telefono, a.activo, a.fecha_creacion,
        f.codigo as formacion_codigo, f.nombre as formacion_nombre
       FROM aprendices a
       LEFT JOIN formaciones_aprendices fa ON a.id_aprendices = fa.id_aprendiz
       LEFT JOIN formaciones f ON fa.fk_codigo_formacion = f.codigo
       WHERE a.email = ? 
       LIMIT 1`,
      [email.trim().toLowerCase()]
    )

    return rows[0] || null
  } catch (error) {
    console.error('[aprendiz.service] Error al buscar aprendiz por email:', error)
    throw error
  }
}

/**
 * Obtiene todos los aprendices
 * @returns {Promise<Array>} Lista de aprendices
 */
async function getAllAprendices() {
  try {
    await verifyAprendizTableSchema()

    const [rows] = await pool.query(
      `SELECT 
        a.id_aprendices, 
        a.documento, 
        a.tipo_documento, 
        a.nombres, 
        a.apellidos, 
        a.email, 
        a.telefono, 
        a.activo, 
        a.fecha_creacion,
        f.codigo as formacion_codigo,
        f.nombre as formacion_nombre
      FROM aprendices a
      LEFT JOIN formaciones_aprendices fa ON a.id_aprendices = fa.id_aprendiz
      LEFT JOIN formaciones f ON fa.fk_codigo_formacion = f.codigo
      ORDER BY a.fecha_creacion DESC`
    )

    return rows
  } catch (error) {
    console.error('[aprendiz.service] Error al obtener aprendices:', error)
    throw error
  }
}

module.exports = {
  verifyAprendizTableSchema,
  createAprendiz,
  updateAprendiz,
  toggleAprendizStatus,
  getAprendizByDocumento,
  getAprendizByEmail,
  getAllAprendices,
}
