export default function SalaEsperaCards({ asistentes }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {asistentes.map((asistente) => (
                <div
                    key={asistente.id}
                    className="bg-white rounded-lg shadow-md p-4 border-l-4 border-green-600 hover:shadow-lg transition-shadow"
                >
                    <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                <svg
                                    className="w-6 h-6 text-green-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                    />
                                </svg>
                            </div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                                Bienvenido
                            </p>
                            <p className="text-sm text-gray-600 truncate font-semibold">
                                {asistente.nombre}
                            </p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
