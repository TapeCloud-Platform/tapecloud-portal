import UserMenu from './UserMenu';
import SettingsMenu from './SettingsMenu';
import tapecloudIconDark from '../assets/tapecloud-icon-dark.png';
import tapecloudIconLight from '../assets/tapecloud-icon-light.png';

export default function Header({ user, onLoginClick, onLogoutClick, onDisplayNameChange, theme, onThemeChange }) {
  const tapecloudLogo = theme === 'light' ? tapecloudIconLight : tapecloudIconDark;

  return (
    <header className="portal-header">
      <div className="portal-header__left">
        <UserMenu user={user} theme={theme} />
        <SettingsMenu
          user={user}
          onDisplayNameChange={onDisplayNameChange}
          theme={theme}
          onThemeChange={onThemeChange}
        />
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
