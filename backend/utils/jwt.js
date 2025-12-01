/**
 * JWT Utilities
 * Funciones para generación y verificación de tokens JWT
 */

const jwt = require('jsonwebtoken');

// Secret key para firmar tokens (en producción debe estar en variables de entorno)
const JWT_SECRET = process.env.JWT_SECRET || 'asistencia_sena_secret_key_2024';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

/**
 * Genera un token JWT
 * @param {object} payload - Datos del usuario a incluir en el token
 * @returns {string} Token JWT firmado
 */
function signToken(payload) {
    try {
        // Agregar timestamp de emisión
        const tokenPayload = {
            ...payload,
            iat: Math.floor(Date.now() / 1000),
        };

        return jwt.sign(tokenPayload, JWT_SECRET, {
            expiresIn: JWT_EXPIRES_IN,
        });
    } catch (error) {
        console.error('[jwt] Error al generar token:', error);
        throw new Error('Error al generar token de autenticación');
    }
}

/**
 * Verifica y decodifica un token JWT
 * @param {string} token - Token a verificar
 * @returns {object|null} Payload del token si es válido, null si no lo es
 */
function verifyToken(token) {
    try {
        if (!token) {
            return null;
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        return decoded;
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            console.log('[jwt] Token expirado');
        } else if (error.name === 'JsonWebTokenError') {
            console.log('[jwt] Token inválido');
        } else {
            console.error('[jwt] Error al verificar token:', error);
        }
        return null;
    }
}

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
        console.error('[jwt.middleware] Error en autenticación:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno en autenticación',
            data: null,
        });
    }
}

/**
 * Middleware para requerir rol de administrador
 */
function requireAdmin(req, res, next) {
    if (!req.user) {
        return res.status(401).json({
            status: 'error',
            message: 'No autenticado',
            data: null,
        });
    }

    if (req.user.rol !== 'administrador') {
        return res.status(403).json({
            status: 'error',
            message: 'Acceso denegado. Se requiere rol de administrador',
            data: null,
        });
    }

    next();
}

/**
 * Middleware para requerir rol de coordinador o superior
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

module.exports = {
    signToken,
    verifyToken,
    authMiddleware,
    requireAdmin,
    requireCoordinator,
    JWT_SECRET,
};
