// Recuperar contraseña (/recuperar): solicitar · enlace enviado · nueva contraseña (?token=) · lista · enlace no válido.
// La respuesta al solicitar es la misma exista o no la cuenta (no revela qué correos están registrados).
import { listo } from '../layout.js';
import { authService } from '../services/index.js';
import { url, parametro, enlazarRutas } from '../lib/rutas.js';
import { esc } from '../lib/html.js';
import { LARGO_MIN_CONTRASENA } from '../domain/usuario.js';
import { mostrarErrores, limpiarErrores, limpiarAlEscribir } from '../components/formulario.js';

const tarjeta = document.getElementById('tarjeta');
const titulo = document.getElementById('titulo');
const sub = document.getElementById('sub');

const { permitido } = await listo;
enlazarRutas();

function encabezado(t, s) {
  titulo.textContent = t;
  sub.textContent = s;
}

/** Envía un formulario mostrando "procesando" en su botón y los errores junto a cada campo. */
function alEnviar(form, textoProcesando, accion) {
  const boton = form.querySelector('[type="submit"]');
  const textoBoton = boton.textContent;
  const errorGeneral = form.querySelector('.form-error');
  limpiarAlEscribir(form);
  form.addEventListener('submit', async e => {
    e.preventDefault();
    limpiarErrores(form);
    errorGeneral.hidden = true;
    boton.disabled = true;
    boton.textContent = textoProcesando;
    try {
      await accion(Object.fromEntries(new FormData(form)));
    } catch (error) {
      boton.disabled = false;
      boton.textContent = textoBoton;
      if (error.codigo === 'ENLACE_INVALIDO') return enlaceInvalido();
      if (!mostrarErrores(form, error.campos)) {
        errorGeneral.textContent = error.message;
        errorGeneral.hidden = false;
      }
    }
  });
}

function solicitar() {
  tarjeta.innerHTML = `
    <form id="form" novalidate>
      <label>Correo electrónico<input type="email" name="correo" autocomplete="email" required placeholder="tucorreo@ejemplo.com"></label>
      <p class="form-error" role="alert" hidden></p>
      <button class="btn btn-primary" type="submit">Enviar enlace</button>
    </form>`;
  const form = tarjeta.querySelector('form');
  form.elements.correo.focus();
  alEnviar(form, 'Enviando…', async ({ correo }) => {
    await authService.solicitarRecuperacion(correo);
    enviado(correo.trim());
  });
}

function enviado(correo) {
  encabezado('Revisa tu correo', 'Si hay una cuenta con ese correo, te llegará un enlace para crear una contraseña nueva. Vence en 1 hora.');
  tarjeta.innerHTML = `
    <div class="recuperar-listo" role="status">
      <span class="estado-icono" aria-hidden="true">✉️</span>
      <h2>Enlace enviado</h2>
      <p>Lo enviamos a <b>${esc(correo)}</b>. Si no lo ves, revisa tu carpeta de spam.</p>
      <p class="field-hint">Fase 0 (demo): <a class="enlace" href="${url('recuperar', { token: 'demo' })}">abrir el enlace del correo</a>. Solo funciona si el correo es de una cuenta de demo.</p>
      <button type="button" class="enlace" id="otro-correo">Usar otro correo</button>
    </div>`;
  tarjeta.querySelector('#otro-correo').addEventListener('click', () => {
    encabezado('Recupera tu contraseña', 'Escribe el correo de tu cuenta y te enviaremos un enlace para crear una contraseña nueva.');
    solicitar();
  });
}

function nuevaContrasena(token) {
  encabezado('Crea una contraseña nueva', `Usa al menos ${LARGO_MIN_CONTRASENA} caracteres.`);
  tarjeta.innerHTML = `
    <form id="form" novalidate>
      <label>Contraseña nueva<input type="password" name="contrasena" autocomplete="new-password" minlength="${LARGO_MIN_CONTRASENA}" required></label>
      <label>Repite la contraseña<input type="password" name="confirmacionContrasena" autocomplete="new-password" required></label>
      <label class="check"><input type="checkbox" id="ver"> Mostrar contraseñas</label>
      <p class="form-error" role="alert" hidden></p>
      <button class="btn btn-primary" type="submit">Guardar contraseña</button>
    </form>`;
  const form = tarjeta.querySelector('form');
  form.elements.contrasena.focus();
  form.querySelector('#ver').addEventListener('change', e => {
    for (const n of ['contrasena', 'confirmacionContrasena']) form.elements[n].type = e.target.checked ? 'text' : 'password';
  });
  alEnviar(form, 'Guardando…', async d => {
    await authService.restablecerContrasena(token, d.contrasena, d.confirmacionContrasena);
    lista();
  });
}

function lista() {
  encabezado('Contraseña actualizada', 'Ya puedes iniciar sesión con tu contraseña nueva.');
  tarjeta.innerHTML = `
    <div class="recuperar-listo" role="status">
      <span class="estado-icono" aria-hidden="true">✓</span>
      <h2>¡Listo!</h2>
      <p>Por seguridad, el enlace ya no se puede volver a usar.</p>
      <a class="btn btn-primary" href="${url('login')}">Iniciar sesión</a>
    </div>`;
  tarjeta.querySelector('a').focus();
}

function enlaceInvalido() {
  encabezado('El enlace no es válido', 'Puede que ya lo hayas usado o que haya vencido.');
  tarjeta.innerHTML = `
    <div class="recuperar-listo" role="alert">
      <span class="estado-icono" aria-hidden="true">!</span>
      <h2>Pide un enlace nuevo</h2>
      <p>Los enlaces vencen en 1 hora y se usan una sola vez.</p>
      <a class="btn btn-primary" href="${url('recuperar')}">Pedir otro enlace</a>
    </div>`;
}

if (permitido) {
  const token = parametro('token');
  if (token) nuevaContrasena(token); else solicitar();
}
