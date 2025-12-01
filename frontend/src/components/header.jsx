export default function Header({ user, onMenuToggle }) {
  const displayName = user ? `${user.nombre} ${user.apellido}` : "Usuario";

  return (
    <header className="w-full h-16 px-6 gradient-primary flex items-center justify-between shadow-md">
      {/* Menú hamburguesa a la izquierda */}
      <button
        className="flex items-center justify-center rounded-lg hover:bg-white hover:bg-opacity-10 transition-all duration-200 h-10 w-10"
        onClick={() => {
          console.log("Header button clicked");
          onMenuToggle();
        }}
        aria-label="Abrir menú de navegación"
      >
        <svg
          className="w-6 h-6 text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2.5}
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
      </button>

      {/* Lado derecho: notificación y usuario */}
      <div className="flex items-center gap-6">
        {/* Notificación */}
        <div className="relative cursor-pointer group">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-white hover:bg-opacity-10 transition-all duration-200">
            <svg
              className="w-6 h-6 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
          </div>
          <span className="absolute top-1 right-1 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white pulse"></span>
        </div>

        {/* Usuario */}
        <div className="flex items-center gap-3 cursor-pointer group">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-all duration-200">
            <svg
              className="w-6 h-6 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          </div>
          <div className="hidden md:flex flex-col">
            <span className="text-white font-semibold text-sm leading-tight">{displayName}</span>
            <span className="text-white text-xs opacity-80">{user?.rol || 'Usuario'}</span>
          </div>
          <svg
            className="w-4 h-4 text-white opacity-80 group-hover:opacity-100 transition-opacity"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </div>
      </div>
    </header>
  );
}
