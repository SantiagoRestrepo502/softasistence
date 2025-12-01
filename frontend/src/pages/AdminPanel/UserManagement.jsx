import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './UserManagement.css';
import AdminHeader from '../../components/admin/AdminHeader';

import { getAuthHeader } from '../../utils/adminAuth';

const API_URL = 'http://localhost:3000';

/**
 * Página de Gestión de Usuarios
 * CRUD completo de usuarios del sistema
 */
function UserManagement() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRol, setFilterRol] = useState('');
  const [filterEstado, setFilterEstado] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [changingPasswordUser, setChangingPasswordUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    cedula: '',
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    rol: 'instructor',
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filterRol) params.append('rol', filterRol);
      if (filterEstado) params.append('activo', filterEstado);
      if (searchTerm) params.append('search', searchTerm);

      const response = await fetch(`${API_URL}/api/users?${params}`, {
        headers: {
          'Authorization': getAuthHeader(),
        },
      });

      if (!response.ok) {
        throw new Error('Error al cargar usuarios');
      }

      const data = await response.json();
      setUsers(data.data.users || []);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleCreateUser = () => {
    navigate('/register?tab=administrativo');
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setFormData({
      cedula: user.cedula,
      nombre: user.nombre,
      apellido: user.apellido,
      email: user.email || '',
      password: '',
      rol: user.rol,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const url = editingUser
        ? `${API_URL}/api/users/${editingUser.cedula}`
        : `${API_URL}/api/users`;

      const method = editingUser ? 'PUT' : 'POST';

      const body = editingUser
        ? { nombre: formData.nombre, apellido: formData.apellido, email: formData.email }
        : formData;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': getAuthHeader(),
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al guardar usuario');
      }

      setShowModal(false);
      fetchUsers();
      alert(editingUser ? 'Usuario actualizado exitosamente' : 'Usuario creado exitosamente');
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleToggleStatus = async (user) => {
    const action = user.activo ? 'desactivar' : 'activar';
    if (!confirm(`¿Está seguro de ${action} este usuario?`)) return;

    try {
      const response = await fetch(`${API_URL}/api/users/${user.cedula}/toggle`, {
        method: 'PUT',
        headers: {
          'Authorization': getAuthHeader(),
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error al ${action} usuario`);
      }

      fetchUsers();
      alert(`Usuario ${action === 'desactivar' ? 'desactivado' : 'activado'} exitosamente`);
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleChangeRole = async (user, newRole) => {
    if (!confirm(`¿Cambiar rol de ${user.nombre} a ${newRole}?`)) return;

    try {
      const response = await fetch(`${API_URL}/api/users/${user.cedula}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': getAuthHeader(),
        },
        body: JSON.stringify({ rol: newRole }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al cambiar rol');
      }

      fetchUsers();
      alert('Rol actualizado exitosamente');
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleChangePassword = (user) => {
    setChangingPasswordUser(user);
    setNewPassword('');
    setConfirmPassword('');
    setShowPasswordModal(true);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      alert('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (newPassword !== confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/users/${changingPasswordUser.cedula}/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': getAuthHeader(),
        },
        body: JSON.stringify({ password: newPassword }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al cambiar contraseña');
      }

      setShowPasswordModal(false);
      alert('Contraseña actualizada exitosamente. El usuario puede iniciar sesión con su nueva contraseña.');
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };



  const handleDeleteUser = async (user) => {
    if (!confirm(`¿Está seguro de eliminar al usuario ${user.nombre} ${user.apellido}?\n\nEsta acción es permanente y no se puede deshacer.`)) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/users/${user.cedula}`, {
        method: 'DELETE',
        headers: {
          'Authorization': getAuthHeader(),
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al eliminar usuario');
      }

      fetchUsers();
      alert(`Usuario ${user.nombre} ${user.apellido} eliminado exitosamente`);
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const getRoleBadgeClass = (rol) => {
    switch (rol) {
      case 'administrador': return 'role-badge role-admin';
      case 'coordinador': return 'role-badge role-coordinator';
      case 'instructor': return 'role-badge role-instructor';
      default: return 'role-badge';
    }
  };

  const getRoleDisplayName = (rol) => {
    switch (rol) {
      case 'administrador': return 'Administrador';
      case 'coordinador': return 'Coordinador';
      case 'instructor': return 'Instructor';
      default: return rol;
    }
  };

  return (
    <>
      <AdminHeader title="Gestión de Usuarios" subtitle="Administra usuarios, roles y permisos del sistema" />

      <main className="admin-main">
        <div className="page-header">
          <div className="search-filters">
            <form onSubmit={handleSearch} className="search-form">
              <input
                type="text"
                placeholder="Buscar por nombre o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              <button type="submit" className="search-button">Buscar</button>
            </form>

            <select
              value={filterRol}
              onChange={(e) => setFilterRol(e.target.value)}
              className="filter-select"
            >
              <option value="">Todos los roles</option>
              <option value="administrador">Administrador</option>
              <option value="coordinador">Coordinador</option>
              <option value="instructor">Instructor</option>
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

            <button onClick={fetchUsers} className="btn-secondary">
              Aplicar Filtros
            </button>
          </div>

          <button onClick={handleCreateUser} className="btn-primary">
            + Agregar Usuario
          </button>
        </div>

        {loading && <div className="loading">Cargando usuarios...</div>}
        {error && <div className="error-message">{error}</div>}

        {!loading && !error && (
          <div className="table-container">
            <table className="users-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Apellido</th>
                  <th>Email</th>
                  <th>Rol</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.cedula}>
                    <td>
                      <div className="user-name-cell">
                        <div className="user-avatar">
                          {user.nombre.charAt(0)}{user.apellido.charAt(0)}
                        </div>
                        <div>
                          <div className="user-name">{user.nombre}</div>
                          <small className="user-cedula">CC {user.cedula}</small>
                        </div>
                      </div>
                    </td>
                    <td>{user.apellido}</td>
                    <td>{user.email || '-'}</td>
                    <td>
                      <span className={getRoleBadgeClass(user.rol)}>
                        {getRoleDisplayName(user.rol)}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          onClick={() => handleEditUser(user)}
                          className="action-btn action-edit"
                          title="Actualizar"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user)}
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

      {/* Modal para crear/editar usuario */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingUser ? 'Editar Usuario' : 'Crear Nuevo Usuario'}</h2>
              <button onClick={() => setShowModal(false)} className="modal-close">×</button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Cédula *</label>
                  <input
                    type="number"
                    required
                    disabled={!!editingUser}
                    value={formData.cedula}
                    onChange={(e) => setFormData({ ...formData, cedula: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Rol *</label>
                  <select
                    value={formData.rol}
                    onChange={(e) => setFormData({ ...formData, rol: e.target.value })}
                    disabled={!!editingUser}
                  >
                    <option value="instructor">Instructor</option>
                    <option value="coordinador">Coordinador</option>
                    <option value="administrador">Administrador</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Nombres *</label>
                  <input
                    type="text"
                    required
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Apellidos *</label>
                  <input
                    type="text"
                    required
                    value={formData.apellido}
                    onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              {!editingUser && (
                <div className="form-group">
                  <label>Contraseña *</label>
                  <input
                    type="password"
                    required={!editingUser}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    minLength="6"
                  />
                  <small>Mínimo 6 caracteres</small>
                </div>
              )}

              <div className="modal-footer">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  {editingUser ? 'Actualizar' : 'Crear'} Usuario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para cambiar contraseña */}
      {showPasswordModal && (
        <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Cambiar Contraseña</h2>
              <button onClick={() => setShowPasswordModal(false)} className="modal-close">×</button>
            </div>
            <div className="password-info">
              <p>Cambiar contraseña para: <strong>{changingPasswordUser?.nombre} {changingPasswordUser?.apellido}</strong></p>
              <p className="text-muted">CC: {changingPasswordUser?.cedula}</p>
            </div>
            <form onSubmit={handlePasswordSubmit} className="modal-form">
              <div className="form-group">
                <label>Nueva Contraseña *</label>
                <input
                  type="password"
                  required
                  minLength="6"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                />
              </div>

              <div className="form-group">
                <label>Confirmar Contraseña *</label>
                <input
                  type="password"
                  required
                  minLength="6"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repita la contraseña"
                />
              </div>

              <div className="password-requirements">
                <p><strong>Requisitos:</strong></p>
                <ul>
                  <li className={newPassword.length >= 6 ? 'valid' : ''}>✓ Mínimo 6 caracteres</li>
                  <li className={newPassword === confirmPassword && newPassword.length > 0 ? 'valid' : ''}>✓ Las contraseñas coinciden</li>
                </ul>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setShowPasswordModal(false)} className="btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  Actualizar Contraseña
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default UserManagement;
