// Controlador de asistencia (Biometría eliminada)

async function registrarBiometrica(req, res) {
    return res.status(501).json({
        ok: false,
        error: 'Biometría en mantenimiento/actualización'
    });
}

module.exports = {
    registrarBiometrica
};
