const biometricService = require('../services/biometric.service');
const { pool } = require('../db');
const { sendToGoogleSheets } = require('../services/sheets.service');

async function verifyAndRegisterAttendance(req, res) {
    try {
        const { embedding, jornada, nombreFormacion, ficha } = req.body;

        console.log('[BiometricController] Request received:', {
            embeddingLength: embedding?.length,
            embeddingType: typeof embedding,
            isArray: Array.isArray(embedding),
            jornada,
            nombreFormacion,
            ficha
        });

        if (!embedding || !Array.isArray(embedding)) {
            return res.status(400).json({ ok: false, error: 'Embedding facial requerido' });
        }

        // 1. Verificar identidad
        console.log('[BiometricController] Calling verifyIdentity...');
        const match = await biometricService.verifyIdentity(embedding);
        console.log('[BiometricController] Match result:', match ? 'Found' : 'Not found');

        if (!match) {
            return res.status(404).json({ ok: false, error: 'Rostro no reconocido' });
        }

        // 2. Verificar si pertenece a la ficha (opcional, pero recomendado)
        // Si el aprendiz está en otra ficha, ¿se permite? Asumimos que sí, pero registramos la ficha actual.

        // 3. Verificar duplicados hoy
        const [existing] = await pool.query(
            'SELECT id_asistencias FROM asistencias WHERE fk_aprendiz = ? AND DATE(hora_registro) = CURDATE()',
            [match.id_aprendices]
        );

        if (existing.length > 0) {
            return res.status(409).json({
                ok: false,
                error: 'Asistencia ya registrada hoy',
                aprendiz: {
                    nombres: match.nombres,
                    apellidos: match.apellidos,
                    documento: match.documento
                }
            });
        }

        // 4. Registrar asistencia
        const horaEntrada = new Date().toLocaleTimeString('es-CO', {
            hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
        });

        const [result] = await pool.query(
            'INSERT INTO asistencias (fk_codigo_formacion, fk_aprendiz, presente, documento, hora_registro) VALUES (?, ?, 1, ?, NOW())',
            [ficha, match.id_aprendices, match.documento]
        );

        // 5. Enviar a Google Sheets
        sendToGoogleSheets({
            instructor: 'Biométrico', // O el instructor si se enviara
            formacion: `${ficha} - ${nombreFormacion}`,
            presente: 'Sí',
            hora_entrada: horaEntrada,
            nombre_aprendiz: `${match.nombres} ${match.apellidos}`
        });

        return res.json({
            ok: true,
            message: 'Asistencia registrada exitosamente',
            aprendiz: {
                nombres: match.nombres,
                apellidos: match.apellidos,
                documento: match.documento,
                similarity: match.similarity
            }
        });

    } catch (error) {
        console.error('[BiometricController] Error:', error);
        return res.status(500).json({ ok: false, error: 'Error interno del servidor' });
    }
}

module.exports = {
    verifyAndRegisterAttendance
};
