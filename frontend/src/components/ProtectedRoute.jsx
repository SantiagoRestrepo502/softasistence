import { Navigate } from 'react-router-dom';
import { isTokenExpired, getUserFromToken } from '../utils/adminAuth';

/**
 * Componente de ruta protegida
 * Verifica que el usuario esté autenticado antes de permitir el acceso
 */
export default function ProtectedRoute({ children, requireAdmin = false }) {
    const token = localStorage.getItem('token');
    const user = getUserFromToken();

    // No hay token o está expirado
    if (!token || isTokenExpired()) {
        console.log('[ProtectedRoute] No hay token válido, redirigiendo al login');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return <Navigate to="/login" replace />;
    }

    // No hay información de usuario
    if (!user) {
        console.log('[ProtectedRoute] No hay información de usuario, redirigiendo al login');
        return <Navigate to="/login" replace />;
    }

    // Verificar si se requiere rol de administrador
    console.log('[ProtectedRoute] Checking admin access:', { requireAdmin, userRole: user?.rol });
    if (requireAdmin && user.rol !== 'administrador' && user.rol !== 'coordinador' && user.rol !== 'instructor') {
        console.log('[ProtectedRoute] No tiene permisos de administrador, redirigiendo a /home');
        return <Navigate to="/home" replace />;
    }

    // Usuario autenticado correctamente
    return children;
}
