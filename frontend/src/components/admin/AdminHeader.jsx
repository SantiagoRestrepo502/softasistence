import React from 'react';
import './AdminHeader.css';
import { useNavigate } from 'react-router-dom';
import { getUserFromToken } from '../../utils/adminAuth';

/**
 * Header del Panel de Administración
 * Color verde SENA #39A900
 */
function AdminHeader({ title = 'Panel de Administración', subtitle = 'Área Restringida' }) {
  const navigate = useNavigate();
  const user = getUserFromToken();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const getInitials = () => {
    if (!user) return 'U';
    const nombre = user.nombre || '';
    const apellido = user.apellido || '';
    return `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase();
  };

  return (
    <header className="admin-header">
      <div className="admin-header-left">
        <div className="admin-header-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="10" strokeWidth="2" />
            <path d="M12 6v6l4 2" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        <div className="admin-header-info">
          <h1 className="admin-header-title">{title}</h1>
          <p className="admin-header-subtitle">{subtitle}</p>
        </div>
      </div>

      <div className="admin-header-right">
        <button
          className="admin-header-button"
          onClick={() => navigate('/home')}
          title="Volver a Dashboard"
        >
          ← Volver a Dashboard
        </button>

        <button className="admin-header-notification" title="Notificaciones">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="notification-badge">3</span>
        </button>

        <div className="admin-header-user">
          <div className="admin-header-user-info">
            <span className="admin-header-user-name">{user?.nombre || 'Super'} {user?.apellido || 'Admin'}</span>
            <span className="admin-header-user-role">{user?.rol || 'administrador'}</span>
          </div>
          <div className="admin-header-avatar">
            <span>{getInitials()}</span>
          </div>
          <div className="admin-header-dropdown">
            <button onClick={handleLogout} className="dropdown-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <polyline points="16 17 21 12 16 7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <line x1="21" y1="12" x2="9" y2="12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default AdminHeader;
