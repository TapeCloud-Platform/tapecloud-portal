import AccountMenu from './AccountMenu';
import AppSwitcher from './AppSwitcher';
import tapecloudLogoDark from '../assets/tapecloud-logo-dark.png';
import tapecloudLogoLight from '../assets/tapecloud-logo-light.png';

export default function Header({ user, onLoginClick, onLogoutClick, onDisplayNameChange, onAvatarChange, theme, onThemeChange }) {
  const tapecloudLogo = theme === 'light' ? tapecloudLogoLight : tapecloudLogoDark;

  return (
    <header className="portal-header">
      <div className="portal-header__left">
        <AccountMenu
          user={user}
          onLoginClick={onLoginClick}
          onLogoutClick={onLogoutClick}
          onDisplayNameChange={onDisplayNameChange}
          onAvatarChange={onAvatarChange}
          theme={theme}
          onThemeChange={onThemeChange}
        />
      </div>

      <div className="portal-header__brand">
        <img className="portal-header__logo" src={tapecloudLogo} alt="TapeCloud" />
        <span className="portal-header__brand-text">
          <span className="portal-header__wordmark">TapeCloud</span>
          <span className="portal-header__tagline">Ecosistema</span>
        </span>
      </div>

      <div className="portal-header__actions">
        <AppSwitcher current="tapecloud" theme={theme} logoSrc={tapecloudLogo} appName="TapeCloud" />
      </div>
    </header>
  );
}
