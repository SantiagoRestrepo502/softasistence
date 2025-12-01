import React, { useState, useEffect } from 'react';
import './FormacionesManagement.css';
import AdminHeader from '../../components/admin/AdminHeader';

import { getAuthHeader } from '../../utils/adminAuth';

const API_URL = 'http://localhost:3000';

function FormacionesManagement() {
  const [formaciones, setFormaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterJornada, setFilterJornada] = useState('');
  const [filterEstado, setFilterEstado] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingFormacion, setEditingFormacion] = useState(null);

  const [formData, setFormData] = useState({
    codigo: '',
    nombre: '',
    jornada: 'diurna',
    fecha_inicio: '',
    fecha_fin: '',
  });

  useEffect(() => {
    fetchFormaciones();
  }, []);

  const fetchFormaciones = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filterJornada) params.append('jornada', filterJornada);
      if (filterEstado) params.append('activo', filterEstado);
      if (searchTerm) params.append('search', searchTerm);

      const response = await fetch(`${API_URL}/api/formaciones?${params}`, {
        headers: { 'Authorization': getAuthHeader() },
      });

      if (!response.ok) throw new Error('Error al cargar formaciones');

      const data = await response.json();
      setFormaciones(data.data.formaciones || []);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching formaciones:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchFormaciones();
  };

  const handleCreateFormacion = () => {
    setEditingFormacion(null);
    setFormData({
      codigo: '',
      nombre: '',
      jornada: 'diurna',
      fecha_inicio: '',
      fecha_fin: '',
    });
    setShowModal(true);
  };

  const handleEditFormacion = (formacion) => {
    setEditingFormacion(formacion);
    setFormData({
      codigo: formacion.codigo,
      nombre: formacion.nombre,
      jornada: formacion.jornada,
      fecha_inicio: formacion.fecha_inicio,
      fecha_fin: formacion.fecha_fin || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const url = editingFormacion
        ? `${API_URL}/api/formaciones/${editingFormacion.codigo}`
        : `${API_URL}/api/formaciones`;

      const method = editingFormacion ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': getAuthHeader(),
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al guardar formación');
      }

      setShowModal(false);
      fetchFormaciones();
      alert(editingFormacion ? 'Formación actualizada exitosamente' : 'Formación creada exitosamente');
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleToggleStatus = async (formacion) => {
    const action = formacion.activo ? 'desactivar' : 'activar';
    if (!confirm(`¿Está seguro de ${action} esta formación?`)) return;

    try {
      const response = await fetch(`${API_URL}/api/formaciones/${formacion.codigo}/toggle`, {
        method: 'PUT',
        headers: { 'Authorization': getAuthHeader() },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error al ${action} formación`);
      }

      fetchFormaciones();
      alert(`Formación ${action === 'desactivar' ? 'desactivada' : 'activada'} exitosamente`);
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleDelete = async (formacion) => {
    if (!confirm(`¿Está seguro de eliminar la formación "${formacion.nombre}"? Esta acción no se puede deshacer.`)) return;

    try {
      const response = await fetch(`${API_URL}/api/formaciones/${formacion.codigo}`, {
        method: 'DELETE',
        headers: { 'Authorization': getAuthHeader() },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al eliminar formación');
      }

      fetchFormaciones();
      alert('Formación eliminada exitosamente');
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const getJornadaBadgeClass = (jornada) => {
    switch (jornada) {
      case 'diurna': return 'jornada-badge jornada-diurna';
      case 'nocturna': return 'jornada-badge jornada-nocturna';
      case 'mixta': return 'jornada-badge jornada-mixta';
      case 'fin_de_semana': return 'jornada-badge jornada-finde';
      default: return 'jornada-badge';
    }
  };

  return (
    <>
      <AdminHeader title="Gestión de Formaciones" subtitle="Administra programas de formación del SENA" />

      <main className="admin-main">
        <div className="page-header">
          <div className="search-filters">
            <form onSubmit={handleSearch} className="search-form">
              <input
                type="text"
                placeholder="Buscar por código o nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              <button type="submit" className="search-button">Buscar</button>
            </form>

            <select
              value={filterJornada}
              onChange={(e) => setFilterJornada(e.target.value)}
              className="filter-select"
            >
              <option value="">Todas las jornadas</option>
              <option value="diurna">Diurna</option>
              <option value="nocturna">Nocturna</option>
              <option value="mixta">Mixta</option>
              <option value="fin_de_semana">Fin de semana</option>
            </select>

            <select
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value)}
              className="filter-select"
            >
              <option value="">Todos los estados</option>
              <option value="true">Activo</option>
              <option value="false">Inactivo</option>
            </select>

            <button onClick={fetchFormaciones} className="btn-secondary">
              Aplicar Filtros
            </button>
          </div>

          <button onClick={handleCreateFormacion} className="btn-primary">
            + Agregar Formación
          </button>
        </div>

        {loading && <div className="loading">Cargando formaciones...</div>}
        {error && <div className="error-message">{error}</div>}

        {!loading && !error && (
          <div className="table-container">
            <table className="formaciones-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Nombre</th>
                  <th>Jornada</th>
                  <th>Fecha Inicio</th>
                  <th>Fecha Fin</th>
                  <th>Estado</th>
                  <th>Aprendices</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {formaciones.map((formacion) => (
                  <tr key={formacion.codigo}>
                    <td><strong>{formacion.codigo}</strong></td>
                    <td>{formacion.nombre}</td>
                    <td>
                      <span className={getJornadaBadgeClass(formacion.jornada)}>
                        {formacion.jornada.replace('_', ' ')}
                      </span>
                    </td>
                    <td>{new Date(formacion.fecha_inicio).toLocaleDateString()}</td>
                    <td>{formacion.fecha_fin ? new Date(formacion.fecha_fin).toLocaleDateString() : '-'}</td>
                    <td>
                      <span className={`status-badge ${formacion.activo ? 'status-active' : 'status-inactive'}`}>
                        {formacion.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="text-center">{formacion.total_aprendices || 0}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          onClick={() => handleEditFormacion(formacion)}
                          className="action-btn action-edit"
                          title="Editar"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleToggleStatus(formacion)}
                          className={`action-btn ${formacion.activo ? 'action-deactivate' : 'action-activate'}`}
                          title={formacion.activo ? 'Desactivar' : 'Activar'}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <circle cx="12" cy="12" r="10" strokeWidth="2" />
                            {formacion.activo ? (
                              <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" strokeWidth="2" />
                            ) : (
                              <path d="M12 16v-4m0-4h.01" strokeWidth="2" />
                            )}
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(formacion)}
                          className="action-btn action-delete"
                          title="Eliminar"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <polyline points="3 6 5 6 21 6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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

      {/* Modal para crear/editar formación */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingFormacion ? 'Editar Formación' : 'Crear Nueva Formación'}</h2>
              <button onClick={() => setShowModal(false)} className="modal-close">×</button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Código *</label>
                  <input
                    type="text"
                    required
                    value={formData.codigo}
                    onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                    placeholder="ej: ADSI-2025-01"
                  />
                </div>
                <div className="form-group">
                  <label>Jornada *</label>
                  <select
                    value={formData.jornada}
                    onChange={(e) => setFormData({ ...formData, jornada: e.target.value })}
                  >
                    <option value="mañana">Mañana</option>
                    <option value="tarde">Tarde</option>
                    <option value="noche">Noche</option>
                    <option value="mixta">Mixta</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Nombre del programa *</label>
                <input
                  type="text"
                  required
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  placeholder="ej: Análisis y Desarrollo de Sistemas de Información"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Fecha de Inicio *</label>
                  <input
                    type="date"
                    required
                    value={formData.fecha_inicio}
                    onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Fecha de Fin</label>
                  <input
                    type="date"
                    value={formData.fecha_fin}
                    onChange={(e) => setFormData({ ...formData, fecha_fin: e.target.value })}
                  />
                  <small>Opcional - Dejar vacío si aún está en curso</small>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  {editingFormacion ? 'Actualizar' : 'Crear'} Formación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default FormacionesManagement;
