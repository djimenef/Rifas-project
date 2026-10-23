// Recargar Chances (/billetera/recargar): atajos 5/10/15/20 o monto libre de 5 a 500 (aviso junto al campo),
// medio de pago simulado, procesando, éxito y rechazado.
// Lee ?cantidad= (lo manda Inicio o el modal de una rifa) y ?volver= (tras el éxito, regresa a esa rifa).
import { listo } from '../layout.js';
import { billeteraService, nuevaClaveIdempotencia } from '../services/index.js';
import { url, parametro, destinoVolver } from '../lib/rutas.js';
import { esc } from '../lib/html.js';
import { soles, puntos } from '../lib/formato.js';
import { estadoError } from '../components/estados.js';
import { mostrarToast } from '../components/toast.js';
import { actualizarSaldo } from '../components/header.js';

const PRECIO_PUNTO = 1;   // 1 Chance = S/ 1
let limites = { minimo: 5, maximo: 500 };
let paquetes = [];

const form = document.getElementById('form');
const packs = document.getElementById('packs');
const input = document.getElementById('cantidad');
const aviso = document.getElementById('cantidad-aviso');
const resumen = document.getElementById('resumen');
const resumenOriginal = resumen.innerHTML;
const volver = parametro('volver');

const enlaceVolver = document.getElementById('volver');
enlaceVolver.href = volver ? destinoVolver() : url('billetera');
if (volver) enlaceVolver.textContent = '← Volver a la rifa';

const { permitido } = await listo;

function mostrarAviso(texto) {
  aviso.textContent = texto;
  aviso.hidden = !texto;
  input.toggleAttribute('aria-invalid', !!texto);
}

/** Cantidad actual dentro de los límites. Con `ajustar`, corrige el campo y avisa si estaba fuera del rango. */
function actualizar({ ajustar = true } = {}) {
  let q = Math.round(Number(input.value));
  if (!Number.isFinite(q) || input.value === '') q = limites.minimo;
  if (ajustar) {
    if (q < limites.minimo) { q = limites.minimo; mostrarAviso(`Mínimo ${limites.minimo} Chances`); }
    else if (q > limites.maximo) { q = limites.maximo; mostrarAviso(`Máximo ${limites.maximo} Chances por recarga`); }
    else mostrarAviso('');
    input.value = q;
  } else if (q < limites.minimo || q > limites.maximo) {
    return;   // mientras escribe, no corrige
  }
  packs.querySelectorAll('.pack').forEach(p => p.classList.toggle('active', +p.dataset.qty === q));
  document.getElementById('res-cantidad').textContent = q;
  document.getElementById('res-total').textContent = soles(q * PRECIO_PUNTO, true);
  document.getElementById('pagar').textContent = `Pagar ${soles(q * PRECIO_PUNTO, true)}`;
}

function activarResumen() {
  resumen.innerHTML = resumenOriginal;
  actualizar();
}

function procesando(q) {
  resumen.innerHTML = `
    <div class="recarga-resultado" role="status">
      <span class="spinner" aria-hidden="true"></span>
      <h2>Procesando tu pago…</h2>
      <p>Estamos confirmando tu pago de ${soles(q * PRECIO_PUNTO, true)}. No cierres esta página.</p>
    </div>`;
}

function exito(c) {
  const destino = volver ? destinoVolver() : url('billetera');
  resumen.innerHTML = `
    <div class="recarga-resultado" role="status">
      <span class="estado-icono" aria-hidden="true">✓</span>
      <h2>¡Recarga exitosa!</h2>
      <p>Sumamos ${puntos(c.cantidad)} a tu saldo disponible.</p>
      <dl class="datos">
        <div><dt>Disponible ahora</dt><dd>${puntos(c.disponibleDespues)}</dd></div>
        <div><dt>N.º de operación</dt><dd class="texto-mono">${esc(c.numeroOperacion)}</dd></div>
      </dl>
      <a class="btn btn-primary" href="${esc(destino)}">${volver ? 'Volver a la rifa' : 'Ver mi billetera'}</a>
      ${volver ? '' : `<a class="btn btn-ghost" href="${url('rifas')}">Ver rifas</a>`}
    </div>`;
  resumen.querySelector('.btn').focus();
}

function rechazado(mensaje) {
  resumen.innerHTML = `${estadoError({ titulo: 'Pago rechazado', texto: mensaje, reintentar: 'Intentar de nuevo' })}`;
  resumen.querySelector('[data-reintentar]').addEventListener('click', () => {
    activarResumen();
    form.querySelector('input[name="medioPago"]:checked').focus();
  });
  resumen.querySelector('[data-reintentar]').focus();
}

if (permitido) {
  try {
    const o = await billeteraService.opcionesRecarga();
    limites = { minimo: o.minimo, maximo: o.maximo };
    paquetes = o.paquetes;
  } catch { paquetes = [5, 10, 15, 20].map(n => ({ id: 'p' + n, puntos: n, precio: n })); }

  packs.innerHTML = paquetes.map(p => `<button type="button" class="pack" data-qty="${p.puntos}"><b>${p.puntos}</b><span>${soles(p.precio)}</span></button>`).join('');
  input.min = limites.minimo;
  input.max = limites.maximo;
  const pedida = Math.round(Number(parametro('cantidad')));
  input.value = Number.isFinite(pedida) && pedida > 0 ? pedida : 10;
  actualizar();

  packs.addEventListener('click', e => {
    const p = e.target.closest('.pack');
    if (p) { input.value = p.dataset.qty; actualizar(); }
  });
  document.getElementById('menos').addEventListener('click', () => { input.value = +input.value - 1; actualizar(); });
  document.getElementById('mas').addEventListener('click', () => { input.value = +input.value + 1; actualizar(); });
  input.addEventListener('input', () => actualizar({ ajustar: false }));
  input.addEventListener('change', () => actualizar());

  form.addEventListener('submit', async e => {
    e.preventDefault();
    actualizar();
    const q = Number(input.value);
    const paquete = paquetes.find(p => p.puntos === q);
    const medioPago = form.medioPago.value;
    const clave = nuevaClaveIdempotencia();      // una por intento de pago
    procesando(q);
    try {
      const c = await billeteraService.recargar(paquete ? paquete.id : q, {
        medioPago, claveIdempotencia: clave, simularRechazo: document.getElementById('simular-rechazo').checked,
      });
      exito(c);
      mostrarToast(`¡Listo! Recargaste ${puntos(c.cantidad)}`);
      actualizarSaldo();
    } catch (error) {
      rechazado(error.message);
    }
  });
}
