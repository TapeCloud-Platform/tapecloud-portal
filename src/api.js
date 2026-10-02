const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// Sesion hibrida: cookie httpOnly (principal) + token en memoria (respaldo).
// El token vive solo en memoria JS (se pierde al recargar, nunca toca storage):
// si el navegador bloquea cookies de terceros, igual viaja por header Bearer.
let memoryToken = null;

export function setMemoryToken(token) {
  memoryToken = token || null;
}

export function clearMemoryToken() {
  memoryToken = null;
}

function authHeaders() {
  return {
    'Content-Type': 'application/json',
    ...(memoryToken ? { Authorization: `Bearer ${memoryToken}` } : {}),
  };
}

// Sesión híbrida: cookie httpOnly (principal) + Bearer en memoria (respaldo).

async function postJson(path, payload) {
  const response = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    credentials: 'include',
    headers: authHeaders(),
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

async function authedRequest(path, method, _token, payload) {
  const init = {
    method,
    credentials: 'include',
    headers: authHeaders(),
  };
  if (payload !== undefined) {
    init.body = JSON.stringify(payload);
  }
  const response = await fetch(`${API_URL}${path}`, init);

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

export async function updateUsername(_token, username) {
  return authedRequest('/api/auth/me/username', 'PATCH', undefined, { username });
}

export async function updateAvatar(_token, avatarDataUri) {
  return authedRequest('/api/auth/me/avatar', 'PATCH', undefined, { avatarDataUri });
}

export async function changePassword(_token, currentPassword, newPassword) {
  return authedRequest('/api/auth/me/password', 'PATCH', undefined, { currentPassword, newPassword });
}

/** Borrado definitivo de la cuenta (pide contraseña + código 2FA o email). 204 = sin contenido. */
export async function deleteAccount(_token, { password, totpCode, emailCode }) {
  return authedRequest('/api/auth/me', 'DELETE', undefined, { password, totpCode, emailCode });
}

/** Envía por email el código para confirmar la eliminación (solo cuentas sin 2FA). */
export async function requestDeleteCode() {
  return authedRequest('/api/auth/me/delete-code', 'POST');
}

export async function getMyReviewStats() {
  return authedRequest('/api/reviews/me/stats', 'GET');
}

/** Invalida la sesión en el backend (bump de tokenVersion + limpia cookie). 204 = sin contenido. */
export async function logout() {
  return authedRequest('/api/auth/logout', 'POST');
}

/**
 * Valida la sesión contra el backend (cookie). Solo un 2xx significa sesión
 * válida (sin cookie el backend responde 403, no 401). Con error de red se
 * asume válida para no cerrar sesiones por estar offline.
 */
export async function checkSession() {
  let response;
  try {
    response = await fetch(`${API_URL}/api/auth/me`, { credentials: 'include', headers: authHeaders() });
  } catch {
    return true;
  }
  return response.ok;
}

export async function getMe() {
  return authedRequest('/api/auth/me', 'GET');
}

export async function setupTotp() {
  return authedRequest('/api/auth/2fa/setup', 'POST');
}

export async function enableTotp(_token, code) {
  return authedRequest('/api/auth/2fa/enable', 'POST', undefined, { code });
}

export async function disableTotp(_token, password) {
  return authedRequest('/api/auth/2fa/disable', 'POST', undefined, { password });
}
