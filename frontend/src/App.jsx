import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { routes } from './routes.js';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const adminRoute = routes.find(r => r.path === '/admin');
  const otherProtectedRoutes = routes.filter(r => r.protected && r.path !== '/admin');
  const publicRoutes = routes.filter(r => !r.protected);

  return (
    <Router>
      <Routes>
        {/* Rutas Públicas */}
        {publicRoutes.map((route, index) => (
          <Route key={`public-${index}`} path={route.path} element={<route.component />} />
        ))}

        {/* Rutas Protegidas Estándar (con Layout Principal) */}
        <Route element={<Layout />}>
          {otherProtectedRoutes.map((route, index) => (
            <Route
              key={`protected-${index}`}
              path={route.path}
              element={
                <ProtectedRoute>
                  <route.component />
                </ProtectedRoute>
              }
            />
          ))}
        </Route>

        {/* Rutas de Admin (con Layout Admin propio) */}
        {adminRoute && (
          <Route
            path={adminRoute.path}
            element={
              <ProtectedRoute requireAdmin={false}>
                <adminRoute.component />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            {adminRoute.children && adminRoute.children.map((child, index) => (
              <Route
                key={`admin-child-${index}`}
                path={child.path}
                element={<child.component />}
              />
            ))}
          </Route>
        )}
      </Routes>
    </Router>
  );
}

export default App;