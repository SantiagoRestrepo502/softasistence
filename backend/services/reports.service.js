/**
 * Servicio de Reportes
 * Genera estadísticas y reportes de asistencia
 */

const { pool } = require('../db');

/**
 * Obtiene estadísticas generales del sistema
 * @param {object} options - Opciones { startDate, endDate }
 * @returns {Promise<object>} Estadísticas generales
 */
async function getGeneralStatistics(options = {}) {
    try {
        const { startDate, endDate } = options;

        // Total de usuarios activos por rol
        const [usuarios] = await pool.query(`
      SELECT rol, COUNT(*) as total, SUM(activo) as activos
      FROM usuarios
      GROUP BY rol
    `);

        // Total de aprendices
        const [aprendices] = await pool.query(`
      SELECT COUNT(*) as total, SUM(activo) as activos
      FROM APRENDICES
    `);

        // Total de formaciones
        const [formaciones] = await pool.query(`
      SELECT COUNT(*) as total, SUM(activo) as activos
      FROM FORMACIONES
    `);

        // Asistencias en el rango de fechas
        let asistenciaQuery = 'SELECT COUNT(*) as total FROM ASISTENCIAS WHERE 1=1';
        const asistenciaParams = [];

        if (startDate) {
            asistenciaQuery += ' AND DATE(fecha) >= ?';
            asistenciaParams.push(startDate);
        }
        if (endDate) {
            asistenciaQuery += ' AND DATE(fecha) <= ?';
            asistenciaParams.push(endDate);
        }

        const [asistencias] = await pool.query(asistenciaQuery, asistenciaParams);

        return {
            usuarios: {
                total: usuarios.reduce((sum, u) => sum + u.total, 0),
                activos: usuarios.reduce((sum, u) => sum + u.activos, 0),
                porRol: usuarios,
            },
            aprendices: {
                total: aprendices[0].total,
                activos: aprendices[0].activos,
            },
            formaciones: {
                total: formaciones[0].total,
                activas: formaciones[0].activos,
            },
            asistencias: {
                total: asistencias[0].total,
                periodo: { startDate, endDate },
            },
        };
    } catch (error) {
        console.error('[reports.service] Error en getGeneralStatistics:', error);
        throw error;
    }
}

/**
 * Obtiene estadísticas de asistencia por formación
 * @param {number} formacionId - ID de la formación
 * @param {object} options - Opciones { startDate, endDate }
 * @returns {Promise<object>} Reporte de la formación
 */
async function getAttendanceByFormacion(formacionId, options = {}) {
    try {
        const { startDate, endDate } = options;

        // Verificar que la formación existe
        const [formacion] = await pool.query(
            'SELECT * FROM FORMACIONES WHERE id_formacion = ? LIMIT 1',
            [formacionId]
        );

        if (!formacion || formacion.length === 0) {
            throw new Error('Formación no encontrada');
        }

        // Obtener aprendices de la formación
        const [aprendices] = await pool.query(`
      SELECT a.id_aprendices, a.nombres, a.apellidos, a.documento
      FROM APRENDICES a
      INNER JOIN APRENDICES_FORMACIONES af ON a.id_aprendices = af.id_aprendices
      WHERE af.id_formacion = ? AND a.activo = 1
    `, [formacionId]);

        // Estadísticas de asistencia por aprendiz
        let asistenciaQuery = `
      SELECT 
        ast.id_aprendices,
        COUNT(*) as total_asistencias,
        SUM(CASE WHEN ast.tipo_registro = 'manual' THEN 1 ELSE 0 END) as manuales,
        SUM(CASE WHEN ast.tipo_registro = 'biometrico' THEN 1 ELSE 0 END) as biometricas,
        SUM(CASE WHEN ast.tipo_registro = 'qr' THEN 1 ELSE 0 END) as qr
      FROM ASISTENCIAS ast
      INNER JOIN APRENDICES_FORMACIONES af ON ast.id_aprendices = af.id_aprendices
      WHERE af.id_formacion = ?
    `;
        const params = [formacionId];

        if (startDate) {
            asistenciaQuery += ' AND DATE(ast.fecha) >= ?';
            params.push(startDate);
        }
        if (endDate) {
            asistenciaQuery += ' AND DATE(ast.fecha) <= ?';
            params.push(endDate);
        }

        asistenciaQuery += ' GROUP BY ast.id_aprendices';

        const [asistencias] = await pool.query(asistenciaQuery, params);

        // Combinar datos
        const aprendicesConAsistencia = aprendices.map(aprendiz => {
            const stats = asistencias.find(a => a.id_aprendices === aprendiz.id_aprendices) || {
                total_asistencias: 0,
                manuales: 0,
                biometricas: 0,
                qr: 0,
            };

            return {
                ...aprendiz,
                estadisticas: stats,
            };
        });

        return {
            formacion: formacion[0],
            totalAprendices: aprendices.length,
            aprendices: aprendicesConAsistencia,
            periodo: { startDate, endDate },
        };
    } catch (error) {
        console.error('[reports.service] Error en getAttendanceByFormacion:', error);
        throw error;
    }
}

/**
 * Obtiene estadísticas de asistencia por aprendiz
 * @param {number} aprendizId - ID del aprendiz
 * @param {object} options - Opciones { startDate, endDate }
 * @returns {Promise<object>} Reporte del aprendiz
 */
async function getAttendanceByAprendiz(aprendizId, options = {}) {
    try {
        const { startDate, endDate } = options;

        // Verificar que el aprendiz existe
        const [aprendiz] = await pool.query(
            'SELECT * FROM APRENDICES WHERE id_aprendices = ? LIMIT 1',
            [aprendizId]
        );

        if (!aprendiz || aprendiz.length === 0) {
            throw new Error('Aprendiz no encontrado');
        }

        // Obtener formaciones del aprendiz
        const [formaciones] = await pool.query(`
      SELECT f.*
      FROM FORMACIONES f
      INNER JOIN APRENDICES_FORMACIONES af ON f.id_formacion = af.id_formacion
      WHERE af.id_aprendices = ?
    `, [aprendizId]);

        // Asistencias del aprendiz
        let asistenciaQuery = `
      SELECT 
        DATE(fecha) as fecha,
        tipo_registro,
        TIME(hora_entrada) as hora_entrada,
        TIME(hora_salida) as hora_salida
      FROM ASISTENCIAS
      WHERE id_aprendices = ?
    `;
        const params = [aprendizId];

        if (startDate) {
            asistenciaQuery += ' AND DATE(fecha) >= ?';
            params.push(startDate);
        }
        if (endDate) {
            asistenciaQuery += ' AND DATE(fecha) <= ?';
            params.push(endDate);
        }

        asistenciaQuery += ' ORDER BY fecha DESC, hora_entrada DESC';

        const [asistencias] = await pool.query(asistenciaQuery, params);

        // Estadísticas
        const stats = {
            total: asistencias.length,
            manual: asistencias.filter(a => a.tipo_registro === 'manual').length,
            biometrico: asistencias.filter(a => a.tipo_registro === 'biometrico').length,
            qr: asistencias.filter(a => a.tipo_registro === 'qr').length,
        };

        return {
            aprendiz: aprendiz[0],
            formaciones,
            asistencias,
            estadisticas: stats,
            periodo: { startDate, endDate },
        };
    } catch (error) {
        console.error('[reports.service] Error en getAttendanceByAprendiz:', error);
        throw error;
    }
}

/**
 * Obtiene resumen de asistencias para un instructor
 * @param {number} instructorCedula - Cédula del instructor
 * @param {object} options - Opciones { startDate, endDate }
 * @returns {Promise<object>} Resumen del instructor
 */
async function getInstructorSummary(instructorCedula, options = {}) {
    try {
        const { startDate, endDate } = options;

        // Verificar que el instructor existe
        const [instructor] = await pool.query(
            'SELECT * FROM usuarios WHERE cedula = ? AND rol = "instructor" LIMIT 1',
            [instructorCedula]
        );

        if (!instructor || instructor.length === 0) {
            throw new Error('Instructor no encontrado');
        }

        // Obtener formaciones asignadas al instructor (esto podría requerir una tabla adicional)
        // Por ahora, retornamos un resumen básico

        let asistenciaQuery = `
      SELECT 
        DATE(fecha) as fecha,
        COUNT(*) as total_registros,
        SUM(CASE WHEN tipo_registro = 'manual' THEN 1 ELSE 0 END) as registros_manuales
      FROM ASISTENCIAS
      WHERE 1=1
    `;
        const params = [];

        if (startDate) {
            asistenciaQuery += ' AND DATE(fecha) >= ?';
            params.push(startDate);
        }
        if (endDate) {
            asistenciaQuery += ' AND DATE(fecha) <= ?';
            params.push(endDate);
        }

        asistenciaQuery += ' GROUP BY DATE(fecha) ORDER BY fecha DESC';

        const [asistencias] = await pool.query(asistenciaQuery, params);

        return {
            instructor: instructor[0],
            asistenciasPorDia: asistencias,
            periodo: { startDate, endDate },
        };
    } catch (error) {
        console.error('[reports.service] Error en getInstructorSummary:', error);
        throw error;
    }
}

module.exports = {
    getGeneralStatistics,
    getAttendanceByFormacion,
    getAttendanceByAprendiz,
    getInstructorSummary,
};
