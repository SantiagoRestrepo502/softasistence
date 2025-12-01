import { useEffect, useState } from "react";
import api from "../../utils/api.js";
import FaceCapture from "../../biometrics/FaceCapture";

export default function SalaEspera({ onAtras, onFinalizar, sessionData }) {
    const [alertMessage, setAlertMessage] = useState(null);
    const [status, setStatus] = useState("Esperando registros...");
    const [manualId, setManualId] = useState("");
    const [showManualInput, setShowManualInput] = useState(false);
    const [showBiometric, setShowBiometric] = useState(false);

    const registerAttendance = async (aprendizData) => {
        try {
            const payload = {
                ...sessionData,
                documento: aprendizData.documento,
                rol: "aprendiz"
            };

            const response = await api.registerAttendance(payload);

            setAlertMessage({ type: 'success', text: `¡Bienvenido/a!` });
            setStatus(`Asistencia registrada: ${aprendizData.documento}`);

            setTimeout(() => {
                setAlertMessage(null);
                setStatus("Esperando registros...");
            }, 3000);

        } catch (error) {
            console.error("[SalaEspera] Error registro asistencia:", error);
            if (error.message.includes('ya registrada')) {
                setAlertMessage({ type: 'warning', text: 'Ya registrado hoy' });
            } else {
                setAlertMessage({ type: 'error', text: 'Error al registrar' });
            }
            setTimeout(() => setAlertMessage(null), 3000);
        }
    };

    const handleManualSubmit = (e) => {
        e.preventDefault();
        if (manualId) {
            registerAttendance({ documento: manualId });
            setManualId("");
            setShowManualInput(false);
        }
    };

    const handleBiometricCapture = async (embedding) => {
        try {
            setStatus("Verificando identidad...");
            // Usar el nuevo endpoint biométrico
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'}/biometric/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    embedding,
                    jornada: sessionData.jornada,
                    nombreFormacion: sessionData.nombreFormacion,
                    ficha: sessionData.ficha
                })
            });

            const data = await response.json();

            if (data.ok) {
                setAlertMessage({ type: 'success', text: `¡Bienvenido/a ${data.aprendiz.nombres}!` });
                setStatus(`Asistencia registrada: ${data.aprendiz.documento}`);
                setShowBiometric(false);
            } else {
                if (data.error === 'Asistencia ya registrada hoy') {
                    setAlertMessage({ type: 'warning', text: 'Ya registrado hoy' });
                } else {
                    setAlertMessage({ type: 'error', text: data.error || 'No reconocido' });
                }
            }

            setTimeout(() => {
                setAlertMessage(null);
                setStatus("Esperando registros...");
            }, 3000);

        } catch (error) {
            console.error("Error biométrico:", error);
            setAlertMessage({ type: 'error', text: 'Error de conexión' });
            setTimeout(() => setAlertMessage(null), 3000);
        }
    };

    return (
        <div className="relative min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
            {/* Header Flotante */}
            <div className="absolute top-4 left-0 w-full px-4 z-20">
                <div className="max-w-4xl mx-auto bg-white/10 backdrop-blur-md rounded-2xl p-4 flex justify-between items-center text-white border border-white/20 shadow-lg">
                    <div>
                        <h2 className="font-bold text-lg">{sessionData.nombreFormacion}</h2>
                        <p className="text-sm text-gray-300">Ficha: {sessionData.ficha}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                        </span>
                        <span className="text-sm font-mono text-green-400">{status}</span>
                    </div>
                </div>

                {/* Alerta de Estado */}
                {alertMessage && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-30 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className={`transform scale-110 px-8 py-6 rounded-3xl shadow-2xl text-center border-2 ${alertMessage.type === 'success' ? 'bg-green-900/90 border-green-500 text-white' :
                            alertMessage.type === 'warning' ? 'bg-yellow-900/90 border-yellow-500 text-white' :
                                'bg-red-900/90 border-red-500 text-white'
                            }`}>
                            <div className="text-6xl mb-4">
                                {alertMessage.type === 'success' ? '✅' :
                                    alertMessage.type === 'warning' ? '⚠️' : '❌'}
                            </div>
                            <h3 className="text-3xl font-bold mb-2">{alertMessage.text}</h3>
                        </div>
                    </div>
                )}
            </div>

            {/* Área Principal */}
            <div className="relative max-w-4xl w-full bg-gray-800/50 rounded-3xl overflow-hidden shadow-2xl border-2 border-gray-700/50 backdrop-blur-sm p-8 flex flex-col items-center justify-center text-center min-h-[400px]">

                {showBiometric ? (
                    <FaceCapture
                        onCapture={handleBiometricCapture}
                        onCancel={() => setShowBiometric(false)}
                    />
                ) : (
                    <>
                        <div className="mb-8 p-6 bg-green-600/20 rounded-full animate-pulse">
                            <svg className="w-24 h-24 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-4">Registro de Asistencia</h3>
                        <p className="text-gray-400 max-w-md mb-8">
                            Utiliza el reconocimiento facial o ingresa tu documento manualmente.
                        </p>

                        <div className="flex flex-col gap-4 w-full max-w-md">
                            <button
                                onClick={() => setShowBiometric(true)}
                                className="px-8 py-4 rounded-xl bg-green-600 text-white hover:bg-green-700 transition font-bold text-lg shadow-lg shadow-green-900/20 flex items-center justify-center gap-3"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                </svg>
                                Escanear Rostro
                            </button>

                            <button
                                onClick={() => setShowManualInput(true)}
                                className="px-8 py-4 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition font-bold text-lg shadow-lg shadow-blue-900/20 flex items-center justify-center gap-3"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Registro Manual
                            </button>
                        </div>
                    </>
                )}
            </div>

            {/* Controles Inferiores */}
            <div className="mt-8 flex gap-4">
                <button
                    onClick={onAtras}
                    className="px-6 py-3 rounded-xl bg-gray-800 text-white hover:bg-gray-700 transition font-medium border border-gray-700"
                >
                    Volver
                </button>

                <button
                    onClick={onFinalizar}
                    className="px-6 py-3 rounded-xl bg-green-600 text-white hover:bg-green-700 transition font-medium shadow-lg shadow-green-900/20"
                >
                    Finalizar Sesión
                </button>
            </div>

            {/* Modal de Entrada Manual */}
            {
                showManualInput && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">Registro Manual</h3>
                            <form onSubmit={handleManualSubmit}>
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Número de Documento
                                    </label>
                                    <input
                                        type="text"
                                        value={manualId}
                                        onChange={(e) => setManualId(e.target.value.replace(/\D/g, ''))}
                                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none text-lg"
                                        placeholder="Ej: 1000123456"
                                        autoFocus
                                    />
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowManualInput(false)}
                                        className="flex-1 px-4 py-3 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700"
                                    >
                                        Registrar
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
