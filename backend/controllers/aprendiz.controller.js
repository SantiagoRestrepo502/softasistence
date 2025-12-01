/**
 * Controlador de Aprendiz
 * Maneja las peticiones HTTP relacionadas con aprendices
 */

const { createAprendiz, getAprendizByDocumento, getAprendizByEmail, getAllAprendices, updateAprendiz, toggleAprendizStatus } = require('../services/aprendiz.service');

/**
 * Controlador para crear un nuevo aprendiz
 * POST /api/aprendices
 * 
 * @param {object} req - Request object de Express
 * @param {object} res - Response object de Express
 */
async function create(req, res) {
  try {
    const { documento, tipo_documento, nombres, apellidos, email, telefono, activo, face_descriptor, fk_codigo_formacion, ficha } = req.body;

    // Validar campos obligatorios
    if (!documento || !tipo_documento || !nombres || !apellidos || !email) {
      return res.status(400).json({
        ok: false,
        error: 'documento, tipo_documento, nombres, apellidos y email son obligatorios'
      });
    }

    // Resolver fk_codigo_formacion desde ficha si es necesario
    let finalCodigoFormacion = fk_codigo_formacion;
    if (!finalCodigoFormacion && ficha) {
      try {
        const { pool } = require('../db');
        const [rows] = await pool.query('SELECT codigo FROM formaciones WHERE codigo = ?', [ficha]);

        if (rows.length > 0) {
          finalCodigoFormacion = rows[0].codigo;
        } else {
          // Crear formación si no existe
          await pool.query('INSERT INTO formaciones (codigo, nombre) VALUES (?, ?)', [ficha, `Ficha ${ficha}`]);
          finalCodigoFormacion = ficha;
          console.log(`[aprendiz.controller] Formación creada automáticamente para ficha ${ficha}`);
        }
      } catch (err) {
        console.error('[aprendiz.controller] Error al resolver ficha:', err);
        // No bloqueamos el registro, pero logueamos el error
      }
    }

    // Validar face_descriptor si se proporciona (debe ser array de MediaPipe ~120 dimensiones)
    if (face_descriptor && !Array.isArray(face_descriptor)) {
      console.warn(`[aprendiz.controller] face_descriptor inválido: debe ser un array`);
      // No bloqueamos, pero convertimos face_descriptor a null
      face_descriptor = null;
    }

    // Log para debugging
    if (face_descriptor) {
      console.log(`[aprendiz.controller] ✅ face_descriptor recibido: ${face_descriptor.length} dimensiones`);
    } else {
      console.log(`[aprendiz.controller] ⚠️ No se recibió face_descriptor`);
    }

    // Crear aprendiz usando el servicio
    const result = await createAprendiz({
      documento,
      tipo_documento,
      nombres,
      apellidos,
      email,
      telefono,
      activo,
      face_descriptor, // Ya es un array plano de 512 números de InsightFace
      fk_codigo_formacion: finalCodigoFormacion
    });

    return res.status(201).json({
      ok: true,
      id: result.id,
      documento: result.documento
    });
  } catch (error) {
    console.error('[aprendiz.controller] Error en create:', {
      message: error.message,
      code: error.code
    })


    // Manejar errores específicos
    const errorMessage = error.message || 'Error desconocido'

    if (errorMessage.includes('no existe')) {
      return res.status(500).json({
        ok: false,
        error: errorMessage,
        code: error?.code || null
      })
    }

    if (errorMessage.includes('Ya existe') || errorMessage.includes('duplicado')) {
      return res.status(409).json({
        ok: false,
        error: errorMessage,
        code: error?.code || null
      })
    }

    if (errorMessage.includes('inválido') || errorMessage.includes('obligatorio')) {
      return res.status(400).json({
        ok: false,
        error: errorMessage,
        code: error?.code || null
      })
    }

    // Error genérico con más información para debugging
    return res.status(500).json({
      ok: false,
      error: errorMessage,
      code: error?.code || null,
      sqlMessage: error?.sqlMessage || null,
      // Solo incluir detalles adicionales en desarrollo
      ...(process.env.NODE_ENV !== 'production' && {
        details: error.stack
      })
    })
  }
}

/**
 * Controlador para obtener un aprendiz por documento
 * GET /api/aprendices/:documento
 * 
 * @param {object} req - Request object de Express
 * @param {object} res - Response object de Express
 */
async function getByDocumento(req, res) {
  try {
    const { documento } = req.params

    if (!documento) {
      return res.status(400).json({
        ok: false,
        error: 'documento es requerido'
      })
    }

    const aprendiz = await getAprendizByDocumento(documento)

    if (!aprendiz) {
      return res.status(404).json({
        ok: false,
        error: 'Aprendiz no encontrado'
      })
    }

    return res.status(200).json({
      ok: true,
      data: aprendiz
    })
  } catch (error) {
    // console.error('[aprendiz.controller] Error en getByDocumento:', error)
    return res.status(500).json({
      ok: false,
      error: error.message || 'Error al buscar aprendiz'
    })
  }
}

/**
 * Controlador para obtener todos los aprendices
 * GET /api/aprendices
 * 
 * @param {object} req - Request object de Express
 * @param {object} res - Response object de Express
 */
async function getAll(req, res) {
  try {
    const aprendices = await getAllAprendices()

    return res.status(200).json({
      ok: true,
      data: { aprendices }
    })
  } catch (error) {
    // console.error('[aprendiz.controller] Error en getAll:', error)
    return res.status(500).json({
      ok: false,
      error: error.message || 'Error al obtener aprendices'
    })
  }
}

module.exports = {
  create,
  getByDocumento,
  getAll,
  deleteAprendiz,
  update,
  toggleStatus
}

/**
 * Controlador para actualizar un aprendiz
 * PUT /api/aprendices/:id
 */
async function update(req, res) {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!id) return res.status(400).json({ ok: false, error: 'ID requerido' });

    await updateAprendiz(id, updateData);

    return res.status(200).json({
      ok: true,
      message: 'Aprendiz actualizado exitosamente'
    });
  } catch (error) {
    // console.error('[aprendiz.controller] Error en update:', error);
    return res.status(500).json({
      ok: false,
      error: error.message || 'Error al actualizar aprendiz'
    });
  }
}

/**
 * Controlador para cambiar estado de un aprendiz
 * PUT /api/aprendices/:id/toggle
 */
async function toggleStatus(req, res) {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ ok: false, error: 'ID requerido' });

    const nuevoEstado = await toggleAprendizStatus(id);

    return res.status(200).json({
      ok: true,
      message: `Aprendiz ${nuevoEstado ? 'activado' : 'desactivado'} exitosamente`,
      activo: nuevoEstado
    });
  } catch (error) {
    // console.error('[aprendiz.controller] Error en toggleStatus:', error);
    return res.status(500).json({
      ok: false,
      error: error.message || 'Error al cambiar estado'
    });
  }
}

/**
 * Controlador para eliminar un aprendiz
 * DELETE /api/aprendices/:id
 * 
 * @param {object} req - Request object de Express
 * @param {object} res - Response object de Express
 */
async function deleteAprendiz(req, res) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        ok: false,
        error: 'ID es requerido'
      });
    }

    // Verificar si el aprendiz existe
    const { pool } = require('../db');
    const [rows] = await pool.query('SELECT * FROM aprendices WHERE id_aprendices = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({
        ok: false,
        error: 'Aprendiz no encontrado'
      });
    }

    // Verificar si tiene asistencias registradas
    const [asistencias] = await pool.query('SELECT COUNT(*) as count FROM asistencias WHERE documento = ?', [rows[0].documento]);

    if (asistencias[0].count > 0) {
      return res.status(400).json({
        ok: false,
        error: 'No se puede eliminar un aprendiz con asistencias registradas. Desactívalo en su lugar.',
        message: `El aprendiz tiene ${asistencias[0].count} asistencias registradas`
      });
    }

    // Eliminar relaciones con formaciones
    await pool.query('DELETE FROM formaciones_aprendices WHERE id_aprendiz = ?', [id]);

    // Eliminar aprendiz
    await pool.query('DELETE FROM aprendices WHERE id_aprendices = ?', [id]);

    return res.status(200).json({
      ok: true,
      message: 'Aprendiz eliminado exitosamente'
    });
  } catch (error) {
    // console.error('[aprendiz.controller] Error en deleteAprendiz:', error);
    return res.status(500).json({
      ok: false,
      error: error.message || 'Error al eliminar aprendiz'
    });
  }
}

