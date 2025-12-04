/**
 * Servicio de Analytics
 * Motor de cálculo de métricas y detección de patrones en datos de asistencia
 */

const { pool } = require('../db');
const rules = require('../utils/analytics-rules');

/**
 * Calcula el porcentaje de asistencia y su clasificación
 * @param {number} presente - Número de asistencias
 * @param {number} total - Total de días/registros
 * @returns {object} { percentage, classification, label, severity }
 */
function calculateAttendancePercentage(presente, total) {
    if (!total || total === 0) {
        return {
            percentage: 0,
            classification: rules.getAttendanceClassification(0),
            label: 'crítica',
            severity: 'critico'
        };
    }

    const percentage = Math.round((presente / total) * 100 * 100) / 100; // 2 decimales
    const classification = rules.getAttendanceClassification(percentage);

    return {
        percentage,
        classification: classification.label,
        label: classification.label,
        severity: classification.severity,
        description: classification.description
    };
}

/**
 * Analiza la tendencia de asistencia en los últimos N días
 * @param {Array} dailyData - Array de objetos con {fecha, porcentaje}
 * @param {number} days - Número de días a analizar (últimos)
 * @returns {object} { trend, change, percentages, isSignificant }
 */
function analyzeTrend(dailyData, days = 5) {
    if (!dailyData || dailyData.length === 0) {
        return {
            trend: 'insuficientes_datos',
            change: 0,
            percentages: [],
            isSignificant: false
        };
    }

    // Tomar los últimos N días
    const recentData = dailyData.slice(-days);
    const percentages = recentData.map(d => d.porcentaje || d.percentage || 0);

    if (percentages.length < 2) {
        return {
            trend: 'insuficientes_datos',
            change: 0,
            percentages,
            isSignificant: false
        };
    }

    // Calcular promedio de primera y segunda mitad
    const midPoint = Math.floor(percentages.length / 2);
    const firstHalf = percentages.slice(0, midPoint);
    const secondHalf = percentages.slice(midPoint);

    const avgFirst = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const avgSecond = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

    const change = Math.round((avgSecond - avgFirst) * 100) / 100;
    const changePercent = Math.round((change / avgFirst) * 100);

    let trend;
    if (Math.abs(change) < 5) {
        trend = 'estable';
    } else if (change > 0) {
        trend = 'ascendente';
    } else {
        trend = 'descendente';
    }

    const isSignificant = Math.abs(changePercent) >= rules.patternThresholds.significantChange;

    return {
        trend,
        change,
        changePercent,
        percentages,
        isSignificant,
        firstAverage: Math.round(avgFirst * 100) / 100,
        secondAverage: Math.round(avgSecond * 100) / 100
    };
}

/**
 * Detecta patrones por día de semana
 * @param {object} weekdayAverages - Objeto con promedios por día: {lunes: 80, martes: 75, ...}
 * @param {number} overallAverage - Promedio general semanal
 * @returns {object} { hasPattern, problematicDay, deviation, details }
 */
function detectWeekdayPattern(weekdayAverages, overallAverage) {
    if (!weekdayAverages || Object.keys(weekdayAverages).length === 0) {
        return {
            hasPattern: false,
            problematicDay: null,
            deviation: 0,
            details: {}
        };
    }

    const deviations = {};
    let maxDeviation = 0;
    let problematicDay = null;

    // Calcular desviaciones para cada día
    for (const [day, avg] of Object.entries(weekdayAverages)) {
        const deviation = Math.round(((avg - overallAverage) / overallAverage) * 100);
        deviations[day] = {
            promedio: Math.round(avg * 100) / 100,
            desviacion: deviation
        };

        // Buscar el día con mayor desviación negativa
        if (deviation < maxDeviation) {
            maxDeviation = deviation;
            problematicDay = day;
        }
    }

    const hasPattern = Math.abs(maxDeviation) >= rules.patternThresholds.weekdayDeviation;

    return {
        hasPattern,
        problematicDay,
        deviation: maxDeviation,
        details: deviations,
        threshold: rules.patternThresholds.weekdayDeviation
    };
}

/**
 * Compara un valor actual con un promedio y determina el estado
 * @param {number} current - Valor actual
 * @param {number} average - Promedio de comparación
 * @returns {object} { difference, percentDifference, status }
 */
function compareWithAverage(current, average) {
    if (!average || average === 0) {
        return {
            difference: 0,
            percentDifference: 0,
            status: 'sin_datos_comparacion'
        };
    }

    const difference = Math.round((current - average) * 100) / 100;
    const percentDifference = Math.round((difference / average) * 100);

    let status;
    if (difference <= rules.comparisonThresholds.significantBelow) {
        status = 'bajo_rendimiento';
    } else if (difference >= rules.comparisonThresholds.significantAbove) {
        status = 'alto_rendimiento';
    } else {
        status = 'promedio';
    }

    return {
        difference,
        percentDifference,
        status,
        isSignificant: Math.abs(difference) >= Math.abs(rules.comparisonThresholds.significantBelow)
    };
}

/**
 * Identifica aprendices en riesgo de deserción
 * @param {Array} students - Array de objetos con datos de estudiantes y asistencia
 * @param {number} threshold - Umbral de asistencia (default: 70%)
 * @returns {Array} Lista de estudiantes en riesgo con detalles
 */
function identifyAtRiskStudents(students, threshold = rules.atRiskThreshold) {
    if (!students || students.length === 0) {
        return [];
    }

    const atRisk = students
        .filter(student => {
            const attendance = student.asistencia_porcentaje || student.porcentaje || 0;
            return attendance < threshold;
        })
        .map(student => {
            const attendance = student.asistencia_porcentaje || student.porcentaje || 0;
            let severidad;
            if (attendance < 50) {
                severidad = 'critico';
            } else if (attendance < 60) {
                severidad = 'alto';
            } else {
                severidad = 'advertencia';
            }

            return {
                nombre: student.nombres || student.nombre,
                apellido: student.apellidos || student.apellido,
                documento: student.documento,
                asistencia_porcentaje: Math.round(attendance * 100) / 100,
                dias_presente: student.dias_presente || 0,
                dias_total: student.dias_total || 0,
                ausencias_consecutivas: student.ausencias_consecutivas || 0,
                ultima_asistencia: student.ultima_asistencia || null,
                severidad
            };
        })
        .sort((a, b) => a.asistencia_porcentaje - b.asistencia_porcentaje); // Ordenar por asistencia (menor primero)

    return atRisk;
}

/**
 * Calcula métricas de asistencia para una formación en un período
 * @param {string} codigoFormacion - Código de la formación
 * @param {string} startDate - Fecha de inicio (YYYY-MM-DD)
 * @param {string} endDate - Fecha de fin (YYYY-MM-DD)
 * @returns {Promise<object>} Métricas calculadas
 */
async function calculateFormacionMetrics(codigoFormacion, startDate, endDate) {
    try {
        // 1. Calcular asistencia diaria (tendencia)
        const [dailyAttendance] = await pool.query(`
      SELECT 
        DATE(hora_registro) as fecha,
        DAYNAME(hora_registro) as dia_nombre,
        DAYOFWEEK(hora_registro) as dia_numero,
        COUNT(*) as total_registros,
        SUM(presente) as total_presente,
        ROUND((SUM(presente) / COUNT(*)) * 100, 2) as porcentaje
      FROM asistencias
      WHERE fk_codigo_formacion = ?
        AND DATE(hora_registro) BETWEEN ? AND ?
      GROUP BY DATE(hora_registro), dia_nombre, dia_numero
      ORDER BY fecha ASC
    `, [codigoFormacion, startDate, endDate]);

        // 2. Calcular promedio por día de semana usando subquery
        const [weekdayAvg] = await pool.query(`
      SELECT 
        dia,
        dia_numero,
        AVG(porcentaje_dia) as promedio,
        COUNT(*) as ocurrencias
      FROM (
        SELECT 
          DATE(hora_registro) as fecha,
          DAYNAME(hora_registro) as dia,
          DAYOFWEEK(hora_registro) as dia_numero,
          ROUND((SUM(presente) / COUNT(*)) * 100, 2) as porcentaje_dia
        FROM asistencias
        WHERE fk_codigo_formacion = ?
          AND DATE(hora_registro) BETWEEN ? AND ?
        GROUP BY DATE(hora_registro), dia, dia_numero
      ) as daily_percentages
      GROUP BY dia, dia_numero
    `, [codigoFormacion, startDate, endDate]);

        // Agrupar promedios por día de semana
        const weekdayAverages = {};
        weekdayAvg.forEach(row => {
            weekdayAverages[row.dia] = parseFloat(row.promedio || 0);
        });

        // 3. Calcular promedio general del período
        const [overallStats] = await pool.query(`
      SELECT 
        COUNT(*) as total_registros,
        SUM(presente) as total_presente,
        ROUND((SUM(presente) / COUNT(*)) * 100, 2) as porcentaje_promedio
      FROM asistencias
      WHERE fk_codigo_formacion = ?
        AND DATE(hora_registro) BETWEEN ? AND ?
    `, [codigoFormacion, startDate, endDate]);

        const overallPercentage = parseFloat(overallStats[0]?.porcentaje_promedio || 0);

        // 4. Obtener aprendices con estadísticas individuales
        const [studentStats] = await pool.query(`
      SELECT 
        a.id_aprendices,
        a.nombres,
        a.apellidos,
        a.documento,
        COUNT(*) as dias_total,
        SUM(ast.presente) as dias_presente,
        ROUND((SUM(ast.presente) / COUNT(*)) * 100, 2) as asistencia_porcentaje
      FROM aprendices a
      INNER JOIN formaciones_aprendices fa ON a.id_aprendices = fa.id_aprendiz
      INNER JOIN asistencias ast ON a.id_aprendices = ast.fk_aprendiz
      WHERE fa.fk_codigo_formacion = ?
        AND DATE(ast.hora_registro) BETWEEN ? AND ?
      GROUP BY a.id_aprendices, a.nombres, a.apellidos, a.documento
    `, [codigoFormacion, startDate, endDate]);

        return {
            dailyAttendance,
            weekdayAverages,
            overallPercentage,
            studentStats,
            totalDays: dailyAttendance.length
        };
    } catch (error) {
        console.error('[analytics.service] Error en calculateFormacionMetrics:', error);
        throw error;
    }
}

/**
 * Calcula el promedio institucional de asistencia
 * @param {string} startDate - Fecha de inicio
 * @param {string} endDate - Fecha de fin
 * @returns {Promise<number>} Promedio institucional
 */
async function calculateInstitutionalAverage(startDate, endDate) {
    try {
        const [result] = await pool.query(`
      SELECT AVG(porcentaje) as promedio_general
      FROM (
        SELECT 
          fk_codigo_formacion,
          ROUND((SUM(presente) / COUNT(*)) * 100, 2) as porcentaje
        FROM asistencias
        WHERE DATE(hora_registro) BETWEEN ? AND ?
        GROUP BY fk_codigo_formacion
      ) as formaciones_avg
    `, [startDate, endDate]);

        return Math.round(parseFloat(result[0]?.promedio_general || 0) * 100) / 100;
    } catch (error) {
        console.error('[analytics.service] Error en calculateInstitutionalAverage:', error);
        return 0;
    }
}

module.exports = {
    calculateAttendancePercentage,
    analyzeTrend,
    detectWeekdayPattern,
    compareWithAverage,
    identifyAtRiskStudents,
    calculateFormacionMetrics,
    calculateInstitutionalAverage
};
