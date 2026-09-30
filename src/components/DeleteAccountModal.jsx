import { useEffect, useState } from 'react';
import { Button, TextField, Input, Label } from '@heroui/react';
import { deleteAccount, getMe, requestDeleteCode } from '../api';
import LoadingIcon from './LoadingIcon';
import VerificationCodeInput from './VerificationCodeInput';

/**
 * Popup para eliminar la cuenta: contraseña → código (2FA o email) →
 * doble confirmación. Al terminar avisa con onDeleted para cerrar sesión.
 */
export default function DeleteAccountModal({ onClose, onDeleted }) {
  const token = localStorage.getItem('tapecloud_token');

  // password → code → confirm1 → confirm2
  const [step, setStep] = useState('password');
  const [hasTotp, setHasTotp] = useState(null);
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getMe(token)
      .then((me) => setHasTotp(me.totpEnabled === true))
      .catch((err) => setError(err.message || 'No se pudo consultar tu cuenta.'));
  }, [token]);

  async function handlePassword(event) {
    event.preventDefault();
    setError('');
    setInfo('');
    if (!password) {
      setError('Ingresá tu contraseña para continuar.');
      return;
    }
    // Con 2FA el código sale de la app de autenticación; sin 2FA se manda por email.
    if (hasTotp) {
      setCode('');
      setStep('code');
      return;
    }
    setLoading(true);
    try {
      await requestDeleteCode(token);
      setCode('');
      setInfo('Te enviamos un código de 6 dígitos a tu email. Vence en 5 minutos.');
      setStep('code');
    } catch (err) {
      setError(err.message || 'No se pudo enviar el código.');
    } finally {
      setLoading(false);
    }
  }

  function handleCode(event) {
    event.preventDefault();
    setError('');
    setInfo('');
    if (code.length !== 6) {
      setError('Ingresá el código de 6 dígitos.');
      return;
    }
    setStep('confirm1');
  }

  async function handleResend() {
    setError('');
    setInfo('');
    setLoading(true);
    try {
      await requestDeleteCode(token);
      setInfo('Te enviamos un nuevo código. Vence en 5 minutos.');
    } catch (err) {
      setError(err.message || 'No se pudo reenviar el código.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    setError('');
    setLoading(true);
    try {
      await deleteAccount(token, {
        password,
        totpCode: hasTotp ? code : undefined,
        emailCode: hasTotp ? undefined : code,
      });
      onDeleted();
    } catch (err) {
      setError(err.message || 'No se pudo eliminar la cuenta.');
      // Si el código falló, se vuelve a pedirlo en vez de dejar trabado el flujo.
      setStep('code');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-modal-overlay">
      <div className="auth-modal-panel" role="dialog" aria-modal="true" aria-label="Eliminar cuenta">
        <button type="button" className="auth-modal-close" onClick={onClose} aria-label="Cerrar">
          ×
        </button>

        <h1>Eliminar cuenta</h1>

        {step === 'password' && (
          <form className="login-form" onSubmit={handlePassword}>
            <div className="delete-warning">
              Se borran tu cuenta, tus reseñas, comentarios y likes de <strong>todas las apps</strong>.
              No se puede deshacer.
            </div>
            <TextField className="auth-field" value={password} onChange={setPassword} isRequired>
              <Label>Confirmá tu contraseña</Label>
              <Input type="password" placeholder="••••••••" autoFocus />
            </TextField>
            {error && <p className="error">{error}</p>}
            <Button type="submit" variant="primary" className="auth-submit" isDisabled={loading || hasTotp === null}>
              {loading ? (
                <>
                  <LoadingIcon size={16} /> Enviando...
                </>
              ) : (
                'Continuar'
              )}
            </Button>
          </form>
        )}

        {step === 'code' && (
          <form className="login-form" onSubmit={handleCode}>
            <p className="auth-hint">
              {hasTotp
                ? 'Ingresá el código de 6 dígitos de tu app de autenticación.'
                : 'Ingresá el código de 6 dígitos que enviamos a tu email.'}
            </p>
            <VerificationCodeInput value={code} onChange={setCode} disabled={loading} />
            {error && <p className="error">{error}</p>}
            {info && <p className="auth-hint">{info}</p>}
            <Button type="submit" variant="primary" className="auth-submit" isDisabled={loading}>
              Continuar
            </Button>
            {!hasTotp && (
              <Button type="button" variant="ghost" onClick={handleResend} isDisabled={loading}>
                Reenviar código
              </Button>
            )}
          </form>
        )}

        {step === 'confirm1' && (
          <>
            <div className="delete-warning">
              Estás por eliminar tu cuenta de <strong>forma definitiva</strong>, con todo lo que
              publicaste en TapeCloud, TapeFlix y TapeBeat.
            </div>
            {error && <p className="error">{error}</p>}
            <div className="login-form">
              <Button type="button" variant="primary" className="auth-submit" onClick={() => setStep('confirm2')}>
                Eliminar definitivamente
              </Button>
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancelar
              </Button>
            </div>
          </>
        )}

        {step === 'confirm2' && (
          <>
            <div className="delete-warning delete-warning--final">
              Última confirmación: una vez eliminada no hay forma de recuperarla.
              ¿Seguro que querés seguir?
            </div>
            {error && <p className="error">{error}</p>}
            <div className="login-form">
              <Button
                type="button"
                variant="primary"
                className="auth-submit settings-menu__item--danger-inline"
                onClick={handleDelete}
                isDisabled={loading}
              >
                {loading ? (
                  <>
                    <LoadingIcon size={16} /> Eliminando...
                  </>
                ) : (
                  'Sí, eliminar mi cuenta'
                )}
              </Button>
              <Button type="button" variant="ghost" onClick={onClose} isDisabled={loading}>
                Cancelar
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
