import { useState } from 'react';
import Header from './components/Header';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import tapeflixLogo from './assets/tapeflix-logo.jpeg';

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
    const email = localStorage.getItem('tapecloud_email');
    const displayName = localStorage.getItem('tapecloud_display_name');
    return email ? { email, displayName: displayName || email.split('@')[0] } : null;
  });

  function handleLoginSuccess({ token, email, displayName }) {
    localStorage.setItem('tapecloud_token', token);
    localStorage.setItem('tapecloud_email', email);
    localStorage.setItem('tapecloud_display_name', displayName || email.split('@')[0]);
    setUser({ email, displayName: displayName || email.split('@')[0] });
    setView('portal');
  }

  function handleLogout() {
    localStorage.removeItem('tapecloud_token');
    localStorage.removeItem('tapecloud_email');
    localStorage.removeItem('tapecloud_display_name');
    setUser(null);
  }

  function handleDisplayNameChange(newDisplayName) {
    localStorage.setItem('tapecloud_display_name', newDisplayName);
    setUser((current) => (current ? { ...current, displayName: newDisplayName } : current));
  }

  if (view === 'login') {
    return (
      <div className="portal-page">
        <LoginPage
          onBack={() => setView('portal')}
          onSuccess={handleLoginSuccess}
          onGoToRegister={() => setView('register')}
        />
      </div>
    );
  }

  if (view === 'register') {
    return (
      <div className="portal-page">
        <RegisterPage
          onBack={() => setView('portal')}
          onSuccess={handleLoginSuccess}
          onGoToLogin={() => setView('login')}
        />
      </div>
    );
  }

  function buildAppUrl(baseUrl) {
    if (!user) {
      return `${baseUrl}?sso_logout=true`;
    }
    const token = localStorage.getItem('tapecloud_token');
    const params = new URLSearchParams({
      sso_token: token || '',
      sso_email: user.email,
      sso_display_name: user.displayName || '',
    });
    return `${baseUrl}?${params.toString()}`;
  }

  return (
    <div className="portal-page">
      <Header
        user={user}
        onLoginClick={() => setView('login')}
        onLogoutClick={handleLogout}
        onDisplayNameChange={handleDisplayNameChange}
      />

      <main className="dashboard">
        <section className="dashboard-choices" aria-label="Seleccioná un sistema">
          <a className="system-choice tapeflix-choice" href={buildAppUrl('http://localhost:5174')} aria-label="Acceder a TapeFlix">
            <div className="choice-content">
              <span className="choice-index">01 / VISUAL STORIES</span>
              <div className="choice-icon" aria-hidden="true">🎬</div>
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
              <div className="choice-icon" aria-hidden="true">🎧</div>
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
    </div>
  );
}
