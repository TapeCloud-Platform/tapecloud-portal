import AccountMenu from './AccountMenu';
import AppSwitcher from './AppSwitcher';
import tapecloudLogoDark from '../assets/tapecloud-logo-dark.png';
import tapecloudLogoLight from '../assets/tapecloud-logo-light.png';

export default function Header({ user, onLoginClick, onLogoutClick, onDisplayNameChange, onAvatarChange, theme, onThemeChange }) {
  const tapecloudLogo = theme === 'light' ? tapecloudLogoLight : tapecloudLogoDark;

  return (
    <header className="portal-header">
      <AccountMenu
        user={user}
        onLoginClick={onLoginClick}
        onLogoutClick={onLogoutClick}
        onDisplayNameChange={onDisplayNameChange}
        onAvatarChange={onAvatarChange}
        theme={theme}
        onThemeChange={onThemeChange}
      />

      <div className="portal-header__title">
        <img className="portal-header__logo" src={tapecloudLogo} alt="TapeCloud" />
        <span className="portal-header__text">Portal de TapeCloud</span>
        <AppSwitcher current="tapecloud" theme={theme} logoSrc={tapecloudLogo} appName="TapeCloud" />
      </div>
    </header>
  );
}
