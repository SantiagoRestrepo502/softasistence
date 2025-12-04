/**
 * Servicio de Insights
 * Genera conclusiones, observaciones y recomendaciones específicas basadas en métricas
 */

const rules = require('../utils/analytics-rules');

/**
 * Formatea un número como porcentaje con 2 decimales
 * @param {number} value - Valor a formatear
 * @returns {string} Valor formateado (ej: "75.50%")
 */
function formatPercentage(value) {
    return `${Math.round(value * 100) / 100}%`;
}

/**
 * Formatea una fecha en formato DD/MM/YYYY
 * @param {string|Date} date - Fecha a formatear
 * @returns {string} Fecha formateada
 */
function formatDate(date) {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
}

/**
 * Genera la conclusión principal para un reporte de formación
 * @param {object} formacionData - Datos básicos de la formación
 * @param {object} metrics - Métricas calculadas
 * @param {object} comparison - Comparación con promedio institucional
 * @param {object} periodo - {startDate, endDate}
 * @returns {string} Conclusión detallada
 */
function generateFormacionConclusion(formacionData, metrics, comparison, periodo) {
    const { codigo, nombre, jornada, totalAprendices } = formacionData;
    const { overallPercentage, classification } = metrics;
    const { difference, percentDifference } = comparison;

    let conclusion = `La formación ${nombre} (código: ${codigo}, jornada: ${jornada}, ${totalAprendices} aprendices activos) `;
    conclusion += `registró un promedio de asistencia del ${formatPercentage(overallPercentage)} `;
    conclusion += `durante el período ${formatDate(periodo.startDate)}-${formatDate(periodo.endDate)}`;

    if (comparison.isSignificant) {
        if (difference < 0) {
            conclusion += `, ubicándose ${Math.abs(difference)} puntos porcentuales por debajo del promedio institucional`;
        } else {
            conclusion += `, ubicándose ${difference} puntos porcentuales por encima del promedio institucional`;
        }
    }

    conclusion += `, clasificada como ${classification}.`;

    return conclusion;
}

/**
 * Genera la observación detallada para un reporte de formación
 * @param {object} metrics - Todas las métricas calculadas
 * @param {object} patterns - Patrones detectados
 * @param {Array} atRiskStudents - Estudiantes en riesgo
 * @returns {string} Observación detallada
 */
function generateFormacionObservation(metrics, patterns, atRiskStudents) {
    const observaciones = [];
    let counter = 1;

    // 1. Análisis de tendencia
    if (metrics.trend && metrics.trend.isSignificant) {
        const { trend, changePercent, percentages } = metrics.trend;

        if (trend === 'descendente') {
            const progression = percentages.map(p => `${p}%`).join(' → ');
            observaciones.push(
                `(${counter}) Tendencia descendente ${Math.abs(changePercent) > 30 ? 'aguda' : 'sostenida'} ` +
                `en ${percentages.length} días con caída del ${Math.abs(changePercent)}% ` +
                `(${progression})`
            );
            counter++;
        } else if (trend === 'ascendente' && changePercent > 20) {
            observaciones.push(
                `(${counter}) Tendencia ascendente positiva: mejora del ${changePercent}% en los últimos ${percentages.length} días`
            );
            counter++;
        }
    }

    // 2. Patrón por día de semana
    if (patterns.weekday && patterns.weekday.hasPattern) {
        const { problematicDay, deviation, dayPercentage, overallAverage } = patterns.weekday;
        observaciones.push(
            `(${counter}) Los ${problematicDay}s presentan consistentemente ${Math.abs(deviation)}% menos asistencia ` +
            `que el promedio semanal (${dayPercentage}% vs ${overallAverage}%)`
        );

        if (patterns.weekday.weeksConfirmed) {
            observaciones[observaciones.length - 1] += `, patrón confirmado en ${patterns.weekday.weeksConfirmed} de las últimas ${patterns.weekday.weeksConfirmed} semanas`;
        }
        counter++;
    }

    // 3. Aprendices en riesgo
    if (atRiskStudents && atRiskStudents.length > 0) {
        const totalStudents = metrics.totalAprendices || 0;
        const riskPercentage = totalStudents > 0
            ? Math.round((atRiskStudents.length / totalStudents) * 100)
            : 0;

        const criticStudents = atRiskStudents.filter(s => s.severidad === 'critico');

        observaciones.push(
            `(${counter}) ${atRiskStudents.length} aprendices (${riskPercentage}% del grupo) tienen asistencia inferior al ${rules.atRiskThreshold}%`
        );

        if (criticStudents.length > 0 && criticStudents.length <= 5) {
            const names = criticStudents.map(s =>
                `${s.nombre} ${s.apellido} (${formatPercentage(s.asistencia_porcentaje)}${s.ausencias_consecutivas > 0 ? `, ausente ${s.ausencias_consecutivas} días consecutivos` : ''})`
            ).join(', ');
            observaciones[observaciones.length - 1] += `: ${names}`;
        }
        counter++;
    }

    // Si no hay observaciones significativas
    if (observaciones.length === 0) {
        return 'El análisis del período no detectó patrones preocupantes. La formación mantiene un rendimiento estable dentro de los parámetros esperados.';
    }

    let result = 'El análisis identificó ';
    result += observaciones.length === 1 ? 'un indicador de alerta: ' : `${observaciones.length} indicadores de alerta: `;
    result += observaciones.join(', ');
    result += '.';

    return result;
}

/**
 * Genera recomendaciones priorizadas basadas en severidad y patrones
 * @param {string} severidad - Nivel de severidad ('normal', 'advertencia', 'critico')
 * @param {object} patterns - Patrones detectados
 * @param {object} metrics - Métricas completas
 * @param {Array} atRiskStudents - Estudiantes en riesgo
 * @param {object} formacionData - Datos de la formación
 * @returns {Array} Lista de recomendaciones con prioridad
 */
function generateRecommendations(severidad, patterns, metrics, atRiskStudents, formacionData) {
    const recommendations = [];

    // Recomendaciones para estudiantes en riesgo crítico
    if (atRiskStudents && atRiskStudents.length > 0) {
        const critical = atRiskStudents.filter(s => s.severidad === 'critico');

        if (critical.length > 0) {
            // Estudiantes con ausencias consecutivas
            const consecutiveAbsent = critical.filter(s => s.ausencias_consecutivas >= rules.patternThresholds.consecutiveAbsencesAlert);
            if (consecutiveAbsent.length > 0) {
                consecutiveAbsent.forEach(student => {
                    recommendations.push({
                        prioridad: 'URGENTE',
                        accion: `Contacto inmediato con ${student.nombre} ${student.apellido} (Doc: ${student.documento}) antes de las 17:00 hoy`,
                        justificacion: `${student.ausencias_consecutivas} días consecutivos ausente + asistencia ${formatPercentage(student.asistencia_porcentaje)} = riesgo inminente de deserción`,
                        responsable_sugerido: 'Coordinador académico + instructor asignado'
                    });
                });
            }

            // Resto de estudiantes críticos
            if (critical.length > consecutiveAbsent.length) {
                recommendations.push({
                    prioridad: 'ALTA',
                    accion: `Programar ${critical.length} entrevistas individuales con aprendices en riesgo dentro de las próximas 48 horas (antes del ${getDateAfterDays(2)})`,
                    justificacion: 'Identificar causas específicas y barreras individuales de asistencia',
                    responsable_sugerido: 'Instructor + psicólogo institucional'
                });
            }
        }

        // Aprendices en advertencia
        const warning = atRiskStudents.filter(s => s.severidad === 'advertencia');
        if (warning.length > 0) {
            recommendations.push({
                prioridad: 'MEDIA',
                accion: `Seguimiento preventivo a ${warning.length} aprendices con asistencia entre 60-70% durante 2 semanas`,
                justificacion: 'Prevenir que pasen a riesgo crítico con intervención temprana',
                responsable_sugerido: 'Instructor asignado'
            });
        }
    }

    // Recomendaciones para patrón de día de semana
    if (patterns.weekday && patterns.weekday.hasPattern) {
        const { problematicDay } = patterns.weekday;
        recommendations.push({
            prioridad: 'ALTA',
            accion: `Investigación específica del ${problematicDay}: revisar horarios, disponibilidad de transporte público, cruces con otras actividades SENA`,
            justificacion: `Patrón confirmado en múltiples semanas consecutivas (${Math.abs(patterns.weekday.deviation)}% desviación vs promedio)`,
            responsable_sugerido: 'Coordinador académico + bienestar estudiantil'
        });
    }

    // Recomendaciones para tendencia descendente
    if (metrics.trend && metrics.trend.trend === 'descendente' && metrics.trend.isSignificant) {
        recommendations.push({
            prioridad: 'MEDIA',
            accion: `Reunión con instructor asignado a ${formacionData.nombre} para evaluar clima del aula, metodología, y detectar posibles conflictos internos del grupo`,
            justificacion: 'Tendencia descendente puede indicar problemas de motivación o conflictos no reportados',
            responsable_sugerido: 'Coordinador académico'
        });

        recommendations.push({
            prioridad: 'MEDIA',
            accion: `Implementar sistema de seguimiento diario (asistencia + alertas automáticas) para ${formacionData.codigo} durante 2 semanas`,
            justificacion: 'Monitoreo continuo para detectar si intervenciones son efectivas',
            responsable_sugerido: 'Coordinador académico + sistema automático'
        });
    }

    // Recomendación de análisis comparativo
    if (severidad !== 'normal') {
        recommendations.push({
            prioridad: 'BAJA',
            accion: `Análisis comparativo con cohorte anterior del mismo programa para identificar si problemas son recurrentes del diseño curricular`,
            justificacion: 'Determinar si es problema puntual de esta cohorte o estructural del programa',
            responsable_sugerido: 'Líder académico del área'
        });
    }

    return recommendations;
}

/**
 * Calcula el nivel de severidad general basado en múltiples factores
 * @param {object} metrics - Todas las métricas calculadas
 * @param {object} patterns - Patrones detectados
 * @param {Array} atRiskStudents - Estudiantes en riesgo
 * @returns {string} Severidad: 'normal', 'advertencia', 'critico'
 */
function calculateSeverity(metrics, patterns, atRiskStudents) {
    let score = 0;

    // Factor 1: Porcentaje de asistencia general
    const percentage = metrics.overallPercentage || 0;
    if (percentage < 60) {
        score += 3; // Crítico
    } else if (percentage < 75) {
        score += 2; // Advertencia
    } else if (percentage < 90) {
        score += 1; // Normal-bajo
    }

    // Factor 2: Tendencia
    if (metrics.trend && metrics.trend.isSignificant) {
        if (metrics.trend.trend === 'descendente') {
            const absChange = Math.abs(metrics.trend.changePercent);
            if (absChange > 30) {
                score += 2; // Caída fuerte
            } else if (absChange > 15) {
                score += 1; // Caída moderada
            }
        }
    }

    // Factor 3: Porcentaje de aprendices en riesgo
    if (atRiskStudents && atRiskStudents.length > 0 && metrics.totalAprendices) {
        const riskPercentage = (atRiskStudents.length / metrics.totalAprendices) * 100;
        if (riskPercentage > 30) {
            score += 2; // Muchos en riesgo
        } else if (riskPercentage > 15) {
            score += 1; // Algunos en riesgo
        }
    }

    // Factor 4: Patrón problemático de día de semana
    if (patterns.weekday && patterns.weekday.hasPattern) {
        score += 1;
    }

    // Factor 5: Ausencias consecutivas críticas
    if (atRiskStudents) {
        const consecutiveAbsent = atRiskStudents.filter(
            s => s.ausencias_consecutivas >= rules.patternThresholds.consecutiveAbsencesAlert
        );
        if (consecutiveAbsent.length > 0) {
            score += 2;
        }
    }

    // Clasificación final
    if (score >= 5) {
        return 'critico';
    } else if (score >= 3) {
        return 'advertencia';
    } else {
        return 'normal';
    }
}

/**
 * Formatea la progresión de tendencia
 * @param {Array} percentages - Array de porcentajes
 * @returns {string} Progresión formateada (ej: "85% → 78% → 70%")
 */
function formatTrendProgression(percentages) {
    return percentages.map(p => `${p}%`).join(' → ');
}

/**
 * Obtiene una fecha futura en formato DD/MM/YYYY
 * @param {number} days - Número de días en el futuro
 * @returns {string} Fecha formateada
 */
function getDateAfterDays(days) {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return formatDate(date);
}

/**
 * Genera el análisis completo para una formación
 * @param {object} formacionData - Datos de la formación
 * @param {object} allMetrics - Todas las métricas y análisis
 * @param {object} comparison - Comparación institucional
 * @param {object} periodo - Período analizado
 * @returns {object} Análisis completo con conclusión, observación, recomendaciones
 */
function generateCompleteAnalysis(formacionData, allMetrics, comparison, periodo) {
    const {
        overallPercentage,
        classification,
        trend,
        weekdayPattern,
        atRiskStudents,
        dailyAttendance,
        totalAprendices
    } = allMetrics;

    // Calcular severidad
    const severidad = calculateSeverity(
        { overallPercentage, trend, totalAprendices },
        { weekday: weekdayPattern },
        atRiskStudents
    );

    // Generar conclusión
    const conclusion = generateFormacionConclusion(
        formacionData,
        { overallPercentage, classification },
        comparison,
        periodo
    );

    // Generar observación
    const observacion = generateFormacionObservation(
        { trend, totalAprendices },
        { weekday: weekdayPattern },
        atRiskStudents
    );

    // Generar recomendaciones
    const recomendaciones = generateRecommendations(
        severidad,
        { weekday: weekdayPattern },
        { trend, totalAprendices },
        atRiskStudents,
        formacionData
    );

    // Detectar patrones principales
    const patrones_detectados = [];

    if (weekdayPattern && weekdayPattern.hasPattern) {
        patrones_detectados.push(
            `Asistencia ${classification} los ${weekdayPattern.problematicDay}s (${weekdayPattern.dayPercentage}%, ${Math.abs(weekdayPattern.deviation)}% vs promedio semanal)`
        );
    }

    if (trend && trend.isSignificant) {
        patrones_detectados.push(
            `Tendencia ${trend.trend}: ${formatTrendProgression(trend.percentages)}`
        );
    }

    if (atRiskStudents && atRiskStudents.length > 0 && totalAprendices) {
        const riskPercent = Math.round((atRiskStudents.length / totalAprendices) * 100);
        patrones_detectados.push(
            `${riskPercent}% del grupo en riesgo de deserción (asistencia < ${rules.atRiskThreshold}%)`
        );
    }

    return {
        conclusion,
        observacion,
        severidad,
        metricas_clave: {
            porcentaje_promedio: overallPercentage,
            promedio_institucional: comparison.institutionalAverage,
            diferencia_institucional: comparison.difference,
            tendencia: trend?.trend || 'sin_datos',
            cambio_tendencia_porcentual: trend?.changePercent || 0,
            dias_analizados: dailyAttendance?.length || 0,
            aprendices_total: totalAprendices,
            aprendices_riesgo: atRiskStudents?.length || 0,
            porcentaje_riesgo: totalAprendices > 0
                ? Math.round((atRiskStudents.length / totalAprendices) * 100)
                : 0,
            peor_dia_semana: weekdayPattern?.problematicDay || null,
            porcentaje_peor_dia: weekdayPattern?.dayPercentage || null
        },
        patrones_detectados,
        aprendices_criticos: atRiskStudents || [],
        recomendaciones
    };
}

module.exports = {
    generateFormacionConclusion,
    generateFormacionObservation,
    generateRecommendations,
    calculateSeverity,
    generateCompleteAnalysis,
    formatPercentage,
    formatDate,
    formatTrendProgression
};
