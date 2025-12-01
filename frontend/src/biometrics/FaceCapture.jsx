import { useRef, useState, useEffect } from 'react';
import { useBiometric } from '../hooks/useBiometric';

export default function FaceCapture({ onCapture, onCancel }) {
    const videoRef = useRef(null);
    const { isModelLoaded, error, processFrame } = useBiometric();
    const [status, setStatus] = useState("Iniciando cámara...");
    const [progress, setProgress] = useState(0);
    const [isCapturing, setIsCapturing] = useState(false);

    // Referencias para el proceso de captura
    const streamRef = useRef(null);
    const framesRef = useRef([]);
    const MAX_FRAMES = 5;

    useEffect(() => {
        startCamera();
        return () => stopCamera();
    }, []);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: 640, height: 480, facingMode: 'user' }
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                streamRef.current = stream;
            }
            setStatus("Cámara lista. Ubícate frente a la cámara.");
        } catch (err) {
            console.error("Error accessing camera:", err);
            setStatus("Error al acceder a la cámara.");
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }
    };

    const handleCapture = async () => {
        if (!isModelLoaded) {
            alert("El modelo biométrico aún está cargando...");
            return;
        }

        setIsCapturing(true);
        setStatus("Capturando... Por favor no te muevas.");
        framesRef.current = [];
        setProgress(0);

        // Iniciar ráfaga de capturas
        const interval = setInterval(() => {
            if (framesRef.current.length >= MAX_FRAMES) {
                clearInterval(interval);
                finalizeCapture();
                return;
            }

            const embedding = processFrame(videoRef.current);
            if (embedding) {
                framesRef.current.push(embedding);
                setProgress((framesRef.current.length / MAX_FRAMES) * 100);
            }
        }, 200); // Capturar cada 200ms
    };

    const finalizeCapture = () => {
        setIsCapturing(false);
        if (framesRef.current.length === 0) {
            setStatus("No se pudo capturar el rostro. Intenta de nuevo.");
            return;
        }

        // Promediar embeddings
        const count = framesRef.current.length;
        const dim = framesRef.current[0].length;
        const avgEmbedding = new Float32Array(dim);

        for (let i = 0; i < dim; i++) {
            let sum = 0;
            for (let j = 0; j < count; j++) {
                sum += framesRef.current[j][i];
            }
            avgEmbedding[i] = sum / count;
        }

        setStatus("¡Captura exitosa!");
        // Convertir a array normal para serialización
        onCapture(Array.from(avgEmbedding));
    };

    return (
        <div className="flex flex-col items-center gap-6 p-6 bg-white rounded-2xl shadow-xl max-w-lg w-full">
            <h3 className="text-xl font-bold text-gray-800">Registro Biométrico</h3>

            <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden">
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover transform scale-x-[-1]"
                />

                {/* Overlay de estado */}
                <div className="absolute bottom-4 left-0 right-0 text-center">
                    <span className="bg-black/60 text-white px-4 py-2 rounded-full text-sm backdrop-blur-sm">
                        {status}
                    </span>
                </div>

                {/* Barra de progreso */}
                {isCapturing && (
                    <div className="absolute top-0 left-0 w-full h-1 bg-gray-200">
                        <div
                            className="h-full bg-green-500 transition-all duration-200"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                )}
            </div>

            <div className="flex gap-4 w-full">
                <button
                    onClick={onCancel}
                    disabled={isCapturing}
                    className="flex-1 py-3 px-6 rounded-xl border-2 border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition disabled:opacity-50"
                >
                    Cancelar
                </button>

                <button
                    onClick={handleCapture}
                    disabled={isCapturing || !isModelLoaded}
                    className="flex-1 py-3 px-6 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700 transition shadow-lg shadow-green-900/20 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {isCapturing ? (
                        <>
                            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Procesando...
                        </>
                    ) : (
                        "Capturar Rostro"
                    )}
                </button>
            </div>

            {!isModelLoaded && !error && (
                <p className="text-xs text-gray-500 animate-pulse">
                    Cargando modelo de IA...
                </p>
            )}
            {error && (
                <p className="text-xs text-red-500">
                    Error cargando modelo: {error.message}
                </p>
            )}
        </div>
    );
}
