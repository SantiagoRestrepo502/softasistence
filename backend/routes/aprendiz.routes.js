/**
 * Rutas de Aprendiz
 * Define los endpoints relacionados con aprendices
 */

const express = require('express')
const router = express.Router()
const { create, getByDocumento, getAll, deleteAprendiz, update, toggleStatus } = require('../controllers/aprendiz.controller')

// POST /api/aprendices - Crear un nuevo aprendiz
router.post('/', create)

// GET /api/aprendices - Obtener todos los aprendices
router.get('/', getAll)

// GET /api/aprendices/:documento - Obtener un aprendiz por documento
router.get('/:documento', getByDocumento)

// PUT /api/aprendices/:id - Actualizar un aprendiz
router.put('/:id', update)

// PUT /api/aprendices/:id/toggle - Cambiar estado de un aprendiz
router.put('/:id/toggle', toggleStatus)

// DELETE /api/aprendices/:id - Eliminar un aprendiz por ID
router.delete('/:id', deleteAprendiz)

module.exports = router

