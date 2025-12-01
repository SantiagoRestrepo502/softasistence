/**
 * Controlador de Usuarios del Panel de Administración
 * Maneja las operaciones CRUD de usuarios (solo para administradores)
 */

const userService = require('../services/user.service');
const bcrypt = require('bcryptjs');

class UsersController {
    /**
     * GET /api/users
     * Obtiene lista de usuarios con filtros opcionales
     */
    async getAllUsers(req, res) {
        try {
            const { rol, activo, search } = req.query;

            const filters = {};
            if (rol) filters.rol = rol;
            if (activo !== undefined) filters.activo = activo === 'true';
            if (search) filters.search = search;

            const users = await userService.getAllUsers(filters);

            res.status(200).json({
                status: 'success',
                message: 'Usuarios obtenidos exitosamente',
                data: { users, total: users.length },
            });
        } catch (error) {
            // console.error('[users.controller] Error en getAllUsers:', error);
            res.status(500).json({
                status: 'error',
                message: 'Error al obtener usuarios',
                data: null,
            });
        }
    }

    /**
     * GET /api/users/:cedula
     * Obtiene un usuario por cédula
     */
    async getUser(req, res) {
        try {
            const { cedula } = req.params;

            if (!cedula || isNaN(Number(cedula))) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Cédula inválida',
                    data: null,
                });
            }

            const user = await userService.getUserByCedula(cedula);

            if (!user) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Usuario no encontrado',
                    data: null,
                });
            }

            // No enviar el password_hash
            delete user.password_hash;

            res.status(200).json({
                status: 'success',
                message: 'Usuario obtenido exitosamente',
                data: { user },
            });
        } catch (error) {
            // console.error('[users.controller] Error en getUser:', error);
            res.status(500).json({
                status: 'error',
                message: 'Error al obtener usuario',
                data: null,
            });
        }
    }

    /**
     * POST /api/users
     * Crea un nuevo usuario
     */
    async createUser(req, res) {
        try {
            const { cedula, nombre, apellido, email, password, rol = 'instructor', activo = true } = req.body;

            // Validaciones
            if (!cedula || !nombre || !apellido || !password) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Cédula, nombre, apellido y contraseña son requeridos',
                    data: null,
                });
            }

            if (isNaN(Number(cedula)) || Number(cedula) <= 0) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Cédula inválida',
                    data: null,
                });
            }

            // Validar rol
            const rolesPermitidos = ['admin', 'coordinador', 'instructor'];
            if (!rolesPermitidos.includes(rol)) {
                return res.status(400).json({
                    status: 'error',
                    message: `Rol inválido. Roles permitidos: ${rolesPermitidos.join(', ')}`,
                    data: null,
                });
            }

            // Hash de la contraseña
            const password_hash = await bcrypt.hash(password, 10);

            // Crear usuario
            const newCedula = await userService.createUser({
                cedula,
                nombre,
                apellido,
                email,
                password_hash,
                rol,
                activo,
            });

            res.status(201).json({
                status: 'success',
                message: 'Usuario creado exitosamente',
                data: { cedula: newCedula },
            });
        } catch (error) {
            // console.error('[users.controller] Error en createUser:', error);

            // Errores específicos
            if (error.message.includes('Ya existe')) {
                return res.status(409).json({
                    status: 'error',
                    message: error.message,
                    data: null,
                });
            }

            res.status(500).json({
                status: 'error',
                message: 'Error al crear usuario: ' + error.message,
                data: null,
            });
        }
    }

    /**
     * PUT /api/users/:cedula
     * Actualiza los datos de un usuario
     */
    async updateUser(req, res) {
        try {
            const { cedula } = req.params;
            const { nombre, apellido, email } = req.body;

            if (!cedula || isNaN(Number(cedula))) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Cédula inválida',
                    data: null,
                });
            }

            // Validar que al menos un campo esté presente
            if (!nombre && !apellido && !email) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Debe enviar al menos un campo para actualizar',
                    data: null,
                });
            }

            const updateData = {};
            if (nombre) updateData.nombre = nombre;
            if (apellido) updateData.apellido = apellido;
            if (email) updateData.email = email;

            const updated = await userService.updateUser(cedula, updateData);

            if (!updated) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Usuario no encontrado',
                    data: null,
                });
            }

            res.status(200).json({
                status: 'success',
                message: 'Usuario actualizado exitosamente',
                data: { cedula: Number(cedula) },
            });
        } catch (error) {
            // console.error('[users.controller] Error en updateUser:', error);

            if (error.message.includes('email ya está en uso')) {
                return res.status(409).json({
                    status: 'error',
                    message: error.message,
                    data: null,
                });
            }

            res.status(500).json({
                status: 'error',
                message: 'Error al actualizar usuario',
                data: null,
            });
        }
    }

    /**
     * PUT /api/users/:cedula/toggle
     * Activa o desactiva un usuario
     */
    async toggleUser(req, res) {
        try {
            const { cedula } = req.params;
            const adminCedula = req.user?.cedula || null; // Del token JWT

            if (!cedula || isNaN(Number(cedula))) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Cédula inválida',
                    data: null,
                });
            }

            const updated = await userService.toggleUserStatus(cedula, adminCedula);

            if (!updated) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Usuario no encontrado',
                    data: null,
                });
            }

            res.status(200).json({
                status: 'success',
                message: 'Estado de usuario actualizado exitosamente',
                data: { cedula: Number(cedula) },
            });
        } catch (error) {
            // console.error('[users.controller] Error en toggleUser:', error);

            if (error.message.includes('No puedes desactivar')) {
                return res.status(400).json({
                    status: 'error',
                    message: error.message,
                    data: null,
                });
            }

            res.status(500).json({
                status: 'error',
                message: 'Error al cambiar estado de usuario',
                data: null,
            });
        }
    }

    /**
     * PUT /api/users/:cedula/role
     * Cambia el rol de un usuario
     */
    async changeRole(req, res) {
        try {
            const { cedula } = req.params;
            const { rol } = req.body;
            const adminCedula = req.user?.cedula || null; // Del token JWT

            if (!cedula || isNaN(Number(cedula))) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Cédula inválida',
                    data: null,
                });
            }

            if (!rol) {
                return res.status(400).json({
                    status: 'error',
                    message: 'El rol es requerido',
                    data: null,
                });
            }

            const updated = await userService.changeUserRole(cedula, rol, adminCedula);

            if (!updated) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Usuario no encontrado',
                    data: null,
                });
            }

            res.status(200).json({
                status: 'success',
                message: 'Rol de usuario actualizado exitosamente',
                data: { cedula: Number(cedula), rol },
            });
        } catch (error) {
            // console.error('[users.controller] Error en changeRole:', error);

            if (error.message.includes('Rol inválido') || error.message.includes('No puedes cambiar')) {
                return res.status(400).json({
                    status: 'error',
                    message: error.message,
                    data: null,
                });
            }

            res.status(500).json({
                status: 'error',
                message: 'Error al cambiar rol de usuario',
                data: null,
            });
        }
    }

    /**
     * PUT /api/users/:cedula/password
     * Cambia la contraseña de un usuario
     */
    async changePassword(req, res) {
        try {
            const { cedula } = req.params;
            const { password } = req.body;

            if (!cedula || isNaN(Number(cedula))) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Cédula inválida',
                    data: null,
                });
            }

            if (!password || password.length < 6) {
                return res.status(400).json({
                    status: 'error',
                    message: 'La contraseña debe tener al menos 6 caracteres',
                    data: null,
                });
            }

            // Hash de la nueva contraseña
            const password_hash = await bcrypt.hash(password, 10);

            const updated = await userService.updateUserPassword(cedula, password_hash);

            if (!updated) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Usuario no encontrado',
                    data: null,
                });
            }

            res.status(200).json({
                status: 'success',
                message: 'Contraseña actualizada exitosamente',
                data: { cedula: Number(cedula) },
            });
        } catch (error) {
            // console.error('[users.controller] Error en changePassword:', error);
            res.status(500).json({
                status: 'error',
                message: 'Error al cambiar contraseña',
                data: null,
            });
        }
    }

    /**
     * DELETE /api/users/:cedula
     * Elimina un usuario permanentemente (solo usar en casos extremos)
     */
    async deleteUser(req, res) {
        try {
            const { cedula } = req.params;
            const adminCedula = req.user?.cedula || null;

            if (!cedula || isNaN(Number(cedula))) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Cédula inválida',
                    data: null,
                });
            }

            // No permitir que el usuario se elimine a sí mismo
            if (adminCedula && Number(cedula) === Number(adminCedula)) {
                return res.status(400).json({
                    status: 'error',
                    message: 'No puedes eliminar tu propia cuenta',
                    data: null,
                });
            }

            // Verificar que el usuario existe
            const user = await userService.getUserByCedula(cedula);
            if (!user) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Usuario no encontrado',
                    data: null,
                });
            }

            // Eliminar permanentemente
            const { pool } = require('../db');
            const [result] = await pool.query('DELETE FROM usuarios WHERE cedula = ?', [Number(cedula)]);

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Usuario no encontrado',
                    data: null,
                });
            }

            res.status(200).json({
                status: 'success',
                message: 'Usuario eliminado permanentemente',
                data: { cedula: Number(cedula) },
            });
        } catch (error) {
            // console.error('[users.controller] Error en deleteUser:', error);

            // Error de foreign key (usuario tiene relaciones)
            if (error.code === 'ER_ROW_IS_REFERENCED_2') {
                return res.status(400).json({
                    status: 'error',
                    message: 'No se puede eliminar el usuario porque tiene registros asociados. Considere desactivarlo en su lugar.',
                    data: null,
                });
            }

            res.status(500).json({
                status: 'error',
                message: 'Error al eliminar usuario',
                data: null,
            });
        }
    }
}

module.exports = new UsersController();
