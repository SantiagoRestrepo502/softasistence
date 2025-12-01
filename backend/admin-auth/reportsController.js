/**
 * Controlador de Reportes
 * Endpoints para estadísticas de asistencia
 */

const reportsService = require('../services/reports.service');

/**
 * GET /api/reports/statistics
 * Obtiene estadísticas generales del sistema
 */
async function getStatistics(req, res) {
    try {
        const { startDate, endDate } = req.query;

        const statistics = await reportsService.getGeneralStatistics({ startDate, endDate });

        res.status(200).json({
            status: 'success',
            message: 'Estadísticas obtenidas exitosamente',
            data: statistics,
        });
    } catch (error) {
        console.error('[reports.controller] Error en getStatistics:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error al obtener estadísticas',
            data: null,
        });
    }
}

/**
 * GET /api/reports/formacion/:id
 * Obtiene estadísticas de asistencia por formación
 */
async function getFormacionReport(req, res) {
    try {
        const { id } = req.params;
        const { startDate, endDate } = req.query;

        if (!id || isNaN(Number(id))) {
            return res.status(400).json({
                status: 'error',
                message: 'ID de formación inválido',
                data: null,
            });
        }

        const report = await reportsService.getAttendanceByFormacion(Number(id), { startDate, endDate });

        res.status(200).json({
            status: 'success',
            message: 'Reporte de formación obtenido exitosamente',
            data: report,
        });
    } catch (error) {
        console.error('[reports.controller] Error en getFormacionReport:', error);
        res.status(500).json({
            status: 'error',
            message: error.message || 'Error al obtener reporte de formación',
            data: null,
        });
    }
}

/**
 * GET /api/reports/aprendiz/:id
 * Obtiene estadísticas de asistencia por aprendiz
 */
async function getAprendizReport(req, res) {
    try {
        const { id } = req.params;
        const { startDate, endDate } = req.query;

        if (!id || isNaN(Number(id))) {
            return res.status(400).json({
                status: 'error',
                message: 'ID de aprendiz inválido',
                data: null,
            });
        }

        const report = await reportsService.getAttendanceByAprendiz(Number(id), { startDate, endDate });

        res.status(200).json({
            status: 'success',
            message: 'Reporte de aprendiz obtenido exitosamente',
            data: report,
        });
    } catch (error) {
        console.error('[reports.controller] Error en getAprendizReport:', error);
        res.status(500).json({
            status: 'error',
            message: error.message || 'Error al obtener reporte de aprendiz',
            data: null,
        });
    }
}

/**
 * GET /api/reports/instructor/:id
 * Obtiene resumen de asistencias para un instructor
 */
async function getInstructorReport(req, res) {
    try {
        const { id } = req.params;
        const { startDate, endDate } = req.query;

        if (!id || isNaN(Number(id))) {
            return res.status(400).json({
                status: 'error',
                message: 'ID de instructor inválido',
                data: null,
            });
        }

        const report = await reportsService.getInstructorSummary(Number(id), { startDate, endDate });

        res.status(200).json({
            status: 'success',
            message: 'Resumen de instructor obtenido exitosamente',
            data: report,
        });
    } catch (error) {
        console.error('[reports.controller] Error en getInstructorReport:', error);
        res.status(500).json({
            status: 'error',
            message: error.message || 'Error al obtener resumen de instructor',
            data: null,
        });
    }
}

module.exports = {
    getStatistics,
    getFormacionReport,
    getAprendizReport,
    getInstructorReport,
};
