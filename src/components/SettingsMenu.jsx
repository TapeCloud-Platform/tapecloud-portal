import { useState } from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { updateDisplayName, changePassword } from '../api';
import settingsIconDark from '../assets/settings-icon-dark.png';
import settingsIconLight from '../assets/settings-icon-light.png';

const PANELS = {
  NONE: 'none',
  DISPLAY_NAME: 'displayName',
  PASSWORD: 'password',
};

export default function SettingsMenu({ user, onDisplayNameChange, theme, onThemeChange }) {
  const [activePanel, setActivePanel] = useState(PANELS.NONE);
  const [displayNameInput, setDisplayNameInput] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const token = user ? localStorage.getItem('tapecloud_token') : null;
  const settingsIcon = theme === 'light' ? settingsIconLight : settingsIconDark;

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
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button type="button" className="user-menu__trigger" aria-label="Configuración">
          <img className="user-menu__avatar" src={settingsIcon} alt="" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content className="settings-menu__panel" align="start" sideOffset={10}>
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
            <form
              className="settings-menu__form"
              onSubmit={handleDisplayNameSubmit}
              onKeyDown={(event) => event.stopPropagation()}
            >
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
            <form
              className="settings-menu__form"
              onSubmit={handlePasswordSubmit}
              onKeyDown={(event) => event.stopPropagation()}
            >
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

          <div className="settings-menu__item settings-menu__item--theme">
            Tema
            <div className="theme-toggle" role="group" aria-label="Elegir tema">
              <button
                type="button"
                className={`theme-toggle__option ${theme === 'dark' ? 'is-active' : ''}`}
                onClick={() => onThemeChange('dark')}
                aria-pressed={theme === 'dark'}
              >
                Oscuro
              </button>
              <button
                type="button"
                className={`theme-toggle__option ${theme === 'light' ? 'is-active' : ''}`}
                onClick={() => onThemeChange('light')}
                aria-pressed={theme === 'light'}
              >
                Claro
              </button>
            </div>
          </div>

          <button type="button" className="settings-menu__item" disabled>
            Contacto y soporte
            <span className="settings-menu__badge">Próximamente</span>
          </button>

          {message && <p className="settings-menu__message">{message}</p>}
          {error && <p className="error">{error}</p>}
          {!user && <p className="settings-menu__hint">Iniciá sesión para editar tu cuenta.</p>}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
