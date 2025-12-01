const GOOGLE_SHEETS_WEBHOOK_URL = process.env.GOOGLE_SHEETS_WEBHOOK_URL;

/**
 * Envía los datos de asistencia a Google Sheets
 * @param {object} data - Datos de la asistencia
 * @returns {Promise<void>}
 */
async function sendToGoogleSheets(data) {
    if (!GOOGLE_SHEETS_WEBHOOK_URL) {
        console.warn('[Sheets] URL de Webhook no configurada');
        return;
    }

    try {
        console.log('[Sheets] Enviando datos a Google Sheets...');

        const response = await fetch(GOOGLE_SHEETS_WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
            // Evitar que el request se cuelgue por mucho tiempo
            signal: AbortSignal.timeout(5000)
        });

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const result = await response.json();
        console.log('[Sheets] Enviado correctamente:', result);
    } catch (error) {
        // Error silencioso para no afectar el flujo principal
        console.error('[Sheets] Error al enviar a Google Sheets:', error.message);
    }
}

module.exports = {
    sendToGoogleSheets
};
