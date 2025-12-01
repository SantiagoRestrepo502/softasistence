const { pool } = require('../db');

// Umbral de similitud para considerar un match (0.0 a 1.0)
// MediaPipe Image Embedder usa similitud coseno.
// Valores típicos: > 0.6 o 0.7 para match.
const MATCH_THRESHOLD = 0.65;

/**
 * Calcula la similitud coseno entre dos vectores
 * @param {number[]} u 
 * @param {number[]} v 
 * @returns {number} Similitud (-1 a 1)
 */
function cosineSimilarity(u, v) {
    if (!u || !v || u.length !== v.length) return 0;
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < u.length; i++) {
        dotProduct += u[i] * v[i];
        normA += u[i] * u[i];
        normB += v[i] * v[i];
    }
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Verifica la identidad de un usuario basado en su embedding facial
 * @param {number[]} queryEmbedding - Embedding capturado
 * @returns {Promise<object|null>} Datos del aprendiz si hay match, null si no
 */
async function verifyIdentity(queryEmbedding) {
    try {
        console.log('[BiometricService] Starting verification with embedding length:', queryEmbedding.length);

        // 1. Obtener todos los aprendices con descriptor facial
        const [rows] = await pool.query(
            'SELECT id_aprendices, documento, nombres, apellidos, face_descriptor FROM aprendices WHERE face_descriptor IS NOT NULL AND activo = 1'
        );

        console.log(`[BiometricService] Found ${rows.length} aprendices with face_descriptor`);

        let bestMatch = null;
        let maxSimilarity = -1;

        for (const row of rows) {
            try {
                let storedEmbedding;
                if (typeof row.face_descriptor === 'string') {
                    storedEmbedding = JSON.parse(row.face_descriptor);
                } else {
                    storedEmbedding = row.face_descriptor;
                }

                console.log(`[BiometricService] Checking aprendiz ${row.documento}: stored length=${storedEmbedding?.length}, query length=${queryEmbedding.length}`);

                if (!Array.isArray(storedEmbedding) || storedEmbedding.length !== queryEmbedding.length) {
                    console.log(`[BiometricService] Skipping aprendiz ${row.documento}: length mismatch`);
                    continue;
                }

                const similarity = cosineSimilarity(queryEmbedding, storedEmbedding);
                console.log(`[BiometricService] Similarity with ${row.documento}: ${similarity.toFixed(4)}`);

                if (similarity > maxSimilarity) {
                    maxSimilarity = similarity;
                    bestMatch = row;
                }
            } catch (e) {
                console.warn(`[BiometricService] Error parseando descriptor para aprendiz ${row.id_aprendices}:`, e);
            }
        }

        console.log(`[BiometricService] Max Similarity: ${maxSimilarity.toFixed(4)} (Threshold: ${MATCH_THRESHOLD})`);

        if (maxSimilarity >= MATCH_THRESHOLD) {
            return {
                ...bestMatch,
                similarity: maxSimilarity
            };
        }

        return null;

    } catch (error) {
        console.error('[BiometricService] Error en verifyIdentity:', error);
        throw error;
    }
}

module.exports = {
    verifyIdentity,
    MATCH_THRESHOLD
};
