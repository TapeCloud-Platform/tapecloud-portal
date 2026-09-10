const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

async function authRequest(path, email, password) {
  const response = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const body = await response.json();

  if (!response.ok) {
    throw new Error(body.message || 'No se pudo completar la operación.');
  }

  return body;
}

export async function login(email, password) {
  return authRequest('/api/auth/login', email, password);
}

export async function register(email, password) {
  return authRequest('/api/auth/register', email, password);
}

async function authedRequest(path, method, token, payload) {
  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (response.status === 204) {
    return null;
  }

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(body.message || 'No se pudo completar la operación.');
  }

  return body;
}

export async function updateDisplayName(token, displayName) {
  return authedRequest('/api/auth/me/display-name', 'PATCH', token, { displayName });
}

export async function changePassword(token, currentPassword, newPassword) {
  return authedRequest('/api/auth/me/password', 'PATCH', token, { currentPassword, newPassword });
}
