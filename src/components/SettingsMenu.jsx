import { useState } from 'react';
import { updateDisplayName, changePassword } from '../api';

const PANELS = {
  NONE: 'none',
  DISPLAY_NAME: 'displayName',
  PASSWORD: 'password',
};

export default function SettingsMenu({ user, onDisplayNameChange }) {
  const [activePanel, setActivePanel] = useState(PANELS.NONE);
  const [displayNameInput, setDisplayNameInput] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const token = user ? localStorage.getItem('tapecloud_token') : null;

  function resetFeedback() {
    setMessage('');
    setError('');
  }

  function openPanel(panel) {
    resetFeedback();
    setActivePanel(activePanel === panel ? PANELS.NONE : panel);
  }

  async function handleDisplayNameSubmit(event) {
    event.preventDefault();
    resetFeedback();
    setLoading(true);
    try {
      const response = await updateDisplayName(token, displayNameInput);
      onDisplayNameChange(response.displayName);
      setMessage('Nombre de usuario actualizado.');
      setDisplayNameInput('');
    } catch (err) {
      setError(err.message || 'No se pudo actualizar el nombre.');
    } finally {
      setLoading(false);
    }
  }

  async function handlePasswordSubmit(event) {
    event.preventDefault();
    resetFeedback();
    setLoading(true);
    try {
      await changePassword(token, currentPassword, newPassword);
      setMessage('Contraseña actualizada.');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      setError(err.message || 'No se pudo actualizar la contraseña.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="settings-menu">
      <button type="button" className="user-menu__trigger" aria-label="Configuración">
        <span className="user-menu__avatar">⚙️</span>
      </button>

      <div className="settings-menu__panel">
        <p className="settings-menu__title">Configuración</p>

        <button
          type="button"
          className="settings-menu__item"
          onClick={() => openPanel(PANELS.DISPLAY_NAME)}
          disabled={!user}
        >
          Cambiar nombre de usuario
        </button>

        {activePanel === PANELS.DISPLAY_NAME && (
          <form className="settings-menu__form" onSubmit={handleDisplayNameSubmit}>
            <input
              type="text"
              placeholder="Nuevo nombre"
              value={displayNameInput}
              onChange={(event) => setDisplayNameInput(event.target.value)}
              required
              minLength={2}
            />
            <button type="submit" className="login-button login-button--primary" disabled={loading}>
              Guardar
            </button>
          </form>
        )}

        <button
          type="button"
          className="settings-menu__item"
          onClick={() => openPanel(PANELS.PASSWORD)}
          disabled={!user}
        >
          Cambiar contraseña
        </button>

        {activePanel === PANELS.PASSWORD && (
          <form className="settings-menu__form" onSubmit={handlePasswordSubmit}>
            <input
              type="password"
              placeholder="Contraseña actual"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Nueva contraseña"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              required
              minLength={6}
            />
            <button type="submit" className="login-button login-button--primary" disabled={loading}>
              Guardar
            </button>
          </form>
        )}

        <button type="button" className="settings-menu__item" disabled>
          Cambiar tema (claro/oscuro/personalizado)
          <span className="settings-menu__badge">Próximamente</span>
        </button>

        <button type="button" className="settings-menu__item" disabled>
          Contacto y soporte
          <span className="settings-menu__badge">Próximamente</span>
        </button>

        {message && <p className="settings-menu__message">{message}</p>}
        {error && <p className="error">{error}</p>}
        {!user && <p className="settings-menu__hint">Iniciá sesión para editar tu cuenta.</p>}
      </div>
    </div>
  );
}
