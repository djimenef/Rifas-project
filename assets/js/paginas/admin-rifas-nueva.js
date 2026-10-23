// Admin · Nueva rifa (/admin/rifas/nueva): crea la rifa en BORRADOR con su configuración (README §7.9).
// AdminService valida los datos; aquí se muestran sus errores junto a cada campo.
import { listo } from '../layout.js';
import { adminService } from '../services/index.js';
import { url } from '../lib/rutas.js';
import { esc } from '../lib/html.js';
import { soles, puntos } from '../lib/formato.js';
import { CONFIG_POR_DEFECTO, calcularMeta } from '../domain/rifa.js';

const form = document.getElementById('form');
const enviar = document.getElementById('enviar');
const errorGeneral = document.getElementById('form-error');
const meta = document.getElementById('meta');
document.getElementById('volver').href = url('adminRifas');
document.getElementById('cancelar').href = url('adminRifas');

const CAMPOS_CONFIG = ['margenPct', 'ventanaArmadoDias', 'tiempoAbiertaDias', 'maxPorParticipantePct', 'minPorParticipante'];
CAMPOS_CONFIG.forEach(c => { form.elements[c].value = CONFIG_POR_DEFECTO[c]; });
form.permiteRetiro.checked = CONFIG_POR_DEFECTO.permiteRetiro;

const { permitido } = await listo;

function limpiarError(campo) {
  campo.removeAttribute('aria-invalid');
  campo.removeAttribute('aria-describedby');
  campo.closest('label')?.querySelector('.field-error')?.remove();
}

function mostrarError(nombre, mensaje) {
  const campo = form.elements[nombre];
  if (!campo) return false;
  limpiarError(campo);
  const span = document.createElement('span');
  span.className = 'field-error';
  span.id = `error-${nombre}`;
  span.textContent = mensaje;
  campo.closest('label').appendChild(span);
  campo.setAttribute('aria-invalid', 'true');
  campo.setAttribute('aria-describedby', span.id);
  return true;
}

/** Vista previa de la meta (precio + margen). El público nunca la ve. */
function actualizarMeta() {
  const precio = Number(form.precioTienda.value);
  const margen = Number(form.margenPct.value);
  meta.querySelector('span:last-child').innerHTML = precio > 0 && margen >= 0
    ? `Meta interna: <b>${puntos(calcularMeta(precio, margen))}</b> (precio ${soles(precio)} + ${margen} % de margen). El público no la ve.`
    : 'Ingresa el precio para calcular la meta.';
}

if (permitido) {
  try {
    const categorias = await adminService.listarCategorias();
    form.categoriaId.insertAdjacentHTML('beforeend', categorias.filter(c => c.activa)
      .map(c => `<option value="${esc(c.id)}">${c.icono} ${esc(c.nombre)}</option>`).join(''));
  } catch { /* el servicio validará la categoría al enviar */ }

  form.addEventListener('input', e => {
    if (e.target.name) limpiarError(e.target);
    if (['precioTienda', 'margenPct'].includes(e.target.name)) actualizarMeta();
  });

  form.addEventListener('submit', async e => {
    e.preventDefault();
    [...form.elements].forEach(c => c.name && limpiarError(c));
    errorGeneral.hidden = true;

    // Validación de formato de la configuración; las reglas de la rifa las aplica el servicio.
    const config = { permiteRetiro: form.permiteRetiro.checked };
    let invalido = false;
    for (const c of CAMPOS_CONFIG) {
      const n = Number(form.elements[c].value);
      if (!Number.isInteger(n) || n < 0) { mostrarError(c, 'Ingresa un número entero.'); invalido = true; } else config[c] = n;
    }
    const tope = form.topeTickets.value.trim();
    if (tope && !(Number.isInteger(Number(tope)) && Number(tope) > 0)) { mostrarError('topeTickets', 'Déjalo vacío o ingresa un número mayor a 0.'); invalido = true; }
    config.topeTickets = tope ? Number(tope) : null;
    if (invalido) return form.querySelector('[aria-invalid="true"]')?.focus();

    enviar.disabled = true;
    enviar.textContent = 'Creando…';
    try {
      const rifa = await adminService.crearRifa({
        nombre: form.nombre.value, precioTienda: Number(form.precioTienda.value), link: form.link.value.trim(),
        categoriaId: form.categoriaId.value, emoji: form.emoji.value.trim() || undefined, config,
      });
      location.href = url('adminRifas', { codigo: rifa.codigo });
    } catch (error) {
      enviar.disabled = false;
      enviar.textContent = 'Crear borrador';
      const mostrados = Object.entries(error.campos ?? {}).filter(([n, m]) => mostrarError(n, m));
      if (!mostrados.length) { errorGeneral.textContent = error.message; errorGeneral.hidden = false; }
      form.querySelector('[aria-invalid="true"]')?.focus();
    }
  });
}
