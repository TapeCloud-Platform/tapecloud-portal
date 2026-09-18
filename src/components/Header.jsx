import AccountMenu from './AccountMenu';
import AppSwitcher from './AppSwitcher';
import tapecloudIconDark from '../assets/tapecloud-icon-dark.png';
import tapecloudIconLight from '../assets/tapecloud-icon-light.png';

export default function Header({ user, onLoginClick, onLogoutClick, onDisplayNameChange, onAvatarChange, theme, onThemeChange }) {
  const tapecloudLogo = theme === 'light' ? tapecloudIconLight : tapecloudIconDark;

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
        <span className="portal-header__text">Portal de TapeCloud</span>
        <AppSwitcher current="tapecloud" theme={theme} logoSrc={tapecloudLogo} appName="TapeCloud" />
      </div>
    </header>
  );
}
