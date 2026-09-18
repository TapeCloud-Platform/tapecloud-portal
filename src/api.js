const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

async function postJson(path, payload) {
  const response = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (response.status === 204) {
    if (!response.ok) {
      throw new Error('No se pudo completar la operación.');
    }
    return null;
  }

  const body = await response.json();

  if (!response.ok) {
    const error = new Error(body.message || 'No se pudo completar la operación.');
    error.totpRequired = Boolean(body.totpRequired);
    throw error;
  }

  return body;
}

/** El login acepta email o nombre de usuario indistintamente. totpCode solo hace falta si la cuenta tiene 2FA activado. */
export async function login(identifier, password, totpCode) {
  return postJson('/api/auth/login', { identifier, password, totpCode: totpCode || undefined });
}

export async function register(email, username, password) {
  return postJson('/api/auth/register', { email, username, password });
}

export async function verifyEmail(email, code) {
  return postJson('/api/auth/verify-email', { email, code });
}

export async function resendVerificationCode(email) {
  return postJson('/api/auth/resend-code', { email });
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
    const error = new Error(body.message || 'No se pudo completar la operación.');
    error.totpRequired = Boolean(body.totpRequired);
    throw error;
  }

  return body;
}

export async function updateUsername(token, username) {
  return authedRequest('/api/auth/me/username', 'PATCH', token, { username });
}

export async function updateAvatar(token, avatarDataUri) {
  return authedRequest('/api/auth/me/avatar', 'PATCH', token, { avatarDataUri });
}

export async function changePassword(token, currentPassword, newPassword) {
  return authedRequest('/api/auth/me/password', 'PATCH', token, { currentPassword, newPassword });
}

export async function getMyReviewStats(token) {
  return authedRequest('/api/reviews/me/stats', 'GET', token);
}

export async function getMe(token) {
  return authedRequest('/api/auth/me', 'GET', token);
}

export async function setupTotp(token) {
  return authedRequest('/api/auth/2fa/setup', 'POST', token);
}

export async function enableTotp(token, code) {
  return authedRequest('/api/auth/2fa/enable', 'POST', token, { code });
}

export async function disableTotp(token, password) {
  return authedRequest('/api/auth/2fa/disable', 'POST', token, { password });
}
