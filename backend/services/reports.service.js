/**
 * Servicio de Reportes
 * Genera estadísticas y reportes de asistencia
 */

const { pool } = require('../db');
const analytics = require('./analytics.service');
const insights = require('./insights.service');

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
 * Obtiene estadísticas de asistencia por formación CON ANÁLISIS COMPLETO
 * @param {string} codigoFormacion - Código de la formación
 * @param {object} options - Opciones { startDate, endDate, enableAnalytics (default: true) }
 * @returns {Promise<object>} Reporte de la formación con analytics
 */
async function getAttendanceByFormacion(codigoFormacion, options = {}) {
    try {
        const { startDate, endDate, enableAnalytics = true } = options;

        // Verificar que la formación existe
        const [formacion] = await pool.query(
            'SELECT * FROM formaciones WHERE codigo = ? LIMIT 1',
            [codigoFormacion]
        );

        if (!formacion || formacion.length === 0) {
            throw new Error('Formación no encontrada');
        }

        // Obtener total de aprendices de la formación
        const [totalAprendicesResult] = await pool.query(`
            SELECT COUNT(DISTINCT id_aprendiz) as total
            FROM formaciones_aprendices
            WHERE fk_codigo_formacion = ?
        `, [codigoFormacion]);

        const totalAprendices = totalAprendicesResult[0]?.total || 0;

        // Obtener estadísticas de aprendices con asistencia
        const [aprendicesStats] = await pool.query(`
            SELECT 
                a.id_aprendices,
                a.nombres,
                a.apellidos,
                a.documento,
                COUNT(*) as dias_total,
                SUM(ast.presente) as dias_presente,
                ROUND((SUM(ast.presente) / COUNT(*)) * 100, 2) as asistencia_porcentaje,
                MAX(CASE WHEN ast.presente = 1 THEN DATE(ast.hora_registro) END) as ultima_asistencia
            FROM aprendices a
            INNER JOIN formaciones_aprendices fa ON a.id_aprendices = fa.id_aprendiz
            LEFT JOIN asistencias ast ON a.id_aprendices = ast.fk_aprendiz 
                AND ast.fk_codigo_formacion = ?
                ${startDate ? 'AND DATE(ast.hora_registro) >= ?' : ''}
                ${endDate ? 'AND DATE(ast.hora_registro) <= ?' : ''}
            WHERE fa.fk_codigo_formacion = ? AND a.activo = 1
            GROUP BY a.id_aprendices, a.nombres, a.apellidos, a.documento
            ORDER BY asistencia_porcentaje ASC
        `, [
            codigoFormacion,
            ...(startDate ? [startDate] : []),
            ...(endDate ? [endDate] : []),
            codigoFormacion
        ]);

        // Datos básicos sin analytics
        const basicData = {
            formacion: formacion[0],
            totalAprendices,
            aprendices: aprendicesStats,
            periodo: { startDate, endDate }
        };

        // Si analytics está deshabilitado, retornar solo datos básicos
        if (!enableAnalytics) {
            return basicData;
        }

        // === ANALYTICS HABILITADO ===

        // 1. Calcular métricas usando analytics service
        const metricsData = await analytics.calculateFormacionMetrics(
            codigoFormacion,
            startDate || '2000-01-01',
            endDate || new Date().toISOString().split('T')[0]
        );

        // 2. Calcular porcentaje general y clasificación
        const attendanceCalc = analytics.calculateAttendancePercentage(
            metricsData.dailyAttendance.reduce((sum, d) => sum + parseInt(d.total_presente || 0), 0),
            metricsData.dailyAttendance.reduce((sum, d) => sum + parseInt(d.total_registros || 0), 0)
        );

        // 3. Analizar tendencia
        const trendAnalysis = analytics.analyzeTrend(
            metricsData.dailyAttendance.map(d => ({
                fecha: d.fecha,
                porcentaje: parseFloat(d.porcentaje || 0)
            })),
            5 // Últimos 5 días
        );

        // 4. Detectar patrón de día de semana
        const weekdayPattern = analytics.detectWeekdayPattern(
            metricsData.weekdayAverages,
            metricsData.overallPercentage
        );

        // Agregar información adicional al patrón
        if (weekdayPattern.hasPattern && weekdayPattern.problematicDay) {
            weekdayPattern.dayPercentage = metricsData.weekdayAverages[weekdayPattern.problematicDay] || 0;
            weekdayPattern.overallAverage = metricsData.overallPercentage;
        }

        // 5. Identificar aprendices en riesgo
        const atRiskStudents = analytics.identifyAtRiskStudents(aprendicesStats, 70);

        // 6. Comparar con promedio institucional
        const institutionalAverage = await analytics.calculateInstitutionalAverage(
            startDate || '2000-01-01',
            endDate || new Date().toISOString().split('T')[0]
        );

        const comparison = analytics.compareWithAverage(
            metricsData.overallPercentage,
            institutionalAverage
        );
        comparison.institutionalAverage = institutionalAverage;

        // 7. Generar análisis completo con insights
        const completeAnalysis = insights.generateCompleteAnalysis(
            {
                codigo: formacion[0].codigo,
                nombre: formacion[0].nombre,
                jornada: formacion[0].jornada,
                totalAprendices
            },
            {
                overallPercentage: metricsData.overallPercentage,
                classification: attendanceCalc.classification,
                trend: trendAnalysis,
                weekdayPattern,
                atRiskStudents,
                dailyAttendance: metricsData.dailyAttendance,
                totalAprendices
            },
            comparison,
            { startDate, endDate }
        );

        // 8. Agregar tendencia diaria formateada
        completeAnalysis.tendencia_diaria = metricsData.dailyAttendance.map(d => ({
            fecha: insights.formatDate(d.fecha),
            porcentaje: parseFloat(d.porcentaje || 0),
            dia: d.dia_nombre,
            presentes: parseInt(d.total_presente || 0),
            total: parseInt(d.total_registros || 0)
        }));

        // 9. Agregar patrón semanal detallado
        completeAnalysis.patron_semanal = {};
        for (const [dia, promedio] of Object.entries(metricsData.weekdayAverages)) {
            const desviacion = Math.round(((promedio - metricsData.overallPercentage) / metricsData.overallPercentage) * 100);
            completeAnalysis.patron_semanal[dia] = {
                promedio: Math.round(promedio * 100) / 100,
                desviacion
            };
        }

        // Retornar datos completos con analytics
        return {
            ...basicData,
            analytics: completeAnalysis
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
