import React, { useState, useEffect } from 'react';
import Header from '../components/header';
import Nav from '../components/Nav';
import Contact from '../components/Contact';

const ContactPage = () => {
    const [user, setUser] = useState(null);
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        // Try to get user from local storage to display in header
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Error parsing user", e);
            }
        }
    }, []);

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar de navegación */}
            {menuOpen && <Nav onClose={() => setMenuOpen(false)} />}

            <div className="flex-1 flex flex-col">
                {/* Header con botón de menú y usuario */}
                <Header
                    user={user}
                    onMenuToggle={() => setMenuOpen(prev => !prev)}
                />

                {/* Contenido de la página */}
                <main className="flex-1 overflow-y-auto">
                    <Contact />
                </main>
            </div>
        </div>
    );
};

export default ContactPage;
