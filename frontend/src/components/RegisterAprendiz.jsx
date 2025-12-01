import { useState } from "react";
import QRCode from "react-qr-code";
import "../styles/register-premium.css";

export default function SolicitudQR() {
  const [cedula, setCedula] = useState("");
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState("");
  const [qrValue, setQrValue] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const validate = (val) => {
    if (!val) return "El número de documento es obligatorio";
    if (!/^\d+$/.test(val)) return "Solo se permiten números";
    if (val.length < 5) return "Mínimo 5 dígitos";
    if (val.length > 12) return "Máximo 12 dígitos";
    return "";
  };

  const handleChange = (e) => {
    const filtered = e.target.value.replace(/\D/g, "");
    setCedula(filtered);
    setError(validate(filtered));
    setQrValue(null);
  };

  const handleBlur = () => setTouched(true);

  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched(true);
    const err = validate(cedula);
    setError(err);

    if (!err) {
      setIsLoading(true);
      setTimeout(() => {
        setQrValue(cedula);
        setIsLoading(false);
      }, 800);
    }
  };

  const handleNewCode = () => {
    setQrValue(null);
    setCedula("");
    setError("");
    setTouched(false);
  };

  const handleDownload = () => {
    const svg = document.querySelector("#qr-canvas svg");
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      canvas.width = 300;
      canvas.height = 300;

      img.onload = () => {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, 300, 300);
        const link = document.createElement("a");
        link.download = `QR-Asistencia-${cedula}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      };

      img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
    }
  };

  return (
    <div className="register-premium-container">
      <div className="register-card">
        <div className="register-card__form-panel">
          {/* Header */}
          <div className="register-form__header">
            <div className="register-card__icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75zM6.75 16.5h.75v.75h-.75v-.75zM16.5 6.75h.75v.75h-.75v-.75zM13.5 13.5h.75v.75h-.75v-.75zM13.5 19.5h.75v.75h-.75v-.75zM19.5 13.5h.75v.75h-.75v-.75zM19.5 19.5h.75v.75h-.75v-.75zM16.5 16.5h.75v.75h-.75v-.75z" />
              </svg>
            </div>
            <h2 className="register-form__heading">Sistema de Asistencia</h2>
            <p className="register-form__subheading">
              Ingresa tu número de documento para generar tu código QR de asistencia
            </p>
          </div>

          {!qrValue ? (
            <form onSubmit={handleSubmit} className="register-form">
              <div className="form-group">
                <label className="form-label">
                  <svg className="form-label__icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z" />
                  </svg>
                  Número de Documento
                  <span className="form-label__hint">(5-12 dígitos)</span>
                </label>
                <div className="form-input-wrapper">
                  <svg className="form-input-wrapper__icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z" />
                  </svg>
                  <input
                    type="text"
                    name="cedula"
                    inputMode="numeric"
                    maxLength={12}
                    minLength={5}
                    autoComplete="off"
                    className={`form-input ${touched && error ? "form-input--error" : ""}`}
                    placeholder="Ingresa tu documento"
                    value={cedula}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                  />
                </div>
                {touched && error && (
                  <p className="form-error">
                    <svg className="form-error__icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                    </svg>
                    {error}
                  </p>
                )}
              </div>

              <button type="submit" disabled={isLoading} className="btn btn--primary btn--full btn--lg">
                {isLoading ? (
                  <>
                    <svg className="btn__icon" style={{ animation: 'spin 1s linear infinite' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generando...
                  </>
                ) : (
                  <>
                    <svg className="btn__icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75zM6.75 16.5h.75v.75h-.75v-.75zM16.5 6.75h.75v.75h-.75v-.75zM13.5 13.5h.75v.75h-.75v-.75zM13.5 19.5h.75v.75h-.75v-.75zM19.5 13.5h.75v.75h-.75v-.75zM19.5 19.5h.75v.75h-.75v-.75zM16.5 16.5h.75v.75h-.75v-.75z" />
                    </svg>
                    Generar Código QR
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="fade-in" style={{ textAlign: 'center' }}>
              {/* QR Display */}
              <div style={{
                padding: 'var(--space-6)',
                background: 'white',
                border: '4px solid var(--color-primary)',
                borderRadius: 'var(--radius-xl)',
                boxShadow: 'var(--shadow-xl)',
                display: 'inline-block',
                marginBottom: 'var(--space-6)'
              }}>
                <div id="qr-canvas">
                  <QRCode
                    value={qrValue}
                    size={220}
                    level="H"
                    bgColor="#ffffff"
                    fgColor="#111827"
                  />
                </div>
              </div>

              {/* Success Message */}
              <div style={{
                background: '#f0fdf4',
                border: '2px solid #86efac',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-4)',
                marginBottom: 'var(--space-6)'
              }}>
                <p style={{
                  fontSize: 'var(--text-lg)',
                  fontWeight: 700,
                  color: '#166534',
                  marginBottom: 'var(--space-2)'
                }}>
                  ✓ Código QR Generado
                </p>
                <p style={{ fontSize: 'var(--text-sm)', color: '#16a34a' }}>
                  Documento: <strong>{qrValue}</strong>
                </p>
              </div>

              {/* Instructions */}
              <div style={{
                background: 'var(--bg-tertiary)',
                padding: 'var(--space-4)',
                borderRadius: 'var(--radius-lg)',
                marginBottom: 'var(--space-6)',
                textAlign: 'left'
              }}>
                <p style={{
                  fontSize: 'var(--text-sm)',
                  color: 'var(--color-gray-700)',
                  marginBottom: 'var(--space-2)'
                }}>
                  📱 Presenta este código al instructor
                </p>
                <p style={{
                  fontSize: 'var(--text-sm)',
                  color: 'var(--color-gray-700)'
                }}>
                  💾 Puedes descargarlo para tenerlo siempre
                </p>
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', gap: 'var(--space-3)', flexDirection: 'column' }}>
                <button onClick={handleDownload} className="btn btn--secondary btn--full">
                  <svg className="btn__icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                  Descargar QR
                </button>

                <button onClick={handleNewCode} className="btn btn--primary btn--full">
                  <svg className="btn__icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                  </svg>
                  Generar Otro Código
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}