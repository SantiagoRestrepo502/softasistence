import { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Header from './header';
import Nav from './Nav';

export default function Layout() {
    const [user, setUser] = useState(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // Verificar si hay usuario en localStorage
        const storedUser = localStorage.getItem('user');

        if (!storedUser) {
            // Si no hay usuario, redirigir al login
            navigate('/');
            return;
        }

        try {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
        } catch (error) {
            console.error('Error al leer usuario del storage:', error);
            localStorage.removeItem('user');
            navigate('/');
        }
    }, [navigate]);

    // Evitar renderizar el contenido protegido si no hay usuario (mientras redirige)
    if (!user) {
        return null;
    }

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar de navegación */}
            {menuOpen && <Nav onClose={() => setMenuOpen(false)} />}

            <div className="flex-1 flex flex-col">
                {/* Header con botón de menú y usuario */}
                <Header
                    user={user}
                    onMenuToggle={() => {
                        console.log("Toggle menu clicked. Current state:", menuOpen);
                        setMenuOpen(prev => !prev);
                    }}
                />

                {/* Contenido de la página */}
                <main className="flex-1">
                    <Outlet context={{ user }} />
                </main>
            </div>
        </div>
    );
}
