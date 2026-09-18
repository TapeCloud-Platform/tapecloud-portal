import { useEffect, useState } from 'react';
import Header from './components/Header';
import AuthModal from './components/AuthModal';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import tapeflixLogo from './assets/tapeflix-logo.jpeg';
import tapeflixIconDark from './assets/tapeflix-icon.png';
import tapebeatIconDark from './assets/tapebeat-icon.png';
import tapeflixIconLight from './assets/tapeflix-icon-light.png';
import tapebeatIconLight from './assets/tapebeat-icon-light.png';

const apps = [
  {
    id: 'tapeflix',
    name: 'TapeFlix',
    description: 'Películas, series y reseñas.',
    url: 'http://localhost:5174',
    logo: tapeflixLogo,
  },
  {
    id: 'tapebeat',
    name: 'TapeBeat',
    description: 'Música, artistas y playlists.',
    url: 'http://localhost:5175',
    logo: null,
  },
];

export default function App() {
  const [view, setView] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('view') === 'login' ? 'login' : 'portal';
  });
  const [user, setUser] = useState(() => {
    // Si venimos de un login hecho en TapeFlix/TapeBeat, esos datos llegan por
    // query params (mismo mecanismo que ya usa el tema) y hay que persistirlos
    // acá, porque cada app tiene su propio localStorage al ser otro origen.
    const params = new URLSearchParams(window.location.search);
    const incomingToken = params.get('sso_token');
    const incomingEmail = params.get('sso_email');
    if (incomingToken && incomingEmail) {
      const displayName = params.get('sso_display_name') || incomingEmail.split('@')[0];
      const avatarDataUri = params.get('sso_avatar') || null;
      localStorage.setItem('tapecloud_token', incomingToken);
      localStorage.setItem('tapecloud_email', incomingEmail);
      localStorage.setItem('tapecloud_display_name', displayName);
      if (avatarDataUri) {
        localStorage.setItem('tapecloud_avatar', avatarDataUri);
      } else {
        localStorage.removeItem('tapecloud_avatar');
      }
      return { email: incomingEmail, displayName, avatarDataUri };
    }

    const email = localStorage.getItem('tapecloud_email');
    const displayName = localStorage.getItem('tapecloud_display_name');
    const avatarDataUri = localStorage.getItem('tapecloud_avatar');
    return email ? { email, displayName: displayName || email.split('@')[0], avatarDataUri } : null;
  });
  const [theme, setTheme] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const incoming = params.get('sso_theme');
    if (incoming === 'dark' || incoming === 'light') {
      localStorage.setItem('tapecloud_theme', incoming);
      return incoming;
    }
    return localStorage.getItem('tapecloud_theme') || 'dark';
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('tapecloud_theme', theme);
  }, [theme]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    let changed = false;
    for (const key of [...params.keys()]) {
      if (key.startsWith('sso_')) {
        params.delete(key);
        changed = true;
      }
    }
    if (changed) {
      const query = params.toString();
      window.history.replaceState({}, '', `${window.location.pathname}${query ? `?${query}` : ''}`);
    }
    // Solo al montar: limpia los parámetros que dejó la app de origen sin tocar `view`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Al volver de TapeFlix/TapeBeat con el botón "atrás", Chrome puede restaurar
    // esta página desde el bfcache (una foto congelada) en vez de recargarla de
    // verdad, lo que puede dejar el CSS a medio aplicar. Forzar un reload real
    // evita ese estado inconsistente.
    function handlePageShow(event) {
      if (event.persisted) {
        window.location.reload();
      }
    }
    window.addEventListener('pageshow', handlePageShow);
    return () => window.removeEventListener('pageshow', handlePageShow);
  }, []);

  function handleLoginSuccess({ token, email, displayName, avatarDataUri }) {
    localStorage.setItem('tapecloud_token', token);
    localStorage.setItem('tapecloud_email', email);
    localStorage.setItem('tapecloud_display_name', displayName || email.split('@')[0]);
    if (avatarDataUri) {
      localStorage.setItem('tapecloud_avatar', avatarDataUri);
    } else {
      localStorage.removeItem('tapecloud_avatar');
    }
    setUser({ email, displayName: displayName || email.split('@')[0], avatarDataUri: avatarDataUri || null });
    setView('portal');
  }

  function handleLogout() {
    localStorage.removeItem('tapecloud_token');
    localStorage.removeItem('tapecloud_email');
    localStorage.removeItem('tapecloud_display_name');
    localStorage.removeItem('tapecloud_avatar');
    setUser(null);
  }

  function handleDisplayNameChange(newDisplayName) {
    localStorage.setItem('tapecloud_display_name', newDisplayName);
    setUser((current) => (current ? { ...current, displayName: newDisplayName } : current));
  }

  function handleAvatarChange(avatarDataUri) {
    if (avatarDataUri) {
      localStorage.setItem('tapecloud_avatar', avatarDataUri);
    } else {
      localStorage.removeItem('tapecloud_avatar');
    }
    setUser((current) => (current ? { ...current, avatarDataUri: avatarDataUri || null } : current));
  }

  const tapeflixIcon = theme === 'light' ? tapeflixIconLight : tapeflixIconDark;
  const tapebeatIcon = theme === 'light' ? tapebeatIconLight : tapebeatIconDark;

  function buildAppUrl(baseUrl) {
    if (!user) {
      return `${baseUrl}?${new URLSearchParams({ sso_logout: 'true', sso_theme: theme }).toString()}`;
    }
    const token = localStorage.getItem('tapecloud_token');
    const params = new URLSearchParams({
      sso_token: token || '',
      sso_email: user.email,
      sso_display_name: user.displayName || '',
      sso_theme: theme,
    });
    if (user.avatarDataUri) {
      params.set('sso_avatar', user.avatarDataUri);
    }
    return `${baseUrl}?${params.toString()}`;
  }

  return (
    <div className="portal-page">
      <Header
        user={user}
        onLoginClick={() => setView('login')}
        onLogoutClick={handleLogout}
        onDisplayNameChange={handleDisplayNameChange}
        onAvatarChange={handleAvatarChange}
        theme={theme}
        onThemeChange={setTheme}
      />

      <main className="dashboard">
        <section className="dashboard-choices" aria-label="Seleccioná un sistema">
          <a className="system-choice tapeflix-choice" href={buildAppUrl('http://localhost:5174')} aria-label="Acceder a TapeFlix">
            <div className="choice-content">
              <span className="choice-index">01 / VISUAL STORIES</span>
              <div className="choice-icon" aria-hidden="true">
                <img src={tapeflixIcon} alt="" />
              </div>
              <h1>TapeFlix</h1>
              <p>Películas, series y nuevas historias para ver cuando quieras.</p>
              <span className="choice-cta">
                Entrar a TapeFlix <span aria-hidden="true">→</span>
              </span>
            </div>
            <span className="choice-corner">CINEMA SYSTEM</span>
          </a>

          <a className="system-choice tapebeat-choice" href={buildAppUrl('http://localhost:5175')} aria-label="Acceder a TapeBeat">
            <div className="choice-content">
              <span className="choice-index">02 / SOUND EXPERIENCES</span>
              <div className="choice-icon" aria-hidden="true">
                <img src={tapebeatIcon} alt="" />
              </div>
              <h1>TapeBeat</h1>
              <p>Música, playlists y ritmos para acompañar cada momento.</p>
              <span className="choice-cta">
                Entrar a TapeBeat <span aria-hidden="true">→</span>
              </span>
            </div>
            <span className="choice-corner">AUDIO SYSTEM</span>
          </a>
        </section>
      </main>

      {(view === 'login' || view === 'register') && (
        <AuthModal onClose={() => setView('portal')} theme={theme}>
          {view === 'login' ? (
            <LoginPage
              onSuccess={handleLoginSuccess}
              onGoToRegister={() => setView('register')}
            />
          ) : (
            <RegisterPage
              onSuccess={handleLoginSuccess}
              onGoToLogin={() => setView('login')}
            />
          )}
        </AuthModal>
      )}
    </div>
  );
}
