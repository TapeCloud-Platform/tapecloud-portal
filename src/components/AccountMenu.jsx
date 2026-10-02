import { useEffect, useRef, useState } from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { getMyReviewStats, updateUsername, changePassword, updateAvatar } from '../api';
import { resizeImageToDataUri } from '../avatar';
import { isUsernameBlocked } from '../utils/profanity';
import { SkeletonStatsList } from './Skeleton';
import ConfirmDialog from './ConfirmDialog';
import TotpModal from './TotpModal';
import DeleteAccountModal from './DeleteAccountModal';
import userIconDark from '../assets/user-icon-dark.svg';
import userIconLight from '../assets/user-icon-light.svg';

const PANELS = {
  NONE: 'none',
  USERNAME: 'username',
  PASSWORD: 'password',
};

export default function AccountMenu({ user, onLoginClick, onLogoutClick, onDisplayNameChange, onAvatarChange, theme, onThemeChange }) {
  const defaultIcon = theme === 'light' ? userIconLight : userIconDark;
  const avatarSrc = user?.avatarDataUri || defaultIcon;
  const fileInputRef = useRef(null);
  const token = user ? localStorage.getItem('tapecloud_token') : null;

  const [reviewsOpen, setReviewsOpen] = useState(false);
  const [stats, setStats] = useState(null);
  const [statsError, setStatsError] = useState('');
  const [loadingStats, setLoadingStats] = useState(false);

  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState('');

  const [activePanel, setActivePanel] = useState(PANELS.NONE);
  const [usernameInput, setUsernameInput] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmLogoutOpen, setConfirmLogoutOpen] = useState(false);
  const [totpModalOpen, setTotpModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const displayName = user ? user.displayName || user.email.split('@')[0] : 'Invitado';
  const displayEmail = user ? user.email : 'Sesión de invitado';

  useEffect(() => {
    setStats(null);
    setStatsError('');
  }, [user?.email]);

  useEffect(() => {
    if (!reviewsOpen || !user || stats || statsError || loadingStats) {
      return;
    }
    setLoadingStats(true);
    getMyReviewStats(token)
      .then(setStats)
      .catch((err) => setStatsError(err.message || 'No se pudieron cargar las reseñas.'))
      .finally(() => setLoadingStats(false));
  }, [reviewsOpen, user, stats, statsError, loadingStats, token]);

  function resetFeedback() {
    setMessage('');
    setError('');
  }

  async function openPanel(panel) {
    resetFeedback();
    setActivePanel(activePanel === panel ? PANELS.NONE : panel);
  }

  async function handleAvatarPick(event) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) {
      return;
    }
    setAvatarError('');
    setAvatarUploading(true);
    try {
      const dataUri = await resizeImageToDataUri(file);
      const response = await updateAvatar(token, dataUri);
      onAvatarChange(response.avatarDataUri);
    } catch (err) {
      setAvatarError(err.message || 'No se pudo actualizar la foto de perfil.');
    } finally {
      setAvatarUploading(false);
    }
  }

  async function handleAvatarRemove() {
    setAvatarError('');
    setAvatarUploading(true);
    try {
      await updateAvatar(token, null);
      onAvatarChange(null);
    } catch (err) {
      setAvatarError(err.message || 'No se pudo quitar la foto de perfil.');
    } finally {
      setAvatarUploading(false);
    }
  }

  async function handleUsernameSubmit(event) {
    event.preventDefault();
    resetFeedback();
    if (isUsernameBlocked(usernameInput)) {
      setError('Ese nombre de usuario contiene lenguaje no permitido. Elegí otro.');
      return;
    }
    setLoading(true);
    try {
      const response = await updateUsername(token, usernameInput);
      onDisplayNameChange(response.displayName);
      setMessage('Nombre de usuario actualizado. Usalo la próxima vez que inicies sesión.');
      setUsernameInput('');
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

  function handleLogoutRequest() {
    setMenuOpen(false);
    setConfirmLogoutOpen(true);
  }

  function handleLogoutConfirm() {
    setConfirmLogoutOpen(false);
    onLogoutClick();
  }

  function handleDeleteDone() {
    // La cuenta ya no existe: se sale en todas las apps como un logout global.
    setDeleteModalOpen(false);
    setMenuOpen(false);
    onLogoutClick();
  }

  return (
    <>
    {/* Fuera del DropdownMenu: si el diálogo nativo de archivos abre dentro del
        contenido del dropdown, Radix lo desmonta al perder foco y el onChange
        nunca llega a dispararse. */}
    <input
      ref={fileInputRef}
      type="file"
      accept="image/*"
      className="account-menu__file-input"
      onChange={handleAvatarPick}
    />
    <DropdownMenu.Root open={menuOpen} onOpenChange={setMenuOpen}>
      <DropdownMenu.Trigger asChild>
        <button type="button" className="account-menu__trigger" aria-label="Cuenta de usuario">
          <img className="account-menu__trigger-avatar" src={avatarSrc} alt="" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content className="account-menu__panel" align="start" sideOffset={10}>
          {/* ---- 01 / Usuario ---- */}
          <p className="account-menu__section-title">Usuario</p>

          <div className="user-menu__profile">
            <img className="user-menu__avatar user-menu__avatar--large" src={avatarSrc} alt="" />
            <div>
              <p className="user-menu__name">{displayName}</p>
              <p className="user-menu__email">{displayEmail}</p>
            </div>
          </div>

          {user && (
            <div className="user-menu__reviews">
              <button
                type="button"
                className="user-menu__reviews-toggle"
                onClick={() => setReviewsOpen((open) => !open)}
                aria-expanded={reviewsOpen}
              >
                Reseñas
                <span className={`user-menu__chevron ${reviewsOpen ? 'is-open' : ''}`}>›</span>
              </button>

              {reviewsOpen && loadingStats && !stats && <SkeletonStatsList rows={3} />}
              {reviewsOpen && statsError && <p className="error">{statsError}</p>}
              {reviewsOpen && stats && (
                <ul className="user-menu__list">
                  <li>
                    <span>Reseña con más likes</span>
                    <strong>{stats.mostLikedReviewTitle || '-'}</strong>
                  </li>
                  <li>
                    <span>Reseñas publicadas en TapeBeat</span>
                    <strong>{stats.tapebeatReviews}</strong>
                  </li>
                  <li>
                    <span>Reseñas publicadas en TapeFlix</span>
                    <strong>{stats.tapeflixReviews}</strong>
                  </li>
                </ul>
              )}
            </div>
          )}

          {!user && (
            <div className="account-menu__guest-cta">
              <p className="settings-menu__hint">¡Para obtener la experiencia de TapeCloud, iniciá sesión!</p>
              <button type="button" className="login-button login-button--primary" onClick={onLoginClick}>
                Iniciar sesión
                <span className="account-menu__cta-arrow" aria-hidden="true">→</span>
              </button>
            </div>
          )}

          {/* ---- 02 / Personalización (solo con sesión) ---- */}
          {user && (
            <>
              <p className="account-menu__section-title account-menu__section-title--spaced">Personalización</p>

              <div className="account-menu__avatar-actions">
                <button
                  type="button"
                  className="settings-menu__item"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={avatarUploading}
                >
                  {avatarUploading ? 'Subiendo...' : 'Cambiar foto de perfil'}
                </button>
                {user.avatarDataUri && (
                  <button
                    type="button"
                    className="settings-menu__item"
                    onClick={handleAvatarRemove}
                    disabled={avatarUploading}
                  >
                    Quitar foto
                  </button>
                )}
                {avatarError && <p className="error">{avatarError}</p>}
              </div>

              <button
                type="button"
                className="settings-menu__item"
                onClick={() => openPanel(PANELS.USERNAME)}
              >
                Cambiar nombre de usuario
              </button>

              {activePanel === PANELS.USERNAME && (
                <form
                  className="settings-menu__form"
                  onSubmit={handleUsernameSubmit}
                  onKeyDown={(event) => event.stopPropagation()}
                >
                  <input
                    type="text"
                    placeholder="Nuevo nombre de usuario"
                    value={usernameInput}
                    onChange={(event) => setUsernameInput(event.target.value)}
                    required
                    minLength={3}
                    maxLength={30}
                  />
                  <p className="settings-menu__hint">
                    Es el mismo que usás para iniciar sesión: solo letras, números, puntos y guiones bajos.
                  </p>
                  <button type="submit" className="login-button login-button--primary" disabled={loading}>
                    Guardar
                  </button>
                </form>
              )}

              <button
                type="button"
                className="settings-menu__item"
                onClick={() => openPanel(PANELS.PASSWORD)}
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
                    placeholder="Nueva contraseña (mínimo 8 caracteres)"
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    required
                    minLength={8}
                  />
                  <button type="submit" className="login-button login-button--primary" disabled={loading}>
                    Guardar
                  </button>
                </form>
              )}

              <button
                type="button"
                className="settings-menu__item"
                onClick={() => setTotpModalOpen(true)}
              >
                Verificación en dos pasos
                <span aria-hidden="true">→</span>
              </button>
            </>
          )}

          {/* ---- 03 / Configuración ---- */}
          <p className="account-menu__section-title account-menu__section-title--spaced">Configuración</p>

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

          {user && (
            <button
              type="button"
              className="settings-menu__item settings-menu__item--danger"
              onClick={handleLogoutRequest}
            >
              Cerrar sesión
            </button>
          )}

          {user && (
            <button
              type="button"
              className="settings-menu__item settings-menu__item--danger"
              onClick={() => setDeleteModalOpen(true)}
            >
              Eliminar cuenta
            </button>
          )}

          {message && <p className="settings-menu__message">{message}</p>}
          {error && <p className="error">{error}</p>}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>

    {confirmLogoutOpen && (
      <ConfirmDialog
        title="Cerrar sesión"
        message="¿Estás seguro de que querés cerrar sesión?"
        confirmLabel="Cerrar sesión"
        danger
        onConfirm={handleLogoutConfirm}
        onCancel={() => setConfirmLogoutOpen(false)}
      />
    )}

    {totpModalOpen && <TotpModal onClose={() => setTotpModalOpen(false)} />}

    {deleteModalOpen && (
      <DeleteAccountModal onClose={() => setDeleteModalOpen(false)} onDeleted={handleDeleteDone} />
    )}
    </>
  );
}
