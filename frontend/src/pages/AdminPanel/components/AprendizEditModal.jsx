import React from 'react';

function AprendizEditModal({
    showModal,
    editingAprendiz,
    formData = {},
    formaciones = [],
    onClose,
    onSubmit,
    onFormChange
}) {
    if (!showModal) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{editingAprendiz ? 'Editar Aprendiz' : 'Crear Nuevo Aprendiz'}</h2>
                    <button onClick={onClose} className="modal-close">×</button>
                </div>
                <form onSubmit={onSubmit} className="modal-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label>Tipo Documento *</label>
                            <select
                                value={formData.tipo_documento || 'CC'}
                                onChange={(e) => onFormChange({ ...formData, tipo_documento: e.target.value })}
                            >
                                <option value="CC">Cédula (CC)</option>
                                <option value="TI">Tarjeta Identidad (TI)</option>
                                <option value="CE">Cédula Extranjería (CE)</option>
                                <option value="PAS">Pasaporte (PAS)</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Documento *</label>
                            <input
                                type="text"
                                required
                                value={formData.documento || ''}
                                onChange={(e) => onFormChange({ ...formData, documento: e.target.value })}
                                disabled={!!editingAprendiz}
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Nombres *</label>
                            <input
                                type="text"
                                required
                                value={formData.nombres || ''}
                                onChange={(e) => onFormChange({ ...formData, nombres: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Apellidos *</label>
                            <input
                                type="text"
                                required
                                value={formData.apellidos || ''}
                                onChange={(e) => onFormChange({ ...formData, apellidos: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Email *</label>
                        <input
                            type="email"
                            required
                            value={formData.email || ''}
                            onChange={(e) => onFormChange({ ...formData, email: e.target.value })}
                        />
                    </div>

                    <div className="form-group">
                        <label>Formación</label>
                        <label>Formación</label>
                        <select
                            value={formData.fk_codigo_formacion || ''}
                            onChange={(e) => onFormChange({ ...formData, fk_codigo_formacion: e.target.value })}
                        >
                            <option value="">Seleccione una formación...</option>
                            {Array.isArray(formaciones) && formaciones.map(f => (
                                <option key={f.codigo} value={f.codigo}>
                                    {f.codigo} - {f.nombre}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Teléfono</label>
                        <input
                            type="tel"
                            value={formData.telefono || ''}
                            onChange={(e) => onFormChange({ ...formData, telefono: e.target.value })}
                        />
                    </div>

                    <div className="modal-footer">
                        <button type="button" onClick={onClose} className="btn-secondary">Cancelar</button>
                        <button type="submit" className="btn-primary">
                            {editingAprendiz ? 'Actualizar' : 'Crear'} Aprendiz
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AprendizEditModal;
