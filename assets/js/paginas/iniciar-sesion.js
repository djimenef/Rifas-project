// Iniciar sesión.
import '../layout.js';

// Pega aquí el Client ID de Google Cloud (OAuth 2.0, tipo "Aplicación web") para activar el inicio de sesión real con Google.
const GOOGLE_CLIENT_ID = '';

const msg = document.getElementById('msg');
function show(text, type) {
  msg.textContent = text;
  msg.className = 'msg ' + type;
}

// Formulario (demo: aún no hay servidor que valide las credenciales)
const form = document.getElementById('form');
const user = document.getElementById('user');
const password = document.getElementById('password');
form.addEventListener('submit', e => {
  e.preventDefault();
  const u = user.value.trim();
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(u);
  const isDni = /^[0-9]{8}$/.test(u);
  if (!isEmail && !isDni) return show('Ingresa un correo válido o un DNI de 8 dígitos.', 'error');
  if (password.value.length < 6) return show('La contraseña debe tener al menos 6 caracteres.', 'error');
  show('¡Bienvenido de nuevo! Sesión iniciada (demo).', 'ok');
  form.reset();
});

const togglePass = document.getElementById('toggle-pass');
togglePass.addEventListener('click', () => {
  const hidden = password.type === 'password';
  password.type = hidden ? 'text' : 'password';
  togglePass.textContent = hidden ? 'Ocultar' : 'Mostrar';
  togglePass.setAttribute('aria-label', hidden ? 'Ocultar contraseña' : 'Mostrar contraseña');
});

// Inicio de sesión con Google (Google Identity Services)
const googleBtn = document.getElementById('google-btn');

function onGoogleCredential(response) {
  // OJO: en producción este token (JWT) se envía al servidor para verificarlo; aquí solo se lee para la demo.
  const payload = JSON.parse(decodeURIComponent(escape(atob(response.credential.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))));
  show(`¡Hola, ${payload.given_name || payload.name}! Iniciaste sesión con Google.`, 'ok');
}

if (GOOGLE_CLIENT_ID) {
  const s = document.createElement('script');
  s.src = 'https://accounts.google.com/gsi/client';
  s.async = true;
  s.onload = () => {
    google.accounts.id.initialize({ client_id: GOOGLE_CLIENT_ID, callback: onGoogleCredential });
    google.accounts.id.renderButton(document.getElementById('google-official'), {
      theme: 'outline', size: 'large', shape: 'pill', text: 'continue_with', locale: 'es', width: 320
    });
    googleBtn.hidden = true;
  };
  document.head.appendChild(s);
} else {
  googleBtn.addEventListener('click', () =>
    show('El inicio con Google aún no está configurado (falta el Client ID).', 'error'));
}
