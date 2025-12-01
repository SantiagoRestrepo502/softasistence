import { ImageEmbedder, FilesetResolver } from "@mediapipe/tasks-vision";

let imageEmbedder = null;

export const BiometricService = {
    /**
     * Inicializa el modelo Image Embedder de MediaPipe
     */
    async initialize() {
        if (imageEmbedder) return imageEmbedder;

        try {
            const vision = await FilesetResolver.forVisionTasks(
                "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
            );

            imageEmbedder = await ImageEmbedder.createFromOptions(vision, {
                baseOptions: {
                    modelAssetPath: `https://storage.googleapis.com/mediapipe-models/image_embedder/mobilenet_v3_small/float32/1/mobilenet_v3_small.tflite`
                },
                runningMode: "VIDEO",
                quantize: false // Usar float32 para mayor precisión
            });

            console.log("[BiometricService] Modelo inicializado correctamente");
            return imageEmbedder;
        } catch (error) {
            console.error("[BiometricService] Error inicializando modelo:", error);
            throw error;
        }
    },

    /**
     * Genera un embedding facial a partir de un elemento de video
     * @param {HTMLVideoElement} videoElement 
     * @param {number} timestamp 
     */
    generateEmbedding(videoElement, timestamp) {
        if (!imageEmbedder) {
            throw new Error("Modelo no inicializado");
        }

        const result = imageEmbedder.embedForVideo(videoElement, timestamp);

        if (result.embeddings && result.embeddings.length > 0) {
            // Retornar el primer embedding (asumiendo un solo rostro por ahora)
            // floatEmbedding es un Float32Array
            return result.embeddings[0].floatEmbedding;
        }
        return null;
    },

    /**
     * Calcula la similitud coseno entre dos embeddings
     * @param {number[]} u 
     * @param {number[]} v 
     */
    cosineSimilarity(u, v) {
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
};
