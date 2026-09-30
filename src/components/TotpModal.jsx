import { useEffect, useState } from 'react';
import { Button, TextField, Input, Label } from '@heroui/react';
import { disableTotp, enableTotp, getMe, setupTotp } from '../api';
import LoadingIcon from './LoadingIcon';
import VerificationCodeInput from './VerificationCodeInput';
import Confetti from './Confetti';

/** Popup de verificación en dos pasos: activar, confirmar con celdas OTP o desactivar. */
export default function TotpModal({ onClose }) {
  const token = localStorage.getItem('tapecloud_token');

  const [status, setStatus] = useState('loading'); // loading | disabled | setup | success | enabled
  const [setup, setSetup] = useState(null);
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getMe(token)
      .then((me) => setStatus(me.totpEnabled ? 'enabled' : 'disabled'))
      .catch((err) => setError(err.message || 'No se pudo consultar el estado de la verificación en dos pasos.'));
  }, [token]);

  async function handleSetup() {
    setError('');
    setLoading(true);
    try {
      const response = await setupTotp(token);
      setSetup(response);
      setCode('');
      setStatus('setup');
    } catch (err) {
      setError(err.message || 'No se pudo generar el código QR.');
    } finally {
      setLoading(false);
    }
  }

  async function handleEnable(event) {
    event.preventDefault();
    setError('');
    if (code.length !== 6) {
      setError('Ingresá el código de 6 dígitos de tu app de autenticación.');
      return;
    }
    setLoading(true);
    try {
      await enableTotp(token, code);
      setStatus('success');
    } catch (err) {
      setError(err.message || 'No se pudo activar la verificación en dos pasos.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDisable(event) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await disableTotp(token, password);
      setPassword('');
      setStatus('disabled');
    } catch (err) {
      setError(err.message || 'No se pudo desactivar la verificación en dos pasos.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-modal-overlay">
      <div className="auth-modal-panel" role="dialog" aria-modal="true" aria-label="Verificación en dos pasos">
        <button type="button" className="auth-modal-close" onClick={onClose} aria-label="Cerrar">
          ×
        </button>

        {status === 'success' ? (
          <>
            <Confetti colors={['#22c55e', '#4ade80', '#bbf7d0', '#ffffff', '#3b82f6']} />
            <div className="success-shield" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2l8 3v6c0 5-3.5 8.5-8 11-4.5-2.5-8-6-8-11V5l8-3z" />
                <path d="M8.5 12l2.5 2.5 4.5-5" />
              </svg>
            </div>
            <h1>¡Listo!</h1>
            <p className="auth-hint">
              Tu cuenta ahora tiene el sistema 2FA: cada inicio de sesión te va a pedir el código
              de tu app de autenticación además de la contraseña.
            </p>
            <Button type="button" variant="primary" className="auth-submit" onClick={onClose}>
              Entendido
            </Button>
          </>
        ) : (
          <>
            <h1>Verificación en dos pasos</h1>

            {status === 'loading' && <p className="auth-hint">Cargando...</p>}

            {status === 'disabled' && !setup && (
              <>
                <p className="auth-hint">
                  Agregá un segundo paso con Google Authenticator (o cualquier app compatible con TOTP).
                </p>
                {error && <p className="error">{error}</p>}
                <Button type="button" variant="primary" className="auth-submit" onClick={handleSetup} isDisabled={loading}>
                  {loading ? (
                    <>
                      <LoadingIcon size={16} /> Generando...
                    </>
                  ) : (
                    'Generar código QR'
                  )}
                </Button>
              </>
            )}

            {status === 'setup' && setup && (
              <form className="login-form" onSubmit={handleEnable}>
                <p className="auth-hint">Escaneá el código con tu app de autenticación.</p>
                <img
                  src={setup.qrCodeDataUri}
                  alt="Código QR para configurar la verificación en dos pasos"
                  className="totp-qr"
                />
                <p className="auth-hint">
                  ¿No podés escanear? Ingresá esta clave manualmente: <code>{setup.secret}</code>
                </p>
                <VerificationCodeInput value={code} onChange={setCode} disabled={loading} />
                {error && <p className="error">{error}</p>}
                <Button type="submit" variant="primary" className="auth-submit" isDisabled={loading}>
                  {loading ? (
                    <>
                      <LoadingIcon size={16} /> Confirmando...
                    </>
                  ) : (
                    'Confirmar y activar'
                  )}
                </Button>
              </form>
            )}

            {status === 'enabled' && (
              <form className="login-form" onSubmit={handleDisable}>
                <p className="auth-hint">Ya está activada. Ingresá tu contraseña para desactivarla.</p>
                <TextField className="auth-field" value={password} onChange={setPassword} isRequired>
                  <Label>Contraseña</Label>
                  <Input type="password" placeholder="••••••••" autoFocus />
                </TextField>
                {error && <p className="error">{error}</p>}
                <Button type="submit" variant="primary" className="auth-submit" isDisabled={loading}>
                  {loading ? (
                    <>
                      <LoadingIcon size={16} /> Desactivando...
                    </>
                  ) : (
                    'Desactivar'
                  )}
                </Button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}
