import React from 'react';
import './AdminSidebar.css';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * Sidebar de Administración
 * Navegación vertical con secciones colapsables
 */
function AdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <aside className="admin-sidebar">
      {/* Sección GESTIÓN */}
      <div className="sidebar-section">
        <h3 className="sidebar-section-title">GESTIÓN</h3>
        <nav className="sidebar-nav">
          <button
            className={`sidebar-link ${isActive('/admin/usuarios') ? 'active' : ''}`}
            onClick={() => navigate('/admin/usuarios')}
          >
            <svg className="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="9" cy="7" r="4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Usuarios</span>
          </button>

          <button
            className={`sidebar-link ${isActive('/admin/aprendices') ? 'active' : ''}`}
            onClick={() => navigate('/admin/aprendices')}
          >
            <svg className="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="9" cy="7" r="4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Aprendices</span>
          </button>

          <button
            className={`sidebar-link ${isActive('/admin/formaciones') ? 'active' : ''}`}
            onClick={() => navigate('/admin/formaciones')}
          >
            <svg className="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="16" y1="2" x2="16" y2="6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="8" y1="2" x2="8" y2="6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="3" y1="10" x2="21" y2="10" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Formaciones</span>
          </button>

          <button
            className={`sidebar-link ${isActive('/admin/roles') ? 'active' : ''}`}
            onClick={() => navigate('/admin/roles')}
          >
            <svg className="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="10" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="12" cy="10" r="3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Roles y Permisos</span>
          </button>
        </nav>
      </div>

      {/* Sección SISTEMA */}
      <div className="sidebar-section">
        <h3 className="sidebar-section-title">SISTEMA</h3>
        <nav className="sidebar-nav">
          <button
            className={`sidebar-link ${isActive('/admin/configuracion') ? 'active' : ''}`}
            onClick={() => navigate('/admin/configuracion')}
          >
            <svg className="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 1v6m0 6v6m5.5-12l-5.5 3m-5.5 3l5.5-3m5.5 3l-5.5-3m-5.5 3l5.5 3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Configuración General</span>
          </button>

          <button
            className={`sidebar-link ${isActive('/admin/logs') ? 'active' : ''}`}
            onClick={() => navigate('/admin/logs')}
          >
            <svg className="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <polyline points="14 2 14 8 20 8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="16" y1="13" x2="8" y2="13" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="16" y1="17" x2="8" y2="17" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <polyline points="10 9 9 9 8 9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Logs de Auditoría</span>
          </button>

          <button
            className={`sidebar-link ${isActive('/admin/backups') ? 'active' : ''}`}
            onClick={() => navigate('/admin/backups')}
          >
            <svg className="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <polyline points="7 10 12 15 17 10" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="12" y1="15" x2="12" y2="3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Backups</span>
          </button>

          <button
            className={`sidebar-link ${isActive('/admin/integraciones') ? 'active' : ''}`}
            onClick={() => navigate('/admin/integraciones')}
          >
            <svg className="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="18" cy="5" r="3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="6" cy="12" r="3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="18" cy="19" r="3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Integraciones</span>
          </button>
        </nav>
      </div>

      {/* Sección REPORTES */}
      <div className="sidebar-section">
        <h3 className="sidebar-section-title">REPORTES</h3>
        <nav className="sidebar-nav">
          <button
            className={`sidebar-link ${isActive('/admin/reports') ? 'active' : ''}`}
            onClick={() => navigate('/admin/reports')}
          >
            <svg className="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <line x1="18" y1="20" x2="18" y2="10" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="12" y1="20" x2="12" y2="4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="6" y1="20" x2="6" y2="14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Dashboard de Reportes</span>
          </button>
        </nav>
      </div>
    </aside>
  );
}

export default AdminSidebar;
