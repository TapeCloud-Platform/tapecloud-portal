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
  const [view, setView] = useState('portal');
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
      return baseUrl;
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

      <main className="portal-shell">
        <section className="portal-card">
          <p className="eyebrow">TapeCloud</p>
          <h1>Elegí tu aplicación</h1>
          <p className="subtitle">Accedé a TapeFlix o TapeBeat para continuar.</p>

          <div className="apps-grid">
            {apps.map((app) => (
              <a key={app.id} className="app-link" href={buildAppUrl(app.url)}>
                {app.logo ? (
                  <img className="app-icon app-icon--logo" src={app.logo} alt={app.name} />
                ) : (
                  <div className="app-icon">{app.name.slice(0, 2).toUpperCase()}</div>
                )}
                <div>
                  <h2>{app.name}</h2>
                  <p>{app.description}</p>
                </div>
              </a>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
