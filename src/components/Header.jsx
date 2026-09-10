import UserMenu from './UserMenu';
import SettingsMenu from './SettingsMenu';
import tapecloudLogo from '../assets/tapecloud-logo.jpeg';

export default function Header({ user, onLoginClick, onLogoutClick, onDisplayNameChange }) {
  return (
    <header className="portal-header">
      <div className="portal-header__left">
        <UserMenu user={user} />
        <SettingsMenu user={user} onDisplayNameChange={onDisplayNameChange} />
        {user ? (
          <button type="button" className="login-button" onClick={onLogoutClick}>
            Cerrar sesión
          </button>
        ) : (
          <button type="button" className="login-button" onClick={onLoginClick}>
            Iniciar sesión
          </button>
        )}
      </div>

      <div className="portal-header__title">
        <img className="portal-header__logo" src={tapecloudLogo} alt="TapeCloud" />
        <span className="portal-header__text">Portal de TapeCloud</span>
      </div>
    </header>
  );
}
