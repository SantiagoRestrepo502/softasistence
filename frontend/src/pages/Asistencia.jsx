import RegistroAsistencia from '../components/asistencia/RegistroAsistencia.jsx';
import CalendarioAsistencia from '../components/asistencia/calendario.jsx';

export default function Asistencia() {
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <RegistroAsistencia />
        </div>
        <div>
          <CalendarioAsistencia />
        </div>
      </div>
    </div>
  );
}