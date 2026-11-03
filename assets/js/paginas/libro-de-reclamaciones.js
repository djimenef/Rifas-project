// Libro de Reclamaciones (/libro-de-reclamaciones): formulario · enviado.
// Las reglas (campos obligatorios, DNI, celular, correo) las aplica ReclamosService; aquí solo se muestran sus errores.
// Con sesión, los datos de contacto se completan desde la cuenta.
import { listo } from '../layout.js';
import { reclamosService } from '../services/index.js';
import { url } from '../lib/rutas.js';
import { esc } from '../lib/html.js';
import { fechaLarga, fechaHora } from '../lib/formato.js';
import { mostrarErrores, limpiarErrores, limpiarAlEscribir } from '../components/formulario.js';

const contenido = document.getElementById('contenido');
const form = document.getElementById('form');
const enviar = document.getElementById('enviar');
const errorGeneral = document.getElementById('form-error');
const apoderado = document.getElementById('campo-apoderado');

const { usuario } = await listo;

document.getElementById('fecha-hoy').textContent = fechaLarga(new Date().toISOString());
if (usuario) {
  for (const campo of ['nombres', 'apellidos', 'celular', 'correo']) form.elements[campo].value = usuario[campo] ?? '';
}

limpiarAlEscribir(form);
document.getElementById('es-menor').addEventListener('change', e => { apoderado.hidden = !e.target.checked; });

function mostrarEnviado(hoja) {
  contenido.innerHTML = `
    <div class="card reclamos-enviado" role="status">
      <span class="estado-icono" aria-hidden="true">✓</span>
      <h2>Recibimos tu ${hoja.tipo === 'QUEJA' ? 'queja' : 'reclamo'}</h2>
      <p>Te enviamos una copia de la hoja de reclamación a <b>${esc(hoja.enviadoA)}</b>.</p>
      <dl class="datos">
        <div><dt>Número de hoja</dt><dd class="texto-mono">${esc(hoja.numero)}</dd></div>
        <div><dt>Fecha</dt><dd>${esc(fechaHora(hoja.fecha))}</dd></div>
        <div><dt>Te respondemos a más tardar el</dt><dd>${esc(fechaLarga(hoja.respuestaHasta))}</dd></div>
      </dl>
      <a class="btn btn-primary" href="${url('inicio')}">Volver al inicio</a>
    </div>`;
  contenido.querySelector('a').focus();
}

form.addEventListener('submit', async e => {
  e.preventDefault();
  limpiarErrores(form);
  errorGeneral.hidden = true;
  const datos = Object.fromEntries(new FormData(form));
  datos.esMenor = form.elements.esMenor.checked;
  datos.aceptaRespuestaCorreo = form.elements.aceptaRespuestaCorreo.checked;
  enviar.disabled = true;
  enviar.textContent = 'Enviando…';
  try {
    mostrarEnviado(await reclamosService.registrar(datos));
  } catch (error) {
    enviar.disabled = false;
    enviar.textContent = 'Enviar hoja de reclamación';
    if (!mostrarErrores(form, error.campos)) {
      errorGeneral.textContent = error.message;
      errorGeneral.hidden = false;
    }
  }
});
