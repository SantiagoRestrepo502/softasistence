/**
 * Rutas de Formaciones
 * Define los endpoints relacionados con la gestión de formaciones
 */

const express = require('express');
const formacionesController = require('../controllers/formaciones.controller');
const { authMiddleware, requireAdmin, requireCoordinator } = require('../middleware/auth.middleware');

const router = express.Router();

// Aplicar middleware de autenticación a todas las rutas EXCEPT GET /
// router.use(authMiddleware);

/**
 * @route   GET /api/formaciones
 * @desc    Obtener lista de formaciones con filtros opcionales
 * @access  Public (Temporalmente para debug)
 * @query   {string} jornada - Filtrar por jornada (opcional)
 * @query   {string} activo - Filtrar por estado (opcional)
 * @query   {string} search - Buscar por código o nombre (opcional)
 */
router.get('/', formacionesController.getAllFormaciones);

// Aplicar auth al resto
router.use(authMiddleware);

/**
 * @route   GET /api/formaciones/:id
 * @desc    Obtener formación por ID
 * @access  Private (Requiere autenticación)
 * @param   {number} id - ID de la formación
 */
router.get('/:id', formacionesController.getFormacion);

/**
 * @route   POST /api/formaciones
 * @desc    Crear nueva formación
 * @access  Private (Requiere rol de coordinador o superior)
 * @body    {string} codigo - Código de la formación
 * @body    {string} nombre - Nombre de la formación
 * @body    {string} jornada - Jornada (diurna|nocturna|mixta|fin_de_semana)
 * @body    {string} fecha_inicio - Fecha de inicio (YYYY-MM-DD)
 * @body    {string} fecha_fin - Fecha de fin (opcional)
 * @body    {boolean} activo - Estado (opcional, default: true)
 */
router.post('/', formacionesController.createFormacion);

/**
 * @route   PUT /api/formaciones/:id
 * @desc    Actualizar datos de una formación
 * @access  Private (Requiere rol de coordinador o superior)
 * @param   {number} id - ID de la formación
 * @body    {string} codigo - Código de la formación (opcional)
 * @body    {string} nombre - Nombre de la formación (opcional)
 * @body    {string} jornada - Jornada (opcional)
 * @body    {string} fecha_inicio - Fecha de inicio (opcional)
 * @body    {string} fecha_fin - Fecha de fin (opcional)
 */
router.put('/:id', formacionesController.updateFormacion);

/**
 * @route   PUT /api/formaciones/:id/toggle
 * @desc    Activar o desactivar una formación
 * @access  Private (Requiere rol de coordinador o superior)
 * @param   {number} id - ID de la formación
 */
router.put('/:id/toggle', formacionesController.toggleFormacion);

/**
 * @route   DELETE /api/formaciones/:id
 * @desc    Eliminar formación permanentemente
 * @access  Private (Requiere rol de administrador)
 * @param   {number} id - ID de la formación
 */
router.delete('/:id', formacionesController.deleteFormacion);

module.exports = router;
