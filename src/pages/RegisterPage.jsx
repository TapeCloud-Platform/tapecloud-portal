import { useState } from 'react';
import { register } from '../api';

export default function RegisterPage({ onBack, onSuccess, onGoToLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);
    try {
      const response = await register(email, password);
      onSuccess(response);
    } catch (err) {
      setError(err.message || 'No se pudo crear la cuenta.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="portal-shell">
      <section className="portal-card login-card">
        <p className="eyebrow">TapeCloud</p>
        <h1>Crear cuenta</h1>

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
              minLength={6}
            />
          </label>

          <label>
            Confirmar contraseña
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
              minLength={6}
            />
          </label>

          {error && <p className="error">{error}</p>}

          <button type="submit" className="login-button login-button--primary" disabled={loading}>
            {loading ? 'Creando cuenta...' : 'Registrarme'}
          </button>

          <button type="button" className="login-button" onClick={onBack}>
            Volver
          </button>

          <p className="login-form__switch">
            ¿Ya tenés cuenta?{' '}
            <button type="button" className="login-link" onClick={onGoToLogin}>
              Iniciar sesión
            </button>
          </p>
        </form>
      </section>
    </main>
  );
}
