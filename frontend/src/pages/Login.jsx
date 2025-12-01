import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api.js';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ cedula: '', password: '' });
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const validate = (values) => {
    const errs = {};
    if (!values.cedula) errs.cedula = 'La cédula es obligatoria';
    else if (!/^\d+$/.test(values.cedula)) errs.cedula = 'Solo dígitos';
    else if (values.cedula.length < 8) errs.cedula = 'Mínimo 8 dígitos';
    else if (values.cedula.length > 15) errs.cedula = 'Máximo 15 dígitos';
    if (!values.password) errs.password = 'La contraseña es obligatoria';
    else if (values.password.length < 8) errs.password = 'Mínimo 8 caracteres';
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleBlur = (e) => {
    setTouched((t) => ({ ...t, [e.target.name]: true }));
    setErrors(validate(form));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errs = validate(form);
    setErrors(errs);
    setTouched({ cedula: true, password: true });

    if (Object.keys(errs).length > 0) {
      return;
    }

    setSubmitting(true);

    try {
      const credentials = {
        cedula: form.cedula.trim(),
        password: form.password,
      };

      console.log('[Login] Iniciando sesión...');
      const result = await api.login(credentials);
      console.log('[Login] Respuesta recibida:', result);

      const user = result?.data?.user;
      const token = result?.data?.token;

      if (!user) {
        throw new Error('No se recibió información del usuario');
      }

      if (!token) {
        throw new Error('No se recibió el token de autenticación');
      }

      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);
      console.log('[Login] Usuario y token guardados en localStorage');

      if (user.rol === 'administrador' || user.rol === 'coordinador' || user.rol === 'instructor') {
        navigate('/admin/dashboard');
      } else {
        navigate('/home');
      }
    } catch (error) {
      console.error('[Login] Error de inicio de sesión:', {
        message: error.message,
        status: error.status,
        api_message: error.json?.message,
      });

      const errorMessage = error.json?.message || error.message || 'Error al iniciar sesión';
      alert(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-green-50 p-4">
      {/* Contenedor principal */}
      <div className="bg-white rounded-2xl shadow-2xl flex w-full max-w-5xl overflow-hidden slide-up">
        {/* Izquierda: Formulario */}
        <div className="flex-1 p-12 flex flex-col justify-center">
          <div className="mb-8">
            <div className="w-16 h-16 rounded-xl gradient-primary flex items-center justify-center mb-6 shadow-lg">
              <svg className="w-9 h-9 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
              </svg>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-2">Bienvenido de nuevo</h2>
            <p className="text-lg text-gray-600">Sistema de Control de Asistencia - SENA Regional Caquetá</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Cédula */}
            <div className="form-group">
              <label className="form-label">
                <svg className="form-label__icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z" />
                </svg>
                Cédula
              </label>
              <div className="form-input-wrapper">
                <svg className="form-input-wrapper__icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z" />
                </svg>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={15}
                  minLength={8}
                  placeholder="Ej: 12345678"
                  name="cedula"
                  value={form.cedula}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`form-input ${touched.cedula && errors.cedula ? 'form-input--error' : ''}`}
                  required
                />
              </div>
              {touched.cedula && errors.cedula && (
                <p className="form-error">
                  <svg className="form-error__icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                  {errors.cedula}
                </p>
              )}
            </div>

            {/* Contraseña */}
            <div className="form-group">
              <label className="form-label">
                <svg className="form-label__icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
                Contraseña
              </label>
              <div className="form-input-wrapper">
                <svg className="form-input-wrapper__icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Mínimo 8 caracteres"
                  value={form.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`form-input ${touched.password && errors.password ? 'form-input--error' : ''}`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-green-600 transition"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
              {touched.password && errors.password && (
                <p className="form-error">{errors.password}</p>
              )}
            </div>

            {/* Recordarme y Olvidó contraseña */}
            <div className="flex items-center justify-between">
              <label className="form-checkbox">
                <input type="checkbox" className="form-checkbox__input" />
                <div className="form-checkbox__box">
                  <svg className="form-checkbox__checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="form-checkbox__label">Recordarme</span>
              </label>
              <a href="#" className="text-sm font-medium text-green-600 hover:text-green-700 transition">
                ¿Olvidó su contraseña?
              </a>
            </div>

            {/* Botón Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary btn-full btn-lg"
            >
              {submitting ? (
                <>
                  <div className="spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                  Iniciando sesión...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                  </svg>
                  Iniciar Sesión
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-500 mb-2">
              © 2025 SENA Regional Caquetá - Todos los derechos reservados
            </p>
            <div className="flex justify-center gap-4 text-xs text-gray-400">
              <a href="#" className="hover:text-green-600 transition">Términos y Condiciones</a>
              <span>|</span>
              <a href="#" className="hover:text-green-600 transition">Política de Privacidad</a>
            </div>
          </div>
        </div>

        {/* Derecha: Bienvenida */}
        <div className="hidden lg:flex flex-1 gradient-primary items-center justify-center p-12 relative overflow-hidden">
          {/* Patrón decorativo */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 right-10 w-64 h-64 bg-white rounded-full blur-3xl"></div>
            <div className="absolute bottom-10 left-10 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          </div>

          <div className="text-center relative z-10">
            <div className="w-32 h-32 mx-auto mb-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm float">
              <svg className="w-16 h-16 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
              </svg>
            </div>
            <h1 className="text-white font-bold text-4xl mb-4">
              Bienvenido al Sistema de Asistencia
            </h1>
            <p className="text-white text-lg opacity-90 max-w-md mx-auto">
              Gestiona y registra la asistencia de aprendices de forma digital, rápida y eficiente.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
