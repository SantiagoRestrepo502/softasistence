import React, { useState } from 'react';
import './ConfigurationPage.css';
import AdminHeader from '../../components/admin/AdminHeader';


/**
 * Página de Configuración General
 * Tabs: Información Institucional, Parámetros, Notificaciones, Seguridad, Integraciones
 */
function ConfigurationPage() {
  const [activeTab, setActiveTab] = useState('integraciones');

  const tabs = [
    { id: 'institucional', label: 'Información Institucional' },
    { id: 'parametros', label: 'Parámetros de Asistencia' },
    { id: 'notificaciones', label: 'Notificaciones' },
    { id: 'seguridad', label: 'Seguridad' },
    { id: 'integraciones', label: 'Integraciones' },
  ];

  return (
    <>
      <AdminHeader
        title="Configuración General"
        subtitle="Gestiona parámetros globales del sistema"
      />

      <main className="admin-main">
        <div className="config-container">
          {/* Tabs Navigation */}
          <div className="config-tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`config-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="config-content">
            {activeTab === 'institucional' && (
              <div className="tab-panel">
                <h2>Información Institucional</h2>
                <p className="tab-description">
                  Configura los datos de identificación de la institución.
                </p>
                <div className="config-form">
                  <div className="form-group">
                    <label>Nombre de la Institución</label>
                    <input type="text" defaultValue="SENA - Centro de Tecnología" />
                  </div>
                  <div className="form-group">
                    <label>NIT</label>
                    <input type="text" defaultValue="899.999.063-3" />
                  </div>
                  <div className="form-group">
                    <label>Dirección</label>
                    <input type="text" defaultValue="Calle 52 No. 2 Bis 15" />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Teléfono</label>
                      <input type="tel" defaultValue="(601) 5925555" />
                    </div>
                    <div className="form-group">
                      <label>Email</label>
                      <input type="email" defaultValue="contacto@sena.edu.co" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'parametros' && (
              <div className="tab-panel">
                <h2>Parámetros de Asistencia</h2>
                <p className="tab-description">
                  Define reglas y tolerancias para el registro de asistencia.
                </p>
                <div className="config-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Tolerancia de llegada (minutos)</label>
                      <input type="number" defaultValue="15" />
                    </div>
                    <div className="form-group">
                      <label>Tiempo mínimo de asistencia (%)</label>
                      <input type="number" defaultValue="80" />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Horario de registro automático</label>
                    <div className="toggle-group">
                      <label className="toggle">
                        <input type="checkbox" defaultChecked />
                        <span className="toggle-slider"></span>
                        <span className="toggle-label">Activar registro automático</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notificaciones' && (
              <div className="tab-panel">
                <h2>Notificaciones</h2>
                <p className="tab-description">
                  Configura las notificaciones del sistema.
                </p>
                <div className="config-form">
                  <div className="toggle-group">
                    <label className="toggle">
                      <input type="checkbox" defaultChecked />
                      <span className="toggle-slider"></span>
                      <span className="toggle-label">Notificar inasistencias por email</span>
                    </label>
                  </div>
                  <div className="toggle-group">
                    <label className="toggle">
                      <input type="checkbox" defaultChecked />
                      <span className="toggle-slider"></span>
                      <span className="toggle-label">Alertas de bajo rendimiento</span>
                    </label>
                  </div>
                  <div className="toggle-group">
                    <label className="toggle">
                      <input type="checkbox" />
                      <span className="toggle-slider"></span>
                      <span className="toggle-label">Recordatorios semanales</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'seguridad' && (
              <div className="tab-panel">
                <h2>Seguridad</h2>
                <p className="tab-description">
                  Parámetros de seguridad y acceso al sistema.
                </p>
                <div className="config-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Sesión expira después de (minutos)</label>
                      <input type="number" defaultValue="60" />
                    </div>
                    <div className="form-group">
                      <label>Intentos de login fallidos permitidos</label>
                      <input type="number" defaultValue="3" />
                    </div>
                  </div>
                  <div className="toggle-group">
                    <label className="toggle">
                      <input type="checkbox" defaultChecked />
                      <span className="toggle-slider"></span>
                      <span className="toggle-label">Requerir cambio de contraseña cada 90 días</span>
                    </label>
                  </div>
                  <div className="toggle-group">
                    <label className="toggle">
                      <input type="checkbox" />
                      <span className="toggle-slider"></span>
                      <span className="toggle-label">Autenticación de dos factores (2FA)</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'integraciones' && (
              <div className="tab-panel">
                <h2>Integraciones</h2>
                <p className="tab-description">
                  Gestiona las integraciones con servicios externos.
                </p>

                {/* Google Sheets Integration */}
                <div className="integration-card">
                  <div className="integration-header">
                    <div className="integration-icon google-sheets">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20M10,19H8V15H10V19M14,19H12V12H14V19M10,13H8V10H10V13Z" />
                      </svg>
                    </div>
                    <div className="integration-info">
                      <h3>Integración Google Sheets</h3>
                      <div className="integration-status connected">
                        <span className="status-indicator"></span>
                        Conectado
                      </div>
                    </div>
                  </div>

                  <div className="integration-body">
                    <div className="info-field">
                      <label>Service Account Email:</label>
                      <div className="info-value">
                        <code>sistema-asistencia@example.iam.gserviceaccount.com</code>
                      </div>
                    </div>

                    <div className="integration-actions">
                      <button className="btn-secondary">Reconectar</button>
                      <button className="btn-primary">Probar Conexión</button>
                    </div>

                    <div className="integration-note">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <circle cx="12" cy="12" r="10" strokeWidth="2" />
                        <line x1="12" y1="16" x2="12" y2="12" strokeWidth="2" />
                        <line x1="12" y1="8" x2="12.01" y2="8" strokeWidth="2" />
                      </svg>
                      <p>
                        Esta integración permite exportar automáticamente los registros de asistencia
                        diaria a Google Sheets. El reporte se genera cada día a las 6:00 PM.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Placeholder para otras integraciones */}
                <div className="integration-card disabled">
                  <div className="integration-header">
                    <div className="integration-icon email">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20,8L12,13L4,8V6L12,11L20,6M20,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V6C22,4.89 21.1,4 20,4Z" />
                      </svg>
                    </div>
                    <div className="integration-info">
                      <h3>SMTP Email</h3>
                      <div className="integration-status disconnected">
                        <span className="status-indicator"></span>
                        No configurado
                      </div>
                    </div>
                  </div>
                  <div className="integration-body">
                    <p className="integration-description">
                      Configura un servidor SMTP para enviar notificaciones por correo electrónico.
                    </p>
                    <button className="btn-secondary" disabled>Configurar</button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Save Button (except for Integraciones tab) */}
          {activeTab !== 'integraciones' && (
            <div className="config-footer">
              <button className="btn-secondary">Cancelar</button>
              <button className="btn-primary">Guardar Cambios</button>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

export default ConfigurationPage;
