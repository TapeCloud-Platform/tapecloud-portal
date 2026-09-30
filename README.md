# TapeCloud Portal - SSO & Landing Page 🌐

Portal principal y gestor centralizado de autenticación para el ecosistema TapeCloud. Desarrollado con **React 18** y **Vite**.

## 📋 Responsabilidades

- ✅ Landing page del ecosistema
- ✅ Registro de nuevos usuarios
- ✅ Login con JWT
- ✅ Gestión centralizada de sesión (localStorage)
- ✅ Redireccionamiento SSO a TapeFlix y TapeBeat
- ✅ Logout con limpieza de tokens

---

## 🏗️ Estructura

```
src/
├── components/
│   ├── LoginPage.jsx          # Formulario de login
│   ├── RegisterPage.jsx       # Formulario de registro
│   ├── LandingPage.jsx        # Landing page
│   └── [otros componentes]
│
├── App.jsx                    # Router principal (login/register/landing)
├── main.jsx                   # Punto de entrada React
├── api.js                     # Cliente HTTP (axios)
└── styles.css                 # Estilos globales
```

---

## 🚀 Cómo Ejecutar

### Docker (Recomendado)

```bash
cd TapeCloud
docker compose up --build tapecloud-portal
# Puerto 5173
# Acceso: http://localhost:5173
```

### Local (Sin Docker)

**Requisitos:**
- Node.js 18+
- npm 9+

```bash
cd tapecloud-portal

# Instalar dependencias
npm install

# Modo desarrollo (Vite dev server)
npm run dev
# Puerto 5173

# Build para producción
npm run build
# Genera: dist/
```

---

## 🔐 Flujo de Autenticación

### 1. Registro

```
Usuario llena formulario → LoginPage.jsx
                           ↓
                   Valida campos
                           ↓
                   POST /auth/register
                    (backend:8080)
                           ↓
                   Backend crea usuario
                   + genera JWT token
                           ↓
                   Response: {token, email, displayName}
                           ↓
                   Guarda en localStorage:
                   - tapecloud_token
                   - tapecloud_email
                   - tapecloud_display_name
                           ↓
                   Redirige a LandingPage
```

### 2. Login

```
Usuario introduce email/password
                           ↓
                   POST /auth/login
                   (backend:8080)
                           ↓
                   Backend valida credenciales
                           ↓
                   Response: {token, email, displayName}
                           ↓
                   Guarda en localStorage
                           ↓
                   Redirige a LandingPage
```

### 3. Navegación SSO

```
Usuario clickea "Ir a TapeFlix"
                           ↓
                   Construye URL con params:
                   http://localhost:5174/?
                   sso_token=TOKEN&
                   sso_email=EMAIL&
                   sso_display_name=NAME
                           ↓
                   TapeFlix recibe params
                           ↓
                   Valida token con backend
                           ↓
                   Usuario autenticado en TapeFlix
```

---

## 💾 Gestión de Sesión

### localStorage (Persistente)

```javascript
// Se guarda al hacer login/registro
localStorage.setItem('tapecloud_token', 'eyJhbGci...');
localStorage.setItem('tapecloud_email', 'usuario@example.com');
localStorage.setItem('tapecloud_display_name', 'Juan Pérez');

// Se recupera al cargar la página
const token = localStorage.getItem('tapecloud_token');
const email = localStorage.getItem('tapecloud_email');
const displayName = localStorage.getItem('tapecloud_display_name');

// Se limpia al logout
localStorage.removeItem('tapecloud_token');
localStorage.removeItem('tapecloud_email');
localStorage.removeItem('tapecloud_display_name');
```

### Estado React

```javascript
const [user, setUser] = useState(null);
const [view, setView] = useState('login'); // 'login' | 'register' | 'landing'
```

---

## 🔌 APIs Utilizadas

### POST `/auth/register`
**Desde:** api.js → Backend (puerto 8080)

```javascript
const response = await axios.post(
  'http://localhost:8080/auth/register',
  {
    email: 'usuario@example.com',
    password: 'secure123',
    displayName: 'Juan Pérez'
  }
);
// Response: {token, email, displayName}
```

### POST `/auth/login`
```javascript
const response = await axios.post(
  'http://localhost:8080/auth/login',
  {
    email: 'usuario@example.com',
    password: 'secure123'
  }
);
// Response: {token, email, displayName}
```

---

## 🧭 Navegación

### Rutas internas (SPA)

```
/ (root)
├── Login (/login) - Página de inicio de sesión
├── Registro (/register) - Página de registro
└── Landing Page - Después de autenticarse
    ├── Botón "Ir a TapeFlix" → http://localhost:5174
    ├── Botón "Ir a TapeBeat" → http://localhost:5175
    └── Botón "Salir" → Logout y volver a /login
```

### SSO Query Params

```
http://localhost:5174/?sso_token=TOKEN&sso_email=EMAIL&sso_display_name=NAME&sso_logout=false
http://localhost:5175/?sso_token=TOKEN&sso_email=EMAIL&sso_display_name=NAME&sso_logout=false
```

---

## 🎨 Componentes principales

### LoginPage.jsx
Formulario de login con validación de email y contraseña.

**Estado:**
```javascript
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [error, setError] = useState('');
```

**Funciones:**
- `handleLogin()` - POST /auth/login
- `handleRegisterRedirect()` - Cambiar a RegisterPage

---

### RegisterPage.jsx
Formulario de registro con validación.

**Estado:**
```javascript
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [displayName, setDisplayName] = useState('');
const [error, setError] = useState('');
```

**Funciones:**
- `handleRegister()` - POST /auth/register
- `handleLoginRedirect()` - Cambiar a LoginPage

---

### LandingPage.jsx
Página principal después de autenticarse.

**Muestra:**
- Bienvenida personalizada: "¡Hola, {displayName}!"
- Botones para navegar a TapeFlix y TapeBeat
- Botón Logout

---

## ⚙️ Configuración

### vite.config.js

```javascript
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: '0.0.0.0'
  }
});
```

### .env

```
VITE_API_URL=http://localhost:8080
```

### package.json

```json
{
  "name": "tapecloud-portal",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "axios": "^1.4.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.0.0",
    "vite": "^4.0.0"
  }
}
```

---

## 🐛 Troubleshooting

| Problema | Solución |
|----------|----------|
| "Port 5173 already in use" | `docker compose down` o cambiar puerto en vite.config.js |
| "Cannot connect to backend" | Verificar http://localhost:8080/health |
| "Sesión no persiste" | Limpiar localStorage en DevTools |
| "Login no funciona" | Ver logs del backend: `docker compose logs tapecloud-auth-core` |
| "Módulo no encontrado" | `npm install` para instalar dependencias |

---

## 🔒 Seguridad

- ✅ Tokens JWT almacenados en localStorage (accesibles a XSS)
  - 💡 En producción considerar httpOnly cookies
- ✅ Validación de email y contraseña en formularios
- ✅ Contraseñas hashadas en backend (no se transmiten en claro)
- ✅ HTTPS recomendado en producción

---

## 📚 Dependencias principales

```json
{
  "react": "^18.2.0",           // UI framework
  "react-dom": "^18.2.0",       // React rendering
  "axios": "^1.4.0",            // HTTP client
  "@vitejs/plugin-react": "^4.0.0"
}
```

---

## 📖 Más información

- [README raíz](../README.md) - Arquitectura general
- [Backend (auth-core)](../tapecloud-auth-core/README.md) - APIs y autenticación
- [TapeFlix](../tapeflix-app/README.md) - Catálogo de películas

---

**Última actualización:** Septiembre 2024
