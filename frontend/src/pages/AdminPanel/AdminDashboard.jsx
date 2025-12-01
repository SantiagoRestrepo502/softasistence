import React, { useState, useEffect } from 'react';
import './AdminDashboard.css';
import AdminHeader from '../../components/admin/AdminHeader';

import { useNavigate } from 'react-router-dom';
import { getAuthHeader } from '../../utils/adminAuth';

const API_URL = 'http://localhost:3000';

function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    admins: 0,
    coordinators: 0,
    instructors: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_URL}/api/users`, {
        headers: { 'Authorization': getAuthHeader() },
      });
      const data = await response.json();
      const users = data.data.users || [];

      setStats({
        totalUsers: users.length,
        activeUsers: users.filter(u => u.activo).length,
        admins: users.filter(u => u.rol === 'administrador' || u.rol === 'admin').length,
        coordinators: users.filter(u => u.rol === 'coordinador' || u.rol === 'supervisor').length,
        instructors: users.filter(u => u.rol === 'instructor').length,
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
      // Fallback values for UI testing
      setStats({
        totalUsers: 0,
        activeUsers: 0,
        admins: 0,
        coordinators: 0,
        instructors: 0,
      });
    }
  };

  const quickActions = [
    { title: 'Gestión de Usuarios', icon: '👥', path: '/admin/usuarios', color: '#39A900' },
    { title: 'Ver Aprendices', icon: '🎓', path: '/admin/aprendices', color: '#0891b2' },
    { title: 'Formaciones', icon: '📚', path: '/admin/formaciones', color: '#7c3aed' },
    { title: 'Configuración', icon: '⚙️', path: '/admin/configuracion', color: '#ea580c' },
  ];

  return (
    <>
      <AdminHeader title="Panel de Administración" subtitle="Vista general del sistema" />

      <main className="admin-main">
        <h2 className="dashboard-title">Dashboard</h2>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#dbeafe' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#1e40af">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" strokeWidth="2" />
                <circle cx="9" cy="7" r="4" strokeWidth="2" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" strokeWidth="2" />
              </svg>
            </div>
            <div className="stat-info">
              <div className="stat-value">{stats.totalUsers}</div>
              <div className="stat-label">Total Usuarios</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#d1fae5' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#065f46">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" strokeWidth="2" />
                <polyline points="22 4 12 14.01 9 11.01" strokeWidth="2" />
              </svg>
            </div>
            <div className="stat-info">
              <div className="stat-value">{stats.activeUsers}</div>
              <div className="stat-label">Usuarios Activos</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#fef3c7' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#92400e">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" strokeWidth="2" />
              </svg>
            </div>
            <div className="stat-info">
              <div className="stat-value">{stats.admins}</div>
              <div className="stat-label">Administradores</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#e0e7ff' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#3730a3">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth="2" />
                <line x1="16" y1="2" x2="16" y2="6" strokeWidth="2" />
                <line x1="8" y1="2" x2="8" y2="6" strokeWidth="2" />
                <line x1="3" y1="10" x2="21" y2="10" strokeWidth="2" />
              </svg>
            </div>
            <div className="stat-info">
              <div className="stat-value">{stats.coordinators}</div>
              <div className="stat-label">Coordinadores</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <h3 className="section-title">Accesos Rápidos</h3>
        <div className="quick-actions">
          {quickActions.map((action, index) => (
            <button
              key={index}
              className="quick-action-card"
              onClick={() => navigate(action.path)}
              style={{ borderColor: action.color }}
            >
              <div className="action-icon" style={{ backgroundColor: action.color }}>
                <span>{action.icon}</span>
              </div>
              <div className="action-title">{action.title}</div>
            </button>
          ))}
        </div>
      </main>
    </>
  );
}

export default AdminDashboard;
