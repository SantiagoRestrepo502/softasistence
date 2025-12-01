// routes.js - Configuration for web routes

import Login from './pages/Login.jsx';
import Register from './components/Register.jsx';
import Index from './components/index.jsx';
import Home from './pages/Home.jsx';
import Asistencia from './pages/Asistencia.jsx';
import Calendario from './pages/Calendario.jsx';
import Contacto from './pages/ContactPage.jsx';
import Formacion from './pages/Formacion.jsx';
import RegistroAprendizPage from './pages/Registro-aprendiz.jsx';
import Admin from './pages/Admin.jsx';

// Admin Sub-pages
import AdminDashboard from './pages/AdminPanel/AdminDashboard.jsx';
import UserManagement from './pages/AdminPanel/UserManagement.jsx';
import AprendicesManagement from './pages/AdminPanel/AprendicesManagement.jsx';
import FormacionesManagement from './pages/AdminPanel/FormacionesManagement.jsx';
import ConfigurationPage from './pages/AdminPanel/ConfigurationPage.jsx';

export const routes = [
  {
    path: '/',
    name: 'Login',
    component: Login,
    protected: false,
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    protected: false,
  },
  {
    path: '/index',
    name: 'Index',
    component: Index,
    protected: false,
  },
  {
    path: '/home',
    name: 'Home',
    component: Home,
    protected: true,
  },
  {
    path: '/asistencia',
    name: 'Asistencia',
    component: Asistencia,
    protected: true,
  },
  {
    path: '/calendario',
    name: 'Calendario',
    component: Calendario,
    protected: true,
  },
  {
    path: '/soy-aprendiz',
    name: 'Soy Aprendiz',
    component: Register,
    protected: false,
  },
  {
    path: '/contacto',
    name: 'Contacto',
    component: Contacto,
    protected: false,
  },
  {
    path: '/formacion',
    name: 'Formacion',
    component: Formacion,
    protected: true,
  },
  {
    path: '/generar-qr',
    name: 'Generar QR',
    component: RegistroAprendizPage,
    protected: false,
  },
  {
    path: '/admin',
    name: 'Admin',
    component: Admin,
    protected: true,
    children: [
      { path: 'dashboard', name: 'Dashboard', component: AdminDashboard, index: true },
      { path: 'usuarios', name: 'Usuarios', component: UserManagement },
      { path: 'aprendices', name: 'Aprendices', component: AprendicesManagement },
      { path: 'formaciones', name: 'Formaciones', component: FormacionesManagement },
      { path: 'configuracion', name: 'Configuración', component: ConfigurationPage },
    ]
  },
];

// Function to get route by path
export const getRouteByPath = (path) => {
  return routes.find(route => route.path === path);
};

// Function to get all routes
export const getAllRoutes = () => {
  return routes;
};