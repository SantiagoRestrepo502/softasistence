/**
 * Servicio de Formaciones
 * Contiene la lógica de acceso a datos de formaciones
 */

const { pool } = require('../db');

/**
 * Obtiene lista de formaciones con filtros opcionales
 * @param {object} filters - Filtros { jornada, activo, search }
 * @returns {Promise<Array>} Lista de formaciones
 */
async function getAllFormaciones(filters = {}) {
    try {
        let query = `
      SELECT f.codigo, f.nombre, f.jornada, 
             f.fecha_inicio, f.fecha_fin, f.activo,
             f.created_at as fecha_creacion,
             COUNT(DISTINCT fa.id_aprendiz) as total_aprendices
      FROM formaciones f
      LEFT JOIN formaciones_aprendices fa ON f.codigo = fa.fk_codigo_formacion
      WHERE 1=1
    `;
        const params = [];

        if (filters.jornada) {
            query += ' AND f.jornada = ?';
            params.push(filters.jornada);
        }

        if (filters.activo !== undefined) {
            query += ' AND f.activo = ?';
            params.push(filters.activo ? 1 : 0);
        }

        if (filters.search) {
            query += ' AND (f.codigo LIKE ? OR f.nombre LIKE ?)';
            const searchPattern = `%${filters.search}%`;
            params.push(searchPattern, searchPattern);
        }

        query += ' GROUP BY f.codigo ORDER BY f.created_at DESC';

        const [rows] = await pool.query(query, params);
        return rows;
    } catch (error) {
        console.error('[formacion.service] Error en getAllFormaciones:', error);
        throw error;
    }
}

/**
 * Obtiene una formación por Código
 * @param {string} codigo - Código de la formación
 * @returns {Promise<object|null>} Formación encontrada o null
 */
async function getFormacionByCodigo(codigo) {
    try {
        const [rows] = await pool.query(
            `SELECT f.*, COUNT(DISTINCT fa.id_aprendiz) as total_aprendices
       FROM formaciones f
       LEFT JOIN formaciones_aprendices fa ON f.codigo = fa.fk_codigo_formacion
       WHERE f.codigo = ?
       GROUP BY f.codigo
       LIMIT 1`,
            [codigo]
        );

        return rows[0] || null;
    } catch (error) {
        console.error('[formacion.service] Error en getFormacionByCodigo:', error);
        throw error;
    }
}

/**
 * Crea una nueva formación
 * @param {object} formacionData - Datos de la formación
 * @returns {Promise<number>} ID de la formación creada
 */
async function createFormacion(formacionData) {
    try {
        const { codigo, nombre, jornada, fecha_inicio, fecha_fin, activo } = formacionData;

        // Verificar si ya existe una formación con ese código
        const [existing] = await pool.query(
            'SELECT codigo FROM formaciones WHERE codigo = ? LIMIT 1',
            [codigo]
        );

        if (existing.length > 0) {
            throw new Error('Ya existe una formación con ese código');
        }

        // Validar fechas
        if (fecha_fin && new Date(fecha_inicio) > new Date(fecha_fin)) {
            throw new Error('La fecha de inicio no puede ser posterior a la fecha de fin');
        }

        const [result] = await pool.query(
            `INSERT INTO formaciones 
       (codigo, nombre, jornada, fecha_inicio, fecha_fin, activo, created_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
            [codigo, nombre, jornada, fecha_inicio, fecha_fin || null, activo ? 1 : 0]
        );

        return codigo;
    } catch (error) {
        console.error('[formacion.service] Error en createFormacion:', error);
        throw error;
    }
}

/**
 * Actualiza una formación
 * @param {string} codigo - Código de la formación (PK actual)
 * @param {object} updateData - Datos a actualizar
 * @returns {Promise<boolean>} true si se actualizó
 */
async function updateFormacion(codigo, updateData) {
    try {
        const formacion = await getFormacionByCodigo(codigo);
        if (!formacion) {
            return false;
        }

        // Si se intenta cambiar el código (PK), verificar que el nuevo no exista
        if (updateData.codigo && updateData.codigo !== codigo) {
            const [existing] = await pool.query(
                'SELECT codigo FROM formaciones WHERE codigo = ? LIMIT 1',
                [updateData.codigo]
            );

            if (existing.length > 0) {
                throw new Error('El nuevo código ya está en uso por otra formación');
            }
        }

        const fields = [];
        const values = [];

        if (updateData.codigo) {
            fields.push('codigo = ?');
            values.push(updateData.codigo);
        }
        if (updateData.nombre) {
            fields.push('nombre = ?');
            values.push(updateData.nombre);
        }
        if (updateData.jornada) {
            fields.push('jornada = ?');
            values.push(updateData.jornada);
        }
        if (updateData.fecha_inicio) {
            fields.push('fecha_inicio = ?');
            values.push(updateData.fecha_inicio);
        }
        if (updateData.fecha_fin !== undefined) {
            fields.push('fecha_fin = ?');
            values.push(updateData.fecha_fin || null);
        }

        if (fields.length === 0) {
            return true;
        }

        // fields.push('fecha_actualizacion = NOW()'); // Column does not exist in DB
        values.push(codigo);

        const [result] = await pool.query(
            `UPDATE formaciones SET ${fields.join(', ')} WHERE codigo = ?`,
            values
        );

        return result.affectedRows > 0;
    } catch (error) {
        console.error('[formacion.service] Error en updateFormacion:', error);
        throw error;
    }
}

/**
 * Activa o desactiva una formación
 * @param {string} codigo - Código de la formación
 * @returns {Promise<boolean>} true si se actualizó
 */
async function toggleFormacionStatus(codigo) {
    try {
        const [result] = await pool.query(
            `UPDATE formaciones 
       SET activo = NOT activo 
       WHERE codigo = ?`,
            [codigo]
        );

        return result.affectedRows > 0;
    } catch (error) {
        console.error('[formacion.service] Error en toggleFormacionStatus:', error);
        throw error;
    }
}

/**
 * Elimina una formación permanentemente
 * @param {string} codigo - Código de la formación
 * @returns {Promise<boolean>} true si se eliminó
 */
async function deleteFormacion(codigo) {
    try {
        // Eliminar formación
        const [result] = await pool.query(
            'DELETE FROM formaciones WHERE codigo = ?',
            [codigo]
        );

        return result.affectedRows > 0;
    } catch (error) {
        console.error('[formacion.service] Error en deleteFormacion:', error);

        // Error de foreign key
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            throw new Error('No se puede eliminar la formación porque tiene registros asociados');
        }

        throw error;
    }
}

module.exports = {
    getAllFormaciones,
    getFormacionByCodigo,
    createFormacion,
    updateFormacion,
    toggleFormacionStatus,
    deleteFormacion,
};
