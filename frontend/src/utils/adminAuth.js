/**
 * Admin Authentication Utilities
 * Helper functions to decode and get user info from JWT token
 */

/**
 * Decode JWT token payload
 */
export const decodeToken = (token) => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error('Error decoding token:', error);
        return null;
    }
};

/**
 * Get user information from token stored in localStorage
 */
export const getUserFromToken = () => {
    const token = localStorage.getItem('token');
    if (!token) {
        return null;
    }

    const decoded = decodeToken(token);
    if (!decoded) {
        return null;
    }

    return {
        id: decoded.id,
        nombre: decoded.nombre,
        apellido: decoded.apellido,
        email: decoded.email,
        rol: decoded.rol,
        documento: decoded.documento,
    };
};

/**
 * Check if user is admin
 */
export const isAdmin = () => {
    const user = getUserFromToken();
    return user && user.rol === 'administrador';
};

/**
 * Check if token is expired
 */
export const isTokenExpired = () => {
    const token = localStorage.getItem('token');
    if (!token) {
        return true;
    }

    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) {
        return true;
    }

    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
};

/**
 * Logout user
 */
export const logout = () => {
    localStorage.removeItem('token');
    window.location.href = '/';
};

/**
 * Get Authorization header
 */
export const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? `Bearer ${token}` : '';
};
