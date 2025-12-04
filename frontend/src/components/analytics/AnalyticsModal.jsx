import React, { useState, useEffect } from 'react';
import './AnalyticsModal.css';
import { getAuthHeader } from '../../utils/adminAuth';

const API_URL = 'http://localhost:3000';

function AnalyticsModal({ formacion, onClose }) {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: getLastMonthDate(),
    endDate: getTodayDate()
  });

  useEffect(() => {
    if (formacion) {
      fetchAnalytics();
    }
  }, [formacion]);

  function getLastMonthDate() {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date.toISOString().split('T')[0];
  }

  function getTodayDate() {
    return new Date().toISOString().split('T')[0];
  }

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      });

      const response = await fetch(
        `${API_URL}/api/reports/formacion/${formacion.codigo}?${params}`,
        {
          headers: { 'Authorization': getAuthHeader() }
        }
      );

      if (!response.ok) {
        throw new Error('Error al cargar análisis de asistencia');
      }

      const data = await response.json();
      setAnalytics(data.data.analytics);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityBadge = (severidad) => {
    switch (severidad) {
      case 'critico':
        return { class: 'severity-critical', icon: '🔴', label: 'Crítico' };
      case 'advertencia':
        return { class: 'severity-warning', icon: '🟡', label: 'Advertencia' };
      default:
        return { class: 'severity-normal', icon: '🟢', label: 'Normal' };
    }
  };

  const getPriorityIcon = (prioridad) => {
    switch (prioridad) {
      case 'URGENTE':
        return '🚨';
      case 'ALTA':
        return '⚠️';
      case 'MEDIA':
        return 'ℹ️';
      default:
        return '💡';
    }
  };

  if (!formacion) return null;

  return (
    <div className="analytics-modal-overlay" onClick={onClose}>
      <div className="analytics-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="analytics-modal-header">
          <div>
            <h2>📊 Análisis de Asistencia</h2>
            <p className="formacion-name">{formacion.nombre}</p>
          </div>
          <button onClick={onClose} className="analytics-modal-close">×</button>
        </div>

        <div className="analytics-modal-body">
          {/* Filtros de fecha */}
          <div className="date-filters">
            <div className="date-input-group">
              <label>Desde:</label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              />
            </div>
            <div className="date-input-group">
              <label>Hasta:</label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              />
            </div>
            <button onClick={fetchAnalytics} className="btn-update">
              Actualizar
            </button>
          </div>

          {loading && (
            <div className="analytics-loading">
              <div className="spinner"></div>
              Analizando datos de asistencia...
            </div>
          )}

          {error && (
            <div className="analytics-error">
              <span>⚠️</span>
              {error}
            </div>
          )}

          {!loading && !error && analytics && (
            <>
              {/* Severidad y Conclusión */}
              <div className="analytics-section">
                <div className={`severity-badge ${getSeverityBadge(analytics.severidad).class}`}>
                  <span className="severity-icon">{getSeverityBadge(analytics.severidad).icon}</span>
                  <span className="severity-label">{getSeverityBadge(analytics.severidad).label}</span>
                </div>
                <p className="conclusion-text">{analytics.conclusion}</p>
              </div>

              {/* Métricas Clave */}
              <div className="analytics-section">
                <h3>🎯 Métricas Clave</h3>
                <div className="metrics-grid">
                  <div className="metric-card">
                    <div className="metric-value">{analytics.metricas_clave.porcentaje_promedio}%</div>
                    <div className="metric-label">Asistencia Promedio</div>
                  </div>
                  <div className="metric-card">
                    <div className="metric-value">{analytics.metricas_clave.promedio_institucional}%</div>
                    <div className="metric-label">Promedio Institucional</div>
                  </div>
                  <div className={`metric-card ${analytics.metricas_clave.diferencia_institucional < 0 ? 'metric-negative' : 'metric-positive'}`}>
                    <div className="metric-value">
                      {analytics.metricas_clave.diferencia_institucional > 0 ? '+' : ''}
                      {analytics.metricas_clave.diferencia_institucional}
                    </div>
                    <div className="metric-label">Diferencia</div>
                  </div>
                  <div className="metric-card">
                    <div className="metric-value">{analytics.metricas_clave.aprendices_riesgo}</div>
                    <div className="metric-label">Aprendices en Riesgo</div>
                  </div>
                </div>
              </div>

              {/* Observación */}
              <div className="analytics-section">
                <h3>🔍 Observaciones</h3>
                <p className="observation-text">{analytics.observacion}</p>
              </div>

              {/* Patrones Detectados */}
              {analytics.patrones_detectados && analytics.patrones_detectados.length > 0 && (
                <div className="analytics-section">
                  <h3>📌 Patrones Detectados</h3>
                  <ul className="patterns-list">
                    {analytics.patrones_detectados.map((patron, index) => (
                      <li key={index}>{patron}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Aprendices Críticos */}
              {analytics.aprendices_criticos && analytics.aprendices_criticos.length > 0 && (
                <div className="analytics-section">
                  <h3>⚠️ Aprendices en Riesgo ({analytics.aprendices_criticos.length})</h3>
                  <div className="students-at-risk">
                    {analytics.aprendices_criticos.slice(0, 5).map((estudiante, index) => (
                      <div key={index} className={`student-card student-${estudiante.severidad}`}>
                        <div className="student-info">
                          <div className="student-name">{estudiante.nombre} {estudiante.apellido}</div>
                          <div className="student-doc">Doc: {estudiante.documento}</div>
                        </div>
                        <div className="student-attendance">
                          <span className="attendance-value">{estudiante.asistencia_porcentaje}%</span>
                          <span className={`attendance-label ${estudiante.severidad}`}>
                            {estudiante.severidad.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recomendaciones */}
              {analytics.recomendaciones && analytics.recomendaciones.length > 0 && (
                <div className="analytics-section">
                  <h3>💡 Recomendaciones</h3>
                  <div className="recommendations-list">
                    {analytics.recomendaciones.map((rec, index) => (
                      <div key={index} className={`recommendation-card priority-${rec.prioridad.toLowerCase()}`}>
                        <div className="recommendation-header">
                          <span className="priority-icon">{getPriorityIcon(rec.prioridad)}</span>
                          <span className="priority-badge">{rec.prioridad}</span>
                        </div>
                        <div className="recommendation-body">
                          <p className="recommendation-action"><strong>{rec.accion}</strong></p>
                          <p className="recommendation-justification">{rec.justificacion}</p>
                          <p className="recommendation-responsible">
                            <span>👤</span> {rec.responsable_sugerido}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="analytics-modal-footer">
          <button onClick={onClose} className="btn-close-modal">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

export default AnalyticsModal;
