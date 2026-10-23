// Iniciar sesión.
// Tras iniciar sesión vuelve a ?volver= (p. ej. el detalle de una rifa) o, si no hay, a /rifas.
import { listo } from '../layout.js';
import { authService } from '../services/index.js';
import { url, destinoVolver, parametro } from '../lib/rutas.js';

const msg = document.getElementById('msg');
const form = document.getElementById('form');
const user = document.getElementById('user');
const password = document.getElementById('password');
const enviar = document.getElementById('enviar');
const googleBtn = document.getElementById('google-btn');

function show(text, type) {
  msg.textContent = text;
  msg.className = 'msg ' + type;
}

// Los enlaces a registro y a recuperar conservan a dónde volver.
const volver = parametro('volver') ?? undefined;
document.getElementById('enlace-registro').href = url('registro', { volver });
document.getElementById('enlace-recuperar').href = url('recuperar', { volver });

function irADestino(sesion) {
  location.href = destinoVolver(sesion.usuario.rol === 'ADMIN' ? url('admin') : url('rifas'));
}

function ocupado(si) {
  enviar.disabled = si;
  googleBtn.disabled = si;
  enviar.textContent = si ? 'Ingresando…' : 'Iniciar sesión';
}

await listo;

form.addEventListener('submit', async e => {
  e.preventDefault();
  const u = user.value.trim();
  const esCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(u);
  const esDni = /^[0-9]{8}$/.test(u);
  if (!esCorreo && !esDni) return show('Ingresa un correo válido o un DNI de 8 dígitos.', 'error');
  if (password.value.length < 6) return show('La contraseña debe tener al menos 6 caracteres.', 'error');
  ocupado(true);
  show('', '');
  try {
    irADestino(await authService.iniciarSesion(u, password.value));
  } catch (error) {
    ocupado(false);
    show(error.message, 'error');
    password.focus();
  }
});

const togglePass = document.getElementById('toggle-pass');
togglePass.addEventListener('click', () => {
  const hidden = password.type === 'password';
  password.type = hidden ? 'text' : 'password';
  togglePass.textContent = hidden ? 'Ocultar' : 'Mostrar';
  togglePass.setAttribute('aria-label', hidden ? 'Ocultar contraseña' : 'Mostrar contraseña');
});

// Fase 0: Google se simula con el AuthService (sin scripts externos).
googleBtn.addEventListener('click', async () => {
  ocupado(true);
  try {
    irADestino(await authService.iniciarSesionConGoogle());
  } catch (error) {
    ocupado(false);
    show(error.message, 'error');
  }
});
