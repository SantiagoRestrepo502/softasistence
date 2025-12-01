import { Scanner } from '@yudiel/react-qr-scanner';
import { useState } from 'react';

export default function QRScanner({ onScan, onClose }) {
    const [error, setError] = useState(null);

    const handleScan = (detectedCodes) => {
        if (detectedCodes && detectedCodes.length > 0) {
            const rawValue = detectedCodes[0].rawValue;
            if (rawValue) {
                onScan(rawValue);
            }
        }
    };

    const handleError = (err) => {
        console.error("QR Scan Error:", err);
        setError("Error al acceder a la cámara. Asegúrate de dar permisos.");
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden relative">
                <div className="p-4 bg-gray-800 text-white flex justify-between items-center">
                    <h3 className="font-bold text-lg">Escanear Código QR</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-300 hover:text-white"
                    >
                        ✕
                    </button>
                </div>

                <div className="p-0 relative bg-black h-80 flex items-center justify-center">
                    {error ? (
                        <div className="text-white text-center p-4">
                            <p className="text-red-400 mb-2">⚠️ {error}</p>
                            <button onClick={onClose} className="bg-white text-black px-4 py-2 rounded">Cerrar</button>
                        </div>
                    ) : (
                        <Scanner
                            onScan={handleScan}
                            onError={handleError}
                            components={{
                                audio: false,
                                onOff: true,
                                torch: true,
                                zoom: true,
                                finder: true,
                            }}
                            styles={{
                                container: { width: '100%', height: '100%' }
                            }}
                        />
                    )}
                </div>

                <div className="p-4 text-center">
                    <p className="text-sm text-gray-600">
                        Apunta la cámara al código QR del estudiante.
                    </p>
                </div>
            </div>
        </div>
    );
}
