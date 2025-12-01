/**
 * Authentication Middleware
 * Middleware para autenticación y autorización de usuarios
 */

const { verifyToken } = require('../utils/jwt');

/**
 * Middleware de autenticación
 * Verifica que la petición incluya un token JWT válido
 */
function authMiddleware(req, res, next) {
    try {
        // Obtener token del header Authorization
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                status: 'error',
                message: 'No se proporcionó token de autenticación',
                data: null,
            });
        }

        // El formato esperado es: "Bearer TOKEN"
        const parts = authHeader.split(' ');
        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            return res.status(401).json({
                status: 'error',
                message: 'Formato de token inválido. Use: Bearer TOKEN',
                data: null,
            });
        }

        const token = parts[1];
        const decoded = verifyToken(token);

        if (!decoded) {
            return res.status(401).json({
                status: 'error',
                message: 'Token inválido o expirado',
                data: null,
            });
        }

        // Agregar usuario al request para uso en controladores
        req.user = {
            cedula: decoded.cedula,
            nombre: decoded.nombre,
            apellido: decoded.apellido,
            email: decoded.email,
            rol: decoded.rol,
        };

        next();
    } catch (error) {
        console.error('[auth.middleware] Error en autenticación:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno en autenticación',
            data: null,
        });
    }
}

function requireAdmin(req, res, next) {
    if (!req.user) {
        return res.status(401).json({
            status: 'error',
            message: 'No autenticado',
            data: null,
        });
    }

    const allowedRoles = ['administrador', 'admin'];
    if (!allowedRoles.includes(req.user.rol)) {
        return res.status(403).json({
            status: 'error',
            message: 'Acceso denegado. Se requiere rol de administrador',
            data: null,
        });
    }

    next();
}

/**
 * Middleware para requerir rol de supervisor o superior
 */
function requireCoordinator(req, res, next) {
    if (!req.user) {
        return res.status(401).json({
            status: 'error',
            message: 'No autenticado',
            data: null,
        });
    }

    const allowedRoles = ['administrador', 'coordinador'];
    if (!allowedRoles.includes(req.user.rol)) {
        return res.status(403).json({
            status: 'error',
            message: 'Acceso denegado. Se requiere rol de coordinador o superior',
            data: null,
        });
    }

    next();
}

/**
 * Middleware para requerir rol de instructor o superior
 */
function requireInstructor(req, res, next) {
    if (!req.user) {
        return res.status(401).json({
            status: 'error',
            message: 'No autenticado',
            data: null,
        });
    }

    const allowedRoles = ['administrador', 'coordinador', 'instructor'];
    if (!allowedRoles.includes(req.user.rol)) {
        return res.status(403).json({
            status: 'error',
            message: 'Acceso denegado. Se requiere rol de instructor o superior',
            data: null,
        });
    }

    next();
}

module.exports = {
    authMiddleware,
    requireAdmin,
    requireCoordinator,
    requireInstructor,
};
