import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import api from "../../utils/api.js";
import QRScanner from "./Scanner.jsx";
import SalaEspera from "./asistencia_espera.jsx";

export default function RegistroAsistencia() {
  const { user } = useOutletContext();
  const [formacion, setFormacion] = useState(null);
  const [formaciones, setFormaciones] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [lastScanned, setLastScanned] = useState(null);
  const [showBiometric, setShowBiometric] = useState(false);

  useEffect(() => {
    fetchFormaciones();
  }, []);

  const fetchFormaciones = async () => {
    try {
      const data = await api.getFormaciones();
      setFormaciones(data.data.formaciones || []);
    } catch (error) {
      console.error("Error al cargar formaciones:", error);
    }
  };

  const handleBiometricStart = () => {
    if (!formacion) {
      alert("⚠️ Por favor selecciona una formación antes de iniciar.");
      return;
    }
    setShowBiometric(true);
  };

  const handleScan = async (documento) => {
    if (!formacion) {
      alert("⚠️ Por favor selecciona una formación primero.");
      return;
    }

    if (lastScanned === documento) return;
    setLastScanned(documento);

    const payload = {
      jornada: formacion.jornada,
      ficha: formacion.codigo,
      nombreFormacion: formacion.nombre,
      documento: documento,
      rol: "aprendiz",
      instructor: user ? `${user.nombre} ${user.apellido}` : "Instructor no identificado"
    };

    try {
      const result = await api.registerAttendance(payload);
      console.log("Asistencia registrada:", result);
      // Feedback visual más sutil podría ir aquí
      alert(`✅ Asistencia registrada para: ${documento}`);
    } catch (e) {
      console.error("Error registro:", e);
      alert(`❌ Error al registrar ${documento}: ${e.message || "Error desconocido"}`);
    }

    setTimeout(() => setLastScanned(null), 3000);
  };

  const handleSelectFormacion = (f) => {
    setFormacion(f);
    setSearchTerm(`${f.codigo} - ${f.nombre} (${f.jornada})`);
    setShowDropdown(false);
  };

  const filteredFormaciones = formaciones.filter((f) => {
    const term = searchTerm.toLowerCase();
    return (
      f.codigo.toLowerCase().includes(term) ||
      f.nombre.toLowerCase().includes(term)
    );
  });

  if (showBiometric) {
    return (
      <SalaEspera
        onAtras={() => setShowBiometric(false)}
        onFinalizar={() => setShowBiometric(false)}
        sessionData={{
          jornada: formacion.jornada,
          ficha: formacion.codigo,
          nombreFormacion: formacion.nombre,
          instructor: user ? `${user.nombre} ${user.apellido}` : "Instructor no identificado"
        }}
      />
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-white border-0 rounded-3xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-800 px-8 py-10 text-white relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-3xl font-bold mb-2">Registro de Asistencia</h1>
            <p className="text-green-100 text-lg">Selecciona la formación y el método de registro</p>
          </div>
          <div className="absolute right-0 top-0 h-full w-1/3 bg-white/10 transform skew-x-12 translate-x-12"></div>
        </div>

        <div className="p-8">
          {/* Selector de Formación */}
          <div className="mb-10 max-w-2xl mx-auto">
            <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">
              Seleccionar Formación
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400 group-focus-within:text-green-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <input
                type="text"
                className="block w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-green-500 focus:bg-white transition-all duration-200 text-lg"
                placeholder="Buscar por código o nombre..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
              />
              {showDropdown && filteredFormaciones.length > 0 && (
                <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 max-h-80 overflow-y-auto overflow-hidden">
                  {filteredFormaciones.map((f) => (
                    <div
                      key={f.codigo}
                      className="px-6 py-4 hover:bg-green-50 cursor-pointer transition-colors border-b border-gray-50 last:border-0"
                      onMouseDown={() => handleSelectFormacion(f)}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-bold text-gray-800 text-lg">{f.codigo}</p>
                          <p className="text-gray-600">{f.nombre}</p>
                        </div>
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold uppercase tracking-wide">
                          {f.jornada}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Opciones de Registro */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Opción Biométrica */}
            <div
              onClick={handleBiometricStart}
              className="group relative bg-white border-2 border-gray-100 rounded-2xl p-8 hover:border-green-500 hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <svg className="w-32 h-32 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>

              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">Reconocimiento Facial</h3>
                <p className="text-gray-500 mb-6">
                  Rápido y seguro. Solo necesitas mirar a la cámara para registrar tu asistencia automáticamente.
                </p>
                <span className="text-green-600 font-semibold group-hover:translate-x-1 transition-transform flex items-center">
                  Iniciar Cámara
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </div>
            </div>

            {/* Opción QR */}
            <div
              onClick={() => {
                if (!formacion) {
                  alert("⚠️ Por favor selecciona una formación primero.");
                  return;
                }
                setScanning(true);
              }}
              className="group relative bg-white border-2 border-gray-100 rounded-2xl p-8 hover:border-blue-500 hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <svg className="w-32 h-32 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
              </div>

              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">Escáner QR</h3>
                <p className="text-gray-500 mb-6">
                  Usa la cámara para escanear los códigos QR de los aprendices. Ideal si el reconocimiento facial falla.
                </p>
                <span className="text-blue-600 font-semibold group-hover:translate-x-1 transition-transform flex items-center">
                  Escanear QR
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {scanning && (
        <QRScanner
          onScan={handleScan}
          onClose={() => setScanning(false)}
        />
      )}
    </div>
  );
}
