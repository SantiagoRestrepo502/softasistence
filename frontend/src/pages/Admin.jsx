import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../components/admin/AdminSidebar';
import './AdminPanel/Admin.css';

/**
 * Layout Principal del Panel de Administración
 * Contiene el sidebar y el contenedor principal para las rutas hijas
 */
function Admin() {
    return (
        <div className="admin-layout">
            <AdminSidebar />
            <div className="admin-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <Outlet />
            </div>
        </div>
    );
}

export default Admin;
