/**
 * Rutas de Reportes
 * Define los endpoints relacionados con estadísticas y reportes de asistencia
 */

const express = require('express');
const reportsController = require('../controllers/reports.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

const router = express.Router();

// Aplicar middleware de autenticación a todas las rutas
router.use(authMiddleware);

/**
 * @route   GET /api/reports/statistics
 * @desc    Obtener estadísticas generales del sistema
 * @access  Private (Requiere autenticación)
 * @query   {string} startDate - Fecha de inicio (opcional, YYYY-MM-DD)
 * @query   {string} endDate - Fecha de fin (opcional, YYYY-MM-DD)
 */
router.get('/statistics', reportsController.getStatistics);

/**
 * @route   GET /api/reports/formacion/:id
 * @desc    Obtener reporte de asistencia por formación
 * @access  Private (Requiere autenticación)
 * @param   {number} id - ID de la formación
 * @query   {string} startDate - Fecha de inicio (opcional)
 * @query   {string} endDate - Fecha de fin (opcional)
 */
router.get('/formacion/:id', reportsController.getFormacionReport);

/**
 * @route   GET /api/reports/aprendiz/:id
 * @desc    Obtener reporte de asistencia por aprendiz
 * @access  Private (Requiere autenticación)
 * @param   {number} id - ID del aprendiz
 * @query   {string} startDate - Fecha de inicio (opcional)
 * @query   {string} endDate - Fecha de fin (opcional)
 */
router.get('/aprendiz/:id', reportsController.getAprendizReport);

/**
 * @route   GET /api/reports/instructor/:id
 * @desc    Obtener resumen de instructor
 * @access  Private (Requiere autenticación)
 * @param   {number} id - Cédula del instructor
 * @query   {string} startDate - Fecha de inicio (opcional)
 * @query   {string} endDate - Fecha de fin (opcional)
 */
router.get('/instructor/:id', reportsController.getInstructorReport);

module.exports = router;
