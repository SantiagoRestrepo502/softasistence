import { createBrowserRouter, Navigate } from 'react-router-dom'
import Login from './pages/login.jsx'

const router = createBrowserRouter([
  { path: '/', element: <Navigate to='/login' replace /> },
  { path: '/login', element: <Login /> },
  { path: '*', element: <div className='p-8 text-center'>Ruta no encontrada</div> },
])

export default router