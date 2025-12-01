import { useState, useEffect, useRef } from 'react';
import { BiometricService } from '../biometrics/BiometricService';

export function useBiometric() {
    const [isModelLoaded, setIsModelLoaded] = useState(false);
    const [error, setError] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        let mounted = true;

        const loadModel = async () => {
            try {
                await BiometricService.initialize();
                if (mounted) setIsModelLoaded(true);
            } catch (err) {
                console.error("Error loading biometric model:", err);
                if (mounted) setError(err);
            }
        };

        loadModel();

        return () => {
            mounted = false;
        };
    }, []);

    const processFrame = (videoElement) => {
        if (!isModelLoaded || isProcessing) return null;

        try {
            setIsProcessing(true);
            const timestamp = Date.now();
            const embedding = BiometricService.generateEmbedding(videoElement, timestamp);
            return embedding;
        } catch (err) {
            console.error("Error processing frame:", err);
            return null;
        } finally {
            setIsProcessing(false);
        }
    };

    return {
        isModelLoaded,
        error,
        processFrame,
        calculateSimilarity: BiometricService.cosineSimilarity
    };
}
