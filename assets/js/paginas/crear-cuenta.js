// Crear cuenta.
// Las reglas (DNI de 8 dígitos, mayor de 18, DNI/correo/apodo únicos…) las aplica AuthService;
// aquí solo se muestran sus errores junto a cada campo. Al terminar va a /verificar conservando ?volver=.
import { listo } from '../layout.js';
import { authService } from '../services/index.js';
import { url, parametro } from '../lib/rutas.js';
import { EDAD_MINIMA } from '../domain/usuario.js';

const form = document.getElementById('form');
const enviar = document.getElementById('enviar');
const errorGeneral = document.getElementById('form-error');
const volver = parametro('volver') ?? undefined;

document.getElementById('enlace-login').href = url('login', { volver });

// El calendario no deja elegir fechas de menores de edad.
const hoy = new Date();
const limite = new Date(hoy.getFullYear() - EDAD_MINIMA, hoy.getMonth(), hoy.getDate());
form.fechaNacimiento.max = limite.toISOString().slice(0, 10);

function limpiarError(campo) {
  campo.removeAttribute('aria-invalid');
  campo.removeAttribute('aria-describedby');
  campo.closest('label').querySelector('.field-error')?.remove();
}

function mostrarError(nombre, mensaje) {
  const campo = form.elements[nombre];
  if (!campo) return false;
  limpiarError(campo);
  const id = `error-${nombre}`;
  const span = document.createElement('span');
  span.className = 'field-error';
  span.id = id;
  span.textContent = mensaje;
  campo.closest('label').appendChild(span);
  campo.setAttribute('aria-invalid', 'true');
  campo.setAttribute('aria-describedby', id);
  return true;
}

function limpiarTodo() {
  [...form.elements].forEach(c => c.name && limpiarError(c));
  errorGeneral.hidden = true;
}

form.addEventListener('input', e => { if (e.target.name) limpiarError(e.target); });

await listo;

form.addEventListener('submit', async e => {
  e.preventDefault();
  limpiarTodo();
  const datos = Object.fromEntries(new FormData(form));
  datos.aceptaTerminos = form.aceptaTerminos.checked;
  enviar.disabled = true;
  enviar.textContent = 'Creando tu cuenta…';
  try {
    await authService.registrar(datos);
    location.href = url('verificar', { volver });
  } catch (error) {
    enviar.disabled = false;
    enviar.textContent = 'Crear mi cuenta';
    const campos = Object.entries(error.campos ?? {});
    const mostrados = campos.filter(([nombre, mensaje]) => mostrarError(nombre, mensaje));
    if (!mostrados.length) {
      errorGeneral.textContent = error.message;
      errorGeneral.hidden = false;
    }
    form.querySelector('[aria-invalid="true"]')?.focus();
  }
});
