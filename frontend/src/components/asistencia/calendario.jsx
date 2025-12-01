import { useState, useEffect } from "react";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameDay, isSameMonth, addDays, isToday } from "date-fns";
import { es } from "date-fns/locale";

function getMonthDays(monthDate) {
  const monthStart = startOfMonth(monthDate);
  const monthEnd = endOfMonth(monthDate);
  let day = startOfWeek(monthStart, { weekStartsOn: 0 }); // Domingo como inicio
  const days = [];

  // Generar días hasta cubrir todo el mes y completar las semanas
  while (day <= monthEnd || days.length % 7 !== 0) {
    days.push(day);
    day = addDays(day, 1);
  }

  // Agrupar en semanas
  const weeks = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }
  return weeks;
}

export default function CalendarioAsistencia() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDays, setSelectedDays] = useState([]);

  // Al montar, seleccionar el día actual automáticamente
  useEffect(() => {
    setSelectedDays([new Date()]);
  }, []);

  const weeks = getMonthDays(currentMonth);

  // Determinar jornada actual para mostrarla
  const getJornadaActual = () => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) return "Mañana";
    if (hour >= 12 && hour < 18) return "Tarde";
    return "Noche";
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-xl border border-gray-200">
      <div className="flex justify-between items-center mb-6">
        {/* Botones de navegación ocultos/deshabilitados para forzar mes actual */}
        <button className="text-gray-300 cursor-not-allowed" disabled>
          &lt;
        </button>
        <div className="font-bold text-xl text-gray-800 capitalize">
          {format(currentMonth, "MMMM yyyy", { locale: es })}
        </div>
        <button className="text-gray-300 cursor-not-allowed" disabled>
          &gt;
        </button>
      </div>

      {/* Indicador de Jornada Actual */}
      <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded text-center">
        <p className="text-green-800 font-medium">
          Fecha: {format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: es })}
        </p>
        <p className="text-sm text-green-600">
          Jornada Actual: <strong>{getJornadaActual()}</strong>
        </p>
      </div>

      {/* Días de la semana */}
      <div className="grid grid-cols-7 gap-2 text-center text-gray-500 mb-4 font-semibold text-sm">
        {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>

      {/* Renderizar semanas y días */}
      <div className="grid grid-cols-7 gap-2">
        {weeks.map((week, iw) =>
          week.map((day, id) => {
            const isDayToday = isToday(day);
            const isCurrentMonth = isSameMonth(day, currentMonth);

            return (
              <div
                key={`${iw}-${id}`}
                className={`
                  h-10 w-10 flex items-center justify-center rounded-full text-sm font-medium transition-all
                  ${!isCurrentMonth ? "text-gray-300" : ""}
                  ${isDayToday
                    ? "bg-green-600 text-white shadow-lg scale-110 ring-2 ring-green-200"
                    : "text-gray-400 cursor-not-allowed opacity-50"
                  }
                `}
              >
                {format(day, "d")}
              </div>
            );
          })
        )}
      </div>

      <div className="mt-6 text-gray-500 text-xs text-center">
        * Solo se permite registrar asistencia para el día y jornada actual.
      </div>
    </div>
  );
}
