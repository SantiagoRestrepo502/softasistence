import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AprendicesManagement.css';
import AdminHeader from '../../components/admin/AdminHeader';
import AprendizEditModal from './components/AprendizEditModal';

import { getAuthHeader } from '../../utils/adminAuth';

const API_URL = 'http://localhost:3000';

function AprendicesManagement() {
  const navigate = useNavigate();
  const [aprendices, setAprendices] = useState([]);
  const [formaciones, setFormaciones] = useState([]); // Nuevo estado para formaciones
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState('');
  const [filterEstado, setFilterEstado] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingAprendiz, setEditingAprendiz] = useState(null);

  const [formData, setFormData] = useState({
    documento: '',
    tipo_documento: 'CC',
    nombres: '',
    apellidos: '',
    email: '', // Nuevo campo
    telefono: '',
    id_formacion: '', // Nuevo campo
  });

  useEffect(() => {
    fetchAprendices();
    fetchFormaciones(); // Cargar formaciones al inicio
  }, []);

  const fetchFormaciones = async () => {
    try {
      const response = await fetch(`${API_URL}/api/formaciones`, {
        headers: { 'Authorization': getAuthHeader() },
      });
      if (response.ok) {
        const data = await response.json();
        setFormaciones(data.data.formaciones || []);
      }
    } catch (err) {
      console.error('Error cargando formaciones:', err);
    }
  };

  const fetchAprendices = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filterTipo) params.append('tipo_documento', filterTipo);
      if (filterEstado) params.append('activo', filterEstado);
      if (searchTerm) params.append('search', searchTerm);

      const response = await fetch(`${API_URL}/api/aprendices?${params}`, {
        headers: { 'Authorization': getAuthHeader() },
      });

      if (!response.ok) throw new Error('Error al cargar aprendices');

      const data = await response.json();
      setAprendices(data.data.aprendices || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAprendiz = () => {
    setEditingAprendiz(null);
    setFormData({
      documento: '',
      tipo_documento: 'CC',
      nombres: '',
      apellidos: '',
      email: '',
      telefono: '',
      id_formacion: '',
    });
    setShowModal(true);
  };

  const handleEditAprendiz = (aprendiz) => {
    setEditingAprendiz(aprendiz);
    setFormData({
      documento: aprendiz.documento,
      tipo_documento: aprendiz.tipo_documento,
      nombres: aprendiz.nombres,
      apellidos: aprendiz.apellidos,
      email: aprendiz.email || '',
      telefono: aprendiz.telefono || '',
      id_formacion: aprendiz.formacion_id || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const url = editingAprendiz
        ? `${API_URL}/api/aprendices/${editingAprendiz.id_aprendices}`
        : `${API_URL}/api/aprendices`;

      const response = await fetch(url, {
        method: editingAprendiz ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': getAuthHeader(),
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al guardar aprendiz');
      }

      setShowModal(false);
      fetchAprendices();
      alert(editingAprendiz ? 'Aprendiz actualizado' : 'Aprendiz creado exitosamente');
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleToggleStatus = async (aprendiz) => {
    const action = aprendiz.activo ? 'desactivar' : 'activar';
    if (!confirm(`¿${action} a ${aprendiz.nombres}?`)) return;

    try {
      const response = await fetch(`${API_URL}/api/aprendices/${aprendiz.id_aprendices}/toggle`, {
        method: 'PUT',
        headers: { 'Authorization': getAuthHeader() },
      });

      if (!response.ok) throw new Error(`Error al ${action}`);

      fetchAprendices();
      alert(`Aprendiz ${action === 'desactivar' ? 'desactivado' : 'activado'}`);
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleDeleteAprendiz = async (aprendiz) => {
    if (!confirm(`¿Estás seguro de eliminar a ${aprendiz.nombres} ${aprendiz.apellidos}?\n\nEsta acción no se puede deshacer.`)) return;

    try {
      const response = await fetch(`${API_URL}/api/aprendices/${aprendiz.id_aprendices}`, {
        method: 'DELETE',
        headers: { 'Authorization': getAuthHeader() },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al eliminar aprendiz');
      }

      fetchAprendices();
      alert('Aprendiz eliminado exitosamente');
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const getTipoBadgeClass = (tipo) => `tipo-badge tipo-${tipo.toLowerCase()}`;

  return (
    <>
      <AdminHeader title="Gestión de Aprendices" subtitle="Administra estudiantes matriculados" />

      <main className="admin-main">
        <div className="page-header">
          <div className="search-filters">
            <form onSubmit={(e) => { e.preventDefault(); fetchAprendices(); }} className="search-form">
              <input
                type="text"
                placeholder="Buscar por documento, nombre o apellido..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              <button type="submit" className="search-button">Buscar</button>
            </form>

            <select value={filterTipo} onChange={(e) => setFilterTipo(e.target.value)} className="filter-select">
              <option value="">Todos los tipos</option>
              <option value="CC">Cédula (CC)</option>
              <option value="TI">Tarjeta Identidad (TI)</option>
              <option value="CE">Cédula Extranjería (CE)</option>
              <option value="PAS">Pasaporte (PAS)</option>
            </select>

            <select value={filterEstado} onChange={(e) => setFilterEstado(e.target.value)} className="filter-select">
              <option value="">Todos los estados</option>
              <option value="true">Activo</option>
              <option value="false">Inactivo</option>
            </select>

            <button onClick={fetchAprendices} className="btn-secondary">Aplicar</button>
          </div>

          <button onClick={handleCreateAprendiz} className="btn-primary">+ Agregar Aprendiz</button>
        </div>

        {loading && <div className="loading">Cargando aprendices...</div>}
        {error && <div className="error-message">{error}</div>}

        {!loading && !error && (
          <div className="table-container">
            <table className="aprendices-table">
              <thead>
                <tr>
                  <th>Aprendiz</th>
                  <th>Email</th>
                  <th>Documento</th>
                  <th>Formación</th>
                  <th>Teléfono</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {aprendices.map((aprendiz) => (
                  <tr key={aprendiz.id_aprendices}>
                    <td>
                      <div className="user-cell">
                        <div className="user-avatar">
                          {aprendiz.nombres.charAt(0)}{aprendiz.apellidos.charAt(0)}
                        </div>
                        <div className="user-info">
                          <div className="user-name">{aprendiz.nombres} {aprendiz.apellidos}</div>
                        </div>
                      </div>
                    </td>
                    <td>{aprendiz.email}</td>
                    <td>
                      <span className={getTipoBadgeClass(aprendiz.tipo_documento)}>{aprendiz.tipo_documento}</span>
                      <span style={{ marginLeft: '8px' }}>{aprendiz.documento}</span>
                    </td>
                    <td>
                      {aprendiz.formacion_codigo ? (
                        <span className="formacion-badge">
                          {aprendiz.formacion_codigo} - {aprendiz.formacion_nombre}
                        </span>
                      ) : (
                        <span className="text-muted">Sin formación</span>
                      )}
                    </td>
                    <td>{aprendiz.telefono || '-'}</td>
                    <td>
                      <span className={`status-badge ${aprendiz.activo ? 'status-active' : 'status-inactive'}`}>
                        {aprendiz.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button onClick={() => handleEditAprendiz(aprendiz)} className="action-btn action-edit" title="Editar">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" strokeWidth="2" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" strokeWidth="2" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleToggleStatus(aprendiz)}
                          className={`action-btn ${aprendiz.activo ? 'action-deactivate' : 'action-activate'}`}
                          title={aprendiz.activo ? 'Desactivar' : 'Activar'}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <circle cx="12" cy="12" r="10" strokeWidth="2" />
                            {aprendiz.activo ? <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" strokeWidth="2" /> : <path d="M12 16v-4m0-4h.01" strokeWidth="2" />}
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteAprendiz(aprendiz)}
                          className="action-btn action-delete"
                          title="Eliminar"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <polyline points="3 6 5 6 21 6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <line x1="10" y1="11" x2="10" y2="17" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <line x1="14" y1="11" x2="14" y2="17" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Modal de Edición */}
      <AprendizEditModal
        showModal={showModal}
        editingAprendiz={editingAprendiz}
        formData={formData}
        formaciones={formaciones}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmit}
        onFormChange={setFormData}
      />
    </>
  );
}

export default AprendicesManagement;
