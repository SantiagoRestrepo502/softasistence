/**
 * Controlador de Formaciones del Panel de Administración
 * Maneja las operaciones CRUD de formaciones (solo para administradores)
 */

const formacionService = require('../services/formacion.service');

class FormacionesController {
    /**
     * GET /api/formaciones
     * Obtiene lista de formaciones con filtros opcionales
     */
    async getAllFormaciones(req, res) {
        try {
            const { jornada, activo, search } = req.query;

            const filters = {};
            if (jornada) filters.jornada = jornada;
            if (activo !== undefined) filters.activo = activo === 'true';
            if (search) filters.search = search;

            const formaciones = await formacionService.getAllFormaciones(filters);

            res.status(200).json({
                status: 'success',
                message: 'Formaciones obtenidas exitosamente',
                data: { formaciones, total: formaciones.length },
            });
        } catch (error) {
            console.error('[formaciones.controller] Error en getAllFormaciones:', error);
            res.status(500).json({
                status: 'error',
                message: 'Error al obtener formaciones',
                error: error.message,
                stack: error.stack,
                data: null,
            });
        }
    }

    /**
     * GET /api/formaciones/:codigo
     * Obtiene una formación por Código
     */
    async getFormacion(req, res) {
        try {
            const { id: codigo } = req.params; // Express param is named :id in route, but it's actually codigo

            if (!codigo) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Código inválido',
                    data: null,
                });
            }

            const formacion = await formacionService.getFormacionByCodigo(codigo);

            if (!formacion) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Formación no encontrada',
                    data: null,
                });
            }

            res.status(200).json({
                status: 'success',
                message: 'Formación obtenida exitosamente',
                data: { formacion },
            });
        } catch (error) {
            console.error('[formaciones.controller] Error en getFormacion:', error);
            res.status(500).json({
                status: 'error',
                message: 'Error al obtener formación',
                data: null,
            });
        }
    }

    /**
     * POST /api/formaciones
     * Crea una nueva formación
     */
    async createFormacion(req, res) {
        try {
            const { codigo, nombre, jornada, fecha_inicio, fecha_fin, activo = true } = req.body;

            // Validaciones
            if (!codigo || !nombre || !jornada || !fecha_inicio) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Código, nombre, jornada y fecha de inicio son requeridos',
                    data: null,
                });
            }

            // Validar jornada
            const jornadasPermitidas = ['mañana', 'tarde', 'noche', 'mixta'];
            if (!jornadasPermitidas.includes(jornada)) {
                return res.status(400).json({
                    status: 'error',
                    message: `Jornada inválida. Jornadas permitidas: ${jornadasPermitidas.join(', ')}`,
                    data: null,
                });
            }

            const newCodigo = await formacionService.createFormacion({
                codigo,
                nombre,
                jornada,
                fecha_inicio,
                fecha_fin,
                activo,
            });

            res.status(201).json({
                status: 'success',
                message: 'Formación creada exitosamente',
                data: { codigo: newCodigo },
            });
        } catch (error) {
            console.error('[formaciones.controller] Error en createFormacion:', error);

            if (error.message.includes('Ya existe')) {
                return res.status(409).json({
                    status: 'error',
                    message: error.message,
                    data: null,
                });
            }

            if (error.message.includes('fecha')) {
                return res.status(400).json({
                    status: 'error',
                    message: error.message,
                    data: null,
                });
            }

            res.status(500).json({
                status: 'error',
                message: 'Error al crear formación',
                data: null,
            });
        }
    }

    /**
     * PUT /api/formaciones/:codigo
     * Actualiza una formación
     */
    async updateFormacion(req, res) {
        try {
            const { id: codigo } = req.params;
            const { codigo: newCodigo, nombre, jornada, fecha_inicio, fecha_fin } = req.body;

            if (!codigo) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Código inválido',
                    data: null,
                });
            }

            // Validar que al menos un campo esté presente
            if (!codigo && !nombre && !jornada && !fecha_inicio && fecha_fin === undefined) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Debe enviar al menos un campo para actualizar',
                    data: null,
                });
            }

            const updateData = {};
            if (newCodigo) updateData.codigo = newCodigo;
            if (nombre) updateData.nombre = nombre;
            if (jornada) updateData.jornada = jornada;
            if (fecha_inicio) updateData.fecha_inicio = fecha_inicio;
            if (fecha_fin !== undefined) updateData.fecha_fin = fecha_fin;

            const updated = await formacionService.updateFormacion(codigo, updateData);

            if (!updated) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Formación no encontrada',
                    data: null,
                });
            }

            res.status(200).json({
                status: 'success',
                message: 'Formación actualizada exitosamente',
                data: { codigo: newCodigo || codigo },
            });
        } catch (error) {
            console.error('[formaciones.controller] Error en updateFormacion:', error);

            if (error.message.includes('código ya está en uso')) {
                return res.status(409).json({
                    status: 'error',
                    message: error.message,
                    data: null,
                });
            }

            res.status(500).json({
                status: 'error',
                message: 'Error al actualizar formación',
                data: null,
            });
        }
    }

    /**
     * PUT /api/formaciones/:codigo/toggle
     * Activa o desactiva una formación
     */
    async toggleFormacion(req, res) {
        try {
            const { id: codigo } = req.params;

            if (!codigo) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Código inválido',
                    data: null,
                });
            }

            const updated = await formacionService.toggleFormacionStatus(codigo);

            if (!updated) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Formación no encontrada',
                    data: null,
                });
            }

            res.status(200).json({
                status: 'success',
                message: 'Estado de formación actualizado exitosamente',
                data: { codigo },
            });
        } catch (error) {
            console.error('[formaciones.controller] Error en toggleFormacion:', error);
            res.status(500).json({
                status: 'error',
                message: 'Error al cambiar estado de formación',
                data: null,
            });
        }
    }

    /**
     * DELETE /api/formaciones/:codigo
     * Elimina una formación permanentemente
     */
    async deleteFormacion(req, res) {
        try {
            const { id: codigo } = req.params;

            if (!codigo) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Código inválido',
                    data: null,
                });
            }

            const deleted = await formacionService.deleteFormacion(codigo);

            if (!deleted) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Formación no encontrada',
                    data: null,
                });
            }

            res.status(200).json({
                status: 'success',
                message: 'Formación eliminada exitosamente',
                data: { codigo },
            });
        } catch (error) {
            console.error('[formaciones.controller] Error en deleteFormacion:', error);

            if (error.message.includes('aprendices activos')) {
                return res.status(400).json({
                    status: 'error',
                    message: error.message,
                    data: null,
                });
            }

            // Error de foreign key
            if (error.code === 'ER_ROW_IS_REFERENCED_2') {
                return res.status(400).json({
                    status: 'error',
                    message: 'No se puede eliminar la formación porque tiene registros asociados',
                    data: null,
                });
            }

            res.status(500).json({
                status: 'error',
                message: 'Error al eliminar formación',
                data: null,
            });
        }
    }
}

module.exports = new FormacionesController();
