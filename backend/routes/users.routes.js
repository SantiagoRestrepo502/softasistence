/**
 * Rutas de Usuarios
 * Define los endpoints relacionados con la gestión de usuarios (administrador)
 */

const express = require('express');
const usersController = require('../controllers/users.controller');
const { authMiddleware, requireAdmin } = require('../middleware/auth.middleware');

const router = express.Router();

// NOTA: El POST /api/users NO requiere autenticación para permitir el registro inicial de administradores
// El resto de operaciones SÍ requieren autenticación

/**
 * @route   POST /api/users
 * @desc    Crear nuevo usuario (público para registro inicial)
 * @access  Public
 * @body    {number} cedula - Cédula del usuario
 * @body    {string} nombre - Nombre del usuario
 * @body    {string} apellido - Apellido del usuario
 * @body    {string} email - Email del usuario (opcional)
 * @body    {string} password - Contraseña del usuario
 * @body    {string} rol - Rol del usuario (administrador|coordinador|instructor)
 * @body    {boolean} activo - Estado del usuario (opcional, default: true)
 */
router.post('/', usersController.createUser);

/**
 * @route   GET /api/users
 * @desc    Obtener lista de usuarios con filtros opcionales
 * @access  Private (Requiere autenticación)
 * @query   {string} rol - Filtrar por rol (opcional)
 * @query   {string} activo - Filtrar por estado (opcional)
 * @query   {string} search - Buscar por nombre, email o cédula (opcional)
 */
router.get('/', authMiddleware, usersController.getAllUsers);

/**
 * @route   GET /api/users/:cedula
 * @desc    Obtener usuario por cédula
 * @access  Private (Requiere autenticación)
 * @param   {number} cedula - Cédula del usuario
 */
router.get('/:cedula', authMiddleware, usersController.getUser);

/**
 * @route   PUT /api/users/:cedula
 * @desc    Actualizar datos de un usuario
 * @access  Private (Requiere rol de administrador)
 * @param   {number} cedula - Cédula del usuario
 * @body    {string} nombre - Nombre del usuario (opcional)
 * @body    {string} apellido - Apellido del usuario (opcional)
 * @body    {string} email - Email del usuario (opcional)
 */
router.put('/:cedula', authMiddleware, usersController.updateUser);

/**
 * @route   PUT /api/users/:cedula/toggle
 * @desc    Activar o desactivar un usuario
 * @access  Private (Requiere rol de administrador)
 * @param   {number} cedula - Cédula del usuario
 */
router.put('/:cedula/toggle', authMiddleware, usersController.toggleUser);

/**
 * @route   PUT /api/users/:cedula/role
 * @desc    Cambiar el rol de un usuario
 * @access  Private (Requiere rol de administrador)
 * @param   {number} cedula - Cédula del usuario
 * @body    {string} rol - Nuevo rol del usuario
 */
router.put('/:cedula/role', authMiddleware, usersController.changeRole);

/**
 * @route   PUT /api/users/:cedula/password
 * @desc    Cambiar la contraseña de un usuario
 * @access  Private (Requiere rol de administrador)
 * @param   {number} cedula - Cédula del usuario
 * @body    {string} password - Nueva contraseña
 */
router.put('/:cedula/password', authMiddleware, usersController.changePassword);

/**
 * @route   DELETE /api/users/:cedula
 * @desc    Eliminar un usuario permanentemente
 * @access  Private (Requiere rol de administrador)
 * @param   {number} cedula - Cédula del usuario
 */
router.delete('/:cedula', authMiddleware, usersController.deleteUser);

module.exports = router;
