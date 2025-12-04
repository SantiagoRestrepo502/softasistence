/**
 * Reglas y Umbrales para Análisis de Asistencias
 * Configuración centralizada de criterios de clasificación y detección de patrones
 */

module.exports = {
  /**
   * Clasificación por porcentaje de asistencia
   * Los rangos determinan el nivel de rendimiento y severidad
   */
  attendanceThresholds: {
    excellent: {
      min: 90,
      label: 'excelente',
      severity: 'normal',
      description: 'Asistencia sobresaliente, cumple ampliamente con las expectativas'
    },
    satisfactory: {
      min: 75,
      label: 'satisfactoria',
      severity: 'normal',
      description: 'Asistencia adecuada, dentro de parámetros aceptables'
    },
    regular: {
      min: 60,
      label: 'regular',
      severity: 'advertencia',
      description: 'Asistencia por debajo del estándar, requiere atención'
    },
    critical: {
      min: 0,
      label: 'crítica',
      severity: 'critico',
      description: 'Asistencia deficiente, requiere intervención inmediata'
    }
  },

  /**
   * Umbrales para detección de patrones y anomalías
   */
  patternThresholds: {
    // Porcentaje de desviación para considerar un patrón significativo por día de semana
    weekdayDeviation: 20,
    
    // Número de días a considerar para calcular tendencias
    trendDays: 5,
    
    // Porcentaje de cambio significativo en tendencia
    significantChange: 15,
    
    // Número de semanas consecutivas para confirmar un patrón
    weekdayPatternConfirmation: 3,
    
    // Número de ausencias consecutivas que genera alerta
    consecutiveAbsencesAlert: 3
  },

  /**
   * Umbral de asistencia para identificar aprendices en riesgo de deserción
   */
  atRiskThreshold: 70,

  /**
   * Umbrales para comparación con promedios generales
   */
  comparisonThresholds: {
    // Puntos porcentuales por debajo del promedio para considerar bajo rendimiento
    significantBelow: -15,
    
    // Puntos porcentuales por encima del promedio para destacar positivamente
    significantAbove: 15
  },

  /**
   * Obtiene la clasificación de asistencia según el porcentaje
   * @param {number} percentage - Porcentaje de asistencia
   * @returns {object} Objeto con label, severity y description
   */
  getAttendanceClassification(percentage) {
    if (percentage >= this.attendanceThresholds.excellent.min) {
      return this.attendanceThresholds.excellent;
    } else if (percentage >= this.attendanceThresholds.satisfactory.min) {
      return this.attendanceThresholds.satisfactory;
    } else if (percentage >= this.attendanceThresholds.regular.min) {
      return this.attendanceThresholds.regular;
    } else {
      return this.attendanceThresholds.critical;
    }
  },

  /**
   * Nombres de días de la semana en español (MySQL DAYOFWEEK retorna 1-7, domingo=1)
   */
  daysOfWeek: {
    1: 'domingo',
    2: 'lunes',
    3: 'martes',
    4: 'miércoles',
    5: 'jueves',
    6: 'viernes',
    7: 'sábado'
  },

  /**
   * Mapeo de jornadas para análisis
   */
  jornadas: {
    'mañana': 'mañana',
    'tarde': 'tarde',
    'noche': 'noche',
    'mixta': 'mixta'
  }
};
