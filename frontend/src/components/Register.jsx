import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import api from "../utils/api.js";
import Header from "./header.jsx";
import Nav from "./Nav.jsx";
import FaceCapture from "../biometrics/FaceCapture";


export default function RegistroUsuario() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("administrativo");
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get("tab");
    if (tabParam === "aprendiz") {
      setActiveTab("aprendiz");
    } else if (tabParam === "administrativo") {
      setActiveTab("administrativo");
    }
  }, [location]);

  const [form, setForm] = useState({
    cedula: "",
    nombre: "",
    apellido: "",
    email: "",
    password: "",
    rol: "instructor",
    agree: false,
  });
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});

  const [apForm, setApForm] = useState({
    documento: "",
    tipo_documento: "CC",
    nombres: "",
    apellidos: "",
    email: "",
    telefono: "",
    ficha: "",
    fk_codigo_formacion: "", // Nuevo campo (antes id_formacion)
    face_descriptor: null,
    activo: true,
  });
  const [apTouched, setApTouched] = useState({});
  const [apErrors, setApErrors] = useState({});
  const [formaciones, setFormaciones] = useState([]); // Estado para formaciones
  const [searchTerm, setSearchTerm] = useState(""); // Término de búsqueda
  const [showDropdown, setShowDropdown] = useState(false); // Visibilidad del dropdown




  // Cargar formaciones al montar el componente
  useEffect(() => {
    const loadFormaciones = async () => {
      try {
        const data = await api.getFormaciones();
        if (data && data.status === 'success' && data.data && Array.isArray(data.data.formaciones)) {
          setFormaciones(data.data.formaciones);
        }
      } catch (error) {
        console.error("Error al cargar formaciones:", error);
      }
    };
    loadFormaciones();

  }, []);



  // Validaciones
  const validate = (values) => {
    let errs = {};
    if (!values.cedula) errs.cedula = "La cédula es obligatoria";
    else if (!/^\d+$/.test(values.cedula)) errs.cedula = "Solo dígitos";
    else if (values.cedula.length < 8) errs.cedula = "Mínimo 8 dígitos";
    else if (values.cedula.length > 15) errs.cedula = "Máximo 15 dígitos";

    if (!values.nombre) errs.nombre = "El nombre es obligatorio";
    if (!values.apellido) errs.apellido = "El apellido es obligatorio";

    if (!values.email) errs.email = "El correo es obligatorio";
    else if (!/^\S+@\S+\.\S+$/.test(values.email)) errs.email = "Correo inválido";

    if (!values.password) errs.password = "La contraseña es obligatoria";
    else if (values.password.length < 8) errs.password = "Mínimo 8 caracteres";

    const allowedRoles = ["admin", "instructor", "coordinador"];
    if (!values.rol || !allowedRoles.includes(values.rol))
      errs.rol = "Selecciona un rol válido";

    if (!values.agree) errs.agree = "Debes aceptar los términos";

    return errs;
  };

  const apValidate = (values) => {
    const errs = {};
    if (!values.documento) errs.documento = "El documento es obligatorio";
    else if (!/^\d+$/.test(values.documento)) errs.documento = "Solo dígitos";
    else if (String(values.documento).length < 7)
      errs.documento = "Mínimo 7 dígitos";

    if (
      !values.tipo_documento ||
      !["CC", "TI", "CE", "PAS"].includes(values.tipo_documento)
    )
      errs.tipo_documento = "Selecciona un tipo válido";

    if (!values.nombres) errs.nombres = "El nombre es obligatorio";
    if (!values.apellidos) errs.apellidos = "El apellido es obligatorio";

    if (!values.email) errs.email = "El correo es obligatorio";
    else if (!/^\S+@\S+\.\S+$/.test(values.email)) errs.email = "Correo inválido";

    if (values.telefono && !/^\d{7,15}$/.test(values.telefono))
      errs.telefono = "Teléfono inválido";

    return errs;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let val = value;
    if (name === "cedula") {
      val = val.replace(/\D/g, "");
    }
    setForm({ ...form, [name]: type === "checkbox" ? checked : val });
    setErrors(
      validate({ ...form, [name]: type === "checkbox" ? checked : val })
    );
  };

  const apHandleChange = (e) => {
    const { name, value } = e.target;
    let val = value;
    if (name === "documento" || name === "telefono" || name === "ficha") {
      val = val.replace(/\D/g, "");
    }
    setApForm({ ...apForm, [name]: val });
    setApErrors(apValidate({ ...apForm, [name]: val }));
  };

  const apHandleBlur = (e) => {
    setApTouched({ ...apTouched, [e.target.name]: true });
    setApErrors(apValidate(apForm));
  };

  const handleBlur = (e) => {
    setTouched({ ...touched, [e.target.name]: true });
    setErrors(validate(form));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (activeTab === "administrativo") {
      const errs = validate(form);
      setErrors(errs);
      setTouched({
        cedula: true,
        nombre: true,
        apellido: true,
        email: true,
        password: true,
        rol: true,
        agree: true,
      });

      if (Object.keys(errs).length === 0) {
        const payload = {
          cedula: Number(form.cedula),
          nombre: form.nombre,
          apellido: form.apellido,
          email: form.email,
          password: form.password,
          rol: form.rol,
          activo: true,
        };
        try {
          const result = await api.registerUser(payload);
          alert("¡Usuario registrado!");
          console.log("Registro exitoso", result);
          setForm({
            cedula: "", nombre: "", apellido: "", email: "", password: "", rol: "instructor", agree: false
          });
          setTouched({});
        } catch (e) {
          console.error("Error al registrar", e);
          alert(`Error al registrar: ${e.message}`);
        }
      }
    } else {
      const errs = apValidate(apForm);
      setApErrors(errs);
      setApTouched({
        documento: true,
        tipo_documento: true,
        nombres: true,
        apellidos: true,
        email: true,
        telefono: true,
      });

      if (Object.keys(errs).length === 0) {
        const payload = {
          documento: Number(apForm.documento),
          tipo_documento: apForm.tipo_documento,
          nombres: apForm.nombres,
          apellidos: apForm.apellidos,
          email: apForm.email,
          telefono: apForm.telefono || null,
          ficha: apForm.ficha || null,
          fk_codigo_formacion: apForm.fk_codigo_formacion || null, // Enviar Código de formación
          face_descriptor: apForm.face_descriptor,
          activo: true,
        };



        try {
          const result = await api.registerAprendiz(payload);
          alert("¡Aprendiz registrado exitosamente!");
          console.log("Registro aprendiz exitoso", result);
          setApForm({
            documento: "", tipo_documento: "CC", nombres: "", apellidos: "",
            email: "", telefono: "", ficha: "", fk_codigo_formacion: "",
            activo: true
          });
          setApTouched({});
        } catch (e) {
          console.error("Error al registrar aprendiz", e);
          alert(`Error al registrar aprendiz: ${e.message}`);
        }
      }

    }
  };

  return (
    <div className="flex">
      {menuOpen && <Nav onClose={() => setMenuOpen(false)} />}
      <div className="flex-1">
        <Header user={null} onMenuToggle={() => setMenuOpen(!menuOpen)} />

        {/* Nuevo diseño mejorado */}
        <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-green-600 to-green-800">
          <div className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-5 min-h-[700px]">

            {/* Panel Izquierdo - Información */}
            <div className="lg:col-span-2 bg-gradient-to-br from-green-600 to-green-800 text-white p-12 flex flex-col justify-center relative overflow-hidden">
              <div className="relative z-10">
                <div className="text-center mb-10">
                  <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-lg border border-white/30">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <h1 className="text-4xl font-bold mb-4 leading-tight">
                    Sistema de Asistencia SENA
                  </h1>
                  <p className="text-lg opacity-90 mb-8 leading-relaxed">
                    Regístrate para acceder al sistema de reconocimiento facial y gestión de asistencia
                  </p>
                </div>

                <ul className="space-y-4 text-lg">
                  <li className="flex items-center">
                    <svg className="w-6 h-6 text-orange-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Registro rápido y seguro
                  </li>
                  <li className="flex items-center">
                    <svg className="w-6 h-6 text-orange-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Reconocimiento facial biométrico
                  </li>
                  <li className="flex items-center">
                    <svg className="w-6 h-6 text-orange-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Gestión de asistencia automatizada
                  </li>
                  <li className="flex items-center">
                    <svg className="w-6 h-6 text-orange-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Interfaz intuitiva y amigable
                  </li>
                  <li className="flex items-center">
                    <svg className="w-6 h-6 text-orange-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Soporte para instructores y aprendices
                  </li>
                </ul>
              </div>

              {/* Patrón de fondo */}
              <div className="absolute inset-0 opacity-10">
                <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <defs>
                    <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                      <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5" />
                    </pattern>
                  </defs>
                  <rect width="100" height="100" fill="url(#grid)" />
                </svg>
              </div>
            </div>

            {/* Panel Derecho - Formulario */}
            <div className="lg:col-span-3 p-12 flex flex-col">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Crear Cuenta</h2>
                <p className="text-gray-600">Completa tu información para comenzar</p>
              </div>

              {/* Tabs mejorados */}
              <div className="flex bg-gray-100 rounded-xl p-1 mb-8 border border-gray-200">
                <button
                  type="button"
                  className={`flex-1 py-3 px-6 rounded-lg font-medium text-sm transition-all duration-300 flex items-center justify-center gap-2 ${activeTab === "administrativo"
                    ? "bg-green-600 text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-800"
                    }`}
                  onClick={() => setActiveTab("administrativo")}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Administrativo
                </button>
                <button
                  type="button"
                  className={`flex-1 py-3 px-6 rounded-lg font-medium text-sm transition-all duration-300 flex items-center justify-center gap-2 ${activeTab === "aprendiz"
                    ? "bg-green-600 text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-800"
                    }`}
                  onClick={() => setActiveTab("aprendiz")}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                  </svg>
                  Aprendiz
                </button>
              </div>

              <form onSubmit={handleSubmit} className="flex-1">
                {/* Formulario Administrativo Rediseñado */}
                {activeTab === "administrativo" ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Cédula */}
                      <div>
                        <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                          <svg className="w-4 h-4 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                          </svg>
                          Cédula
                        </label>
                        <input
                          name="cedula"
                          type="text"
                          inputMode="numeric"
                          maxLength={15}
                          minLength={8}
                          placeholder="Ej: 12345678"
                          className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-green-500 transition-colors ${touched.cedula && errors.cedula ? "border-red-500" : "border-gray-200"
                            }`}
                          value={form.cedula}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          required
                        />
                        {touched.cedula && errors.cedula && (
                          <p className="mt-1 text-sm text-red-600 flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {errors.cedula}
                          </p>
                        )}
                      </div>

                      {/* Nombre */}
                      <div>
                        <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                          <svg className="w-4 h-4 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          Nombre
                        </label>
                        <input
                          name="nombre"
                          type="text"
                          placeholder="Tu nombre"
                          className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-green-500 transition-colors ${touched.nombre && errors.nombre ? "border-red-500" : "border-gray-200"
                            }`}
                          value={form.nombre}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          required
                        />
                        {touched.nombre && errors.nombre && (
                          <p className="mt-1 text-sm text-red-600 flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {errors.nombre}
                          </p>
                        )}
                      </div>

                      {/* Apellido */}
                      <div>
                        <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                          <svg className="w-4 h-4 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          Apellido
                        </label>
                        <input
                          name="apellido"
                          type="text"
                          placeholder="Tu apellido"
                          className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-green-500 transition-colors ${touched.apellido && errors.apellido ? "border-red-500" : "border-gray-200"
                            }`}
                          value={form.apellido}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          required
                        />
                        {touched.apellido && errors.apellido && (
                          <p className="mt-1 text-sm text-red-600 flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {errors.apellido}
                          </p>
                        )}
                      </div>

                      {/* Email */}
                      <div>
                        <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                          <svg className="w-4 h-4 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          Correo Electrónico
                        </label>
                        <input
                          name="email"
                          type="email"
                          placeholder="ejemplo@sena.edu.co"
                          className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-green-500 transition-colors ${touched.email && errors.email ? "border-red-500" : "border-gray-200"
                            }`}
                          value={form.email}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          required
                        />
                        {touched.email && errors.email && (
                          <p className="mt-1 text-sm text-red-600 flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {errors.email}
                          </p>
                        )}
                      </div>

                      {/* Contraseña */}
                      <div>
                        <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                          <svg className="w-4 h-4 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                          Contraseña
                        </label>
                        <input
                          name="password"
                          type="password"
                          placeholder="Mínimo 8 caracteres"
                          className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-green-500 transition-colors ${touched.password && errors.password ? "border-red-500" : "border-gray-200"
                            }`}
                          value={form.password}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          required
                        />
                        {touched.password && errors.password && (
                          <p className="mt-1 text-sm text-red-600 flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {errors.password}
                          </p>
                        )}
                      </div>

                      {/* Rol */}
                      <div>
                        <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                          <svg className="w-4 h-4 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          Rol
                        </label>
                        <select
                          name="rol"
                          value={form.rol}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 transition-colors"
                          required
                        >
                          <option value="instructor">Instructor</option>
                          <option value="coordinador">Coordinador</option>
                          <option value="admin">Administrador</option>
                        </select>
                        {touched.rol && errors.rol && (
                          <p className="mt-1 text-sm text-red-600 flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {errors.rol}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Términos */}
                    <div className="mt-6">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          name="agree"
                          type="checkbox"
                          checked={form.agree}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          required
                          className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                        />
                        <span className="text-sm text-gray-600">
                          Acepto los <a href="#" className="text-green-600 font-medium hover:underline">Términos y Condiciones</a>
                        </span>
                      </label>
                      {touched.agree && errors.agree && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {errors.agree}
                        </p>
                      )}
                    </div>

                    {/* Botón Submit */}
                    <button
                      type="submit"
                      className="w-full mt-8 bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Registrarse como Administrativo
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Tipo de Documento */}
                      <div>
                        <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                          <svg className="w-4 h-4 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                          </svg>
                          Tipo de Documento
                        </label>
                        <select
                          name="tipo_documento"
                          value={apForm.tipo_documento}
                          onChange={apHandleChange}
                          onBlur={apHandleBlur}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 transition-colors"
                        >
                          <option value="CC">Cédula de Ciudadanía</option>
                          <option value="TI">Tarjeta de Identidad</option>
                          <option value="CE">Cédula de Extranjería</option>
                          <option value="PASAPORTE">Pasaporte</option>
                        </select>
                      </div>

                      {/* Documento */}
                      <div>
                        <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                          <svg className="w-4 h-4 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                          </svg>
                          Número de Documento
                        </label>
                        <input
                          type="text"
                          name="documento"
                          value={apForm.documento}
                          onChange={apHandleChange}
                          onBlur={apHandleBlur}
                          className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-green-500 transition-colors ${apTouched.documento && apErrors.documento ? "border-red-500" : "border-gray-200"
                            }`}
                          placeholder="Ej: 1000123456"
                        />
                        {apTouched.documento && apErrors.documento && (
                          <p className="mt-1 text-sm text-red-600 flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {apErrors.documento}
                          </p>
                        )}
                      </div>

                      {/* Nombres */}
                      <div>
                        <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                          <svg className="w-4 h-4 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          Nombres
                        </label>
                        <input
                          type="text"
                          name="nombres"
                          value={apForm.nombres}
                          onChange={apHandleChange}
                          onBlur={apHandleBlur}
                          className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-green-500 transition-colors ${apTouched.nombres && apErrors.nombres ? "border-red-500" : "border-gray-200"
                            }`}
                          placeholder="Tus nombres"
                        />
                        {apTouched.nombres && apErrors.nombres && (
                          <p className="mt-1 text-sm text-red-600 flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {apErrors.nombres}
                          </p>
                        )}
                      </div>

                      {/* Apellidos */}
                      <div>
                        <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                          <svg className="w-4 h-4 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          Apellidos
                        </label>
                        <input
                          type="text"
                          name="apellidos"
                          value={apForm.apellidos}
                          onChange={apHandleChange}
                          onBlur={apHandleBlur}
                          className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-green-500 transition-colors ${apTouched.apellidos && apErrors.apellidos ? "border-red-500" : "border-gray-200"
                            }`}
                          placeholder="Tus apellidos"
                        />
                        {apTouched.apellidos && apErrors.apellidos && (
                          <p className="mt-1 text-sm text-red-600 flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {apErrors.apellidos}
                          </p>
                        )}
                      </div>

                      {/* Email */}
                      <div>
                        <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                          <svg className="w-4 h-4 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          Correo Electrónico
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={apForm.email}
                          onChange={apHandleChange}
                          onBlur={apHandleBlur}
                          className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-green-500 transition-colors ${apTouched.email && apErrors.email ? "border-red-500" : "border-gray-200"
                            }`}
                          placeholder="ejemplo@soy.sena.edu.co"
                        />
                        {apTouched.email && apErrors.email && (
                          <p className="mt-1 text-sm text-red-600 flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {apErrors.email}
                          </p>
                        )}
                      </div>

                      {/* Teléfono */}
                      <div>
                        <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                          <svg className="w-4 h-4 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          Teléfono
                        </label>
                        <input
                          type="text"
                          name="telefono"
                          value={apForm.telefono}
                          onChange={apHandleChange}
                          className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-green-500 transition-colors ${apTouched.telefono && apErrors.telefono ? "border-red-500" : "border-gray-200"
                            }`}
                          placeholder="300 123 4567"
                        />
                        {apTouched.telefono && apErrors.telefono && (
                          <p className="mt-1 text-sm text-red-600 flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {apErrors.telefono}
                          </p>
                        )}
                      </div>

                      {/* Ficha (Combobox Buscable) */}
                      <div className="relative">
                        <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                          <svg className="w-4 h-4 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                          </svg>
                          Ficha de Formación
                        </label>
                        <input
                          type="text"
                          value={searchTerm}
                          onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setShowDropdown(true);
                            // Si el usuario borra, limpiamos la selección
                            if (e.target.value === "") {
                              setApForm(prev => ({ ...prev, fk_codigo_formacion: "", ficha: "" }));
                            }
                          }}
                          onFocus={() => setShowDropdown(true)}
                          // Usamos onBlur con timeout para permitir click en opciones
                          onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                          placeholder="Buscar por código o nombre..."
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 transition-colors"
                        />

                        {/* Dropdown de resultados */}
                        {showDropdown && (
                          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                            {formaciones.filter(f =>
                              f.codigo.includes(searchTerm) ||
                              f.nombre.toLowerCase().includes(searchTerm.toLowerCase())
                            ).length > 0 ? (
                              formaciones
                                .filter(f =>
                                  f.codigo.includes(searchTerm) ||
                                  f.nombre.toLowerCase().includes(searchTerm.toLowerCase())
                                )
                                .map((f) => (
                                  <div
                                    key={f.codigo}
                                    className="px-4 py-3 hover:bg-green-50 cursor-pointer transition-colors border-b border-gray-100 last:border-0"
                                    onMouseDown={() => {
                                      setApForm(prev => ({
                                        ...prev,
                                        fk_codigo_formacion: f.codigo,
                                        ficha: f.codigo
                                      }));
                                      setSearchTerm(`${f.codigo} - ${f.nombre}`);
                                      setShowDropdown(false);
                                    }}
                                  >
                                    <div className="font-medium text-gray-800">{f.codigo}</div>
                                    <div className="text-sm text-gray-500">{f.nombre} ({f.jornada})</div>
                                  </div>
                                ))
                            ) : (
                              <div className="px-4 py-3 text-gray-500 text-sm">
                                No se encontraron resultados
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>




                    {/* Sección Biométrica Mejorada */}
                    <div className="mt-8 p-6 bg-gray-50 rounded-2xl border border-gray-200">
                      <h4 className="flex items-center text-lg font-semibold text-gray-800 mb-2">
                        <svg className="w-6 h-6 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Registro Biométrico
                      </h4>

                      <div className="flex justify-center">
                        {apForm.face_descriptor ? (
                          <div className="text-center p-6 bg-green-100 rounded-xl border border-green-200">
                            <div className="text-5xl mb-4">✅</div>
                            <h3 className="text-xl font-bold text-green-800 mb-2">Biometría Capturada</h3>
                            <p className="text-green-700 mb-4">El rostro ha sido registrado exitosamente.</p>
                            <button
                              type="button"
                              onClick={() => setApForm(prev => ({ ...prev, face_descriptor: null }))}
                              className="px-4 py-2 bg-white text-green-700 font-medium rounded-lg border border-green-300 hover:bg-green-50"
                            >
                              Volver a capturar
                            </button>
                          </div>
                        ) : (
                          <FaceCapture
                            onCapture={(embedding) => {
                              console.log("Embedding capturado:", embedding);
                              setApForm(prev => ({ ...prev, face_descriptor: embedding }));
                            }}
                            onCancel={() => console.log("Captura cancelada")}
                          />
                        )}
                      </div>
                    </div>

                    {/* Botón Submit */}
                    <button
                      type="submit"
                      className="w-full mt-8 bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                      </svg>
                      Registrarse como Aprendiz
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
