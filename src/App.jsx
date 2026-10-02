import { useEffect, useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import { logout, checkSession, getMe, setMemoryToken, clearMemoryToken } from './api';
import tapeflixLogoLight from './assets/tapeflix-logo-light.png';
import tapeflixLogoDark from './assets/tapeflix-logo-dark.png';
import tapebeatLogoLight from './assets/tapebeat-logo-light.png';
import tapebeatLogoDark from './assets/tapebeat-logo-dark.png';

const TAPEFLIX_URL = import.meta.env.VITE_TAPEFLIX_URL || 'http://localhost:5174';
const TAPEBEAT_URL = import.meta.env.VITE_TAPEBEAT_URL || 'http://localhost:5175';

const apps = [
  {
    id: 'tapeflix',
    name: 'TapeFlix',
    description: 'Películas, series y reseñas.',
    url: TAPEFLIX_URL,
  },
  {
    id: 'tapebeat',
    name: 'TapeBeat',
    description: 'Música, artistas y playlists.',
    url: TAPEBEAT_URL,
  },
];

export default function App() {
  const [view, setView] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('view') === 'login' ? 'login' : 'portal';
  });
  const [user, setUser] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    // Cierre de sesión global: otra app del ecosistema avisa con ?sso_logout=true
    // (cada origen limpia su propio localStorage, nadie puede tocar el ajeno).
    if (params.get('sso_logout') === 'true') {
      localStorage.removeItem('tapecloud_email');
      localStorage.removeItem('tapecloud_display_name');
      localStorage.removeItem('tapecloud_avatar');
      return null;
    }
    // La auth viaja por cookie httpOnly: ya no se acepta sso_token por URL.
    const incomingEmail = params.get('sso_email');
    if (incomingEmail) {
      const displayName = params.get('sso_display_name') || incomingEmail.split('@')[0];
      const avatarDataUri = params.get('sso_avatar') || null;
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
    // Sesión por cookie httpOnly; un 401 limpia el perfil UI local.
    // Si hay cookie válida pero sin perfil local, se restaura vía /me.
    let cancelled = false;
    async function validateSession() {
      const valid = await checkSession();
      if (!valid && !cancelled) {
        localStorage.removeItem('tapecloud_email');
        localStorage.removeItem('tapecloud_display_name');
        localStorage.removeItem('tapecloud_avatar');
        setUser(null);
        return;
      }
      if (valid && !localStorage.getItem('tapecloud_email') && !cancelled) {
        try {
          const me = await getMe();
          if (cancelled) return;
          localStorage.setItem('tapecloud_email', me.email);
          localStorage.setItem('tapecloud_display_name', me.displayName || me.email.split('@')[0]);
          if (me.avatarDataUri) localStorage.setItem('tapecloud_avatar', me.avatarDataUri);
          setUser({
            email: me.email,
            displayName: me.displayName || me.email.split('@')[0],
            avatarDataUri: me.avatarDataUri || null,
          });
        } catch {
          // /me falló pero la cookie parece válida: no se cierra sesión.
        }
      }
    }
    validateSession();
    window.addEventListener('focus', validateSession);
    window.addEventListener('pageshow', validateSession);
    return () => {
      cancelled = true;
      window.removeEventListener('focus', validateSession);
      window.removeEventListener('pageshow', validateSession);
    };
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
    // Híbrido: cookie httpOnly (la setea el backend) + token en memoria
    // como respaldo si el navegador bloquea cookies de terceros.
    setMemoryToken(token);
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

  function broadcastLogout() {
    // Avisa a TapeFlix/TapeBeat con iframes invisibles para que cierren su
    // propia sesión (cada origen limpia su propio localStorage).
    const params = new URLSearchParams({ sso_logout: 'true', sso_theme: theme });
    for (const baseUrl of [TAPEFLIX_URL, TAPEBEAT_URL]) {
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.setAttribute('aria-hidden', 'true');
      iframe.src = `${baseUrl}/?${params.toString()}`;
      document.body.appendChild(iframe);
      iframe.addEventListener('load', () => {
        setTimeout(() => iframe.remove(), 500);
      });
    }
  }

  async function handleLogout() {
    // 1. Invalida la sesión en el backend (limpia cookie; aunque falle, se sigue local).
    try {
      await logout();
    } catch {
      // Sin conexión o sesión ya inválida: igual se cierra localmente.
    }
    // 2. Avisa a las apps para que cierren su propio perfil UI (SSO).
    broadcastLogout();
    clearMemoryToken();
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

  const tapeflixLogo = theme === 'light' ? tapeflixLogoLight : tapeflixLogoDark;
  const tapebeatLogo = theme === 'light' ? tapebeatLogoLight : tapebeatLogoDark;

  function buildAppUrl(baseUrl) {
    if (!user) {
      return `${baseUrl}?${new URLSearchParams({ sso_logout: 'true', sso_theme: theme }).toString()}`;
    }
    // Solo perfil UI por URL; la auth viaja por cookie del API.
    const params = new URLSearchParams({
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
          <a className="system-choice tapeflix-choice" href={buildAppUrl(TAPEFLIX_URL)} aria-label="Acceder a TapeFlix">
            <div className="choice-content">
              <span className="choice-index">Cine y series</span>
              <div className="choice-icon" aria-hidden="true">
                <img src={tapeflixLogo} alt="" />
              </div>
              <h1>TapeFlix</h1>
              <p>Descubrí películas y series, calificá con estrellas y compartí tus reseñas.</p>
              <span className="choice-cta">
                Entrar a TapeFlix <span aria-hidden="true">→</span>
              </span>
            </div>
          </a>

          <a className="system-choice tapebeat-choice" href={buildAppUrl(TAPEBEAT_URL)} aria-label="Acceder a TapeBeat">
            <div className="choice-content">
              <span className="choice-index">Música y artistas</span>
              <div className="choice-icon" aria-hidden="true">
                <img src={tapebeatLogo} alt="" />
              </div>
              <h1>TapeBeat</h1>
              <p>Explorá canciones, álbumes y artistas, y dejá tu reseña en cada tema.</p>
              <span className="choice-cta">
                Entrar a TapeBeat <span aria-hidden="true">→</span>
              </span>
            </div>
          </a>
        </section>
      </main>

      <Footer theme={theme} />

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
