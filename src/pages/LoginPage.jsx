import { useState } from 'react';
import { login } from '../api';

export default function LoginPage({ onBack, onSuccess, onGoToRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await login(email, password);
      onSuccess(response);
    } catch (err) {
      setError(err.message || 'No se pudo iniciar sesión.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="portal-shell">
      <section className="portal-card login-card">
        <p className="eyebrow">TapeCloud</p>
        <h1>Iniciar sesión</h1>

        <form className="login-form" onSubmit={handleSubmit}>
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>

          <label>
            Contraseña
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>

          {error && <p className="error">{error}</p>}

          <button type="submit" className="login-button login-button--primary" disabled={loading}>
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>

          <button type="button" className="login-button" onClick={onBack}>
            Volver
          </button>

          <p className="login-form__switch">
            ¿No tenés cuenta?{' '}
            <button type="button" className="login-link" onClick={onGoToRegister}>
              Registrarte
            </button>
          </p>
        </form>
      </section>
    </main>
  );
}
