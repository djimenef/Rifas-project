// Página de inicio. Los datos (rifas, personas, avance) salen de RifasService.
import { listo } from '../layout.js';
import { rifasService } from '../services/index.js';
import { url } from '../lib/rutas.js';
import { esc } from '../lib/html.js';
import { soles, puntos } from '../lib/formato.js';
import { barraAvance } from '../components/barra-avance.js';
import { badgeEstado } from '../components/badge.js';
import { cargarSeccion } from '../components/estados.js';

const PRECIO_PUNTO = 1;
const PAQUETES = [5, 10, 15, 20];
const qtyInput = document.getElementById('qty');
const packs = [...document.querySelectorAll('.pack')];
const list = document.getElementById('unlock-list');
const recargarCta = document.getElementById('recargar-cta');

// --- Calculadora de recarga: solo paquetes de 5, 10, 15 y 20 puntos ---
function update() {
  const pedido = parseInt(qtyInput.value) || PAQUETES[1];
  const q = PAQUETES.reduce((a, b) => (Math.abs(b - pedido) < Math.abs(a - pedido) ? b : a));
  qtyInput.value = q;
  document.getElementById('sum-qty').textContent = q;
  document.getElementById('sum-total').textContent = soles(q * PRECIO_PUNTO, true);
  packs.forEach(p => p.classList.toggle('active', +p.dataset.qty === q));
  recargarCta.textContent = `Recargar ${puntos(q)}`;
  recargarCta.href = url('recargar', { paquete: `p${q}` });
  list.innerHTML = [
    `${q} opciones para poner en las rifas que se están armando`,
    'Puedes repartirlos entre varias rifas',
    'Si la Chance no se arma, vuelven a tu billetera',
  ].map(texto => `<li class="on"><span class="ic">✓</span>${texto}</li>`).join('');
}

const paso = direccion => {
  const i = PAQUETES.indexOf(+qtyInput.value);
  qtyInput.value = PAQUETES[Math.max(0, Math.min(PAQUETES.length - 1, i + direccion))];
  update();
};
packs.forEach(p => p.addEventListener('click', () => { qtyInput.value = p.dataset.qty; update(); }));
document.getElementById('minus').onclick = () => paso(-1);
document.getElementById('plus').onclick = () => paso(1);
qtyInput.addEventListener('change', update);
update();

// --- Cuenta regresiva hasta el cierre de la rifa destacada ---
const pad = n => String(n).padStart(2, '0');
function iniciarCuentaRegresiva(fechaIso) {
  const objetivo = new Date(fechaIso);
  function tick() {
    let s = Math.max(0, Math.floor((objetivo - new Date()) / 1000));
    document.getElementById('cd-d').textContent = pad(Math.floor(s / 86400)); s %= 86400;
    document.getElementById('cd-h').textContent = pad(Math.floor(s / 3600)); s %= 3600;
    document.getElementById('cd-m').textContent = pad(Math.floor(s / 60));
    document.getElementById('cd-s').textContent = pad(s % 60);
  }
  tick(); setInterval(tick, 1000);
}

const tarjetaRifa = r => `
  <article class="draw">
    <div class="draw-img" aria-hidden="true">${r.producto.emoji}</div>
    <div class="draw-body">
      <h3><a href="${url('rifa', { slug: r.slug })}">${esc(r.producto.nombre)}</a></h3>
      <p>${esc(r.categoria)} · Precio en tienda: ${soles(r.producto.precioTienda)}</p>
      ${barraAvance(r.progreso)}
      <div class="req"><span>👥 ${r.participantes} personas</span>${badgeEstado(r.estado)}</div>
    </div>
  </article>`;

const { usuario } = await listo;

if (usuario?.rol === 'PARTICIPANTE') {
  const cta = document.getElementById('registro-cta');
  cta.textContent = 'Ver mis rifas';
  cta.href = url('misRifas');
}

cargarSeccion(document.getElementById('rifas-destacadas'), {
  textoCargando: 'Cargando rifas…',
  cargar: () => rifasService.listar({ estados: ['ARMANDO', 'ABIERTA'] }),
  vacio: { titulo: 'No hay rifas armándose ahora', texto: 'Vuelve pronto: publicamos rifas nuevas cada semana.', accion: { texto: 'Ver todas las rifas', href: url('rifas') } },
  mostrar: rifas => {
    const armando = rifas.filter(r => r.estado === 'ARMANDO');
    document.getElementById('rifas-destacadas').innerHTML =
      `<div class="draws">${(armando.length ? armando : rifas).slice(0, 3).map(tarjetaRifa).join('')}</div>`;

    document.getElementById('stat-personas').textContent = rifas.reduce((t, r) => t + r.participantes, 0).toLocaleString('es-PE');
    document.getElementById('stat-rifas').textContent = armando.length;

    // Rifa destacada: la de mayor precio que se está armando.
    const destacada = [...armando].sort((a, b) => b.producto.precioTienda - a.producto.precioTienda)[0];
    if (destacada) {
      document.getElementById('destacada-etiqueta').textContent = `Armando la Chance · ${destacada.categoria}`;
      const enlace = document.getElementById('destacada-enlace');
      enlace.textContent = destacada.producto.nombre;
      enlace.href = url('rifa', { slug: destacada.slug });
      document.getElementById('destacada-detalle').textContent =
        `Precio en tienda: ${soles(destacada.producto.precioTienda)} · ${destacada.participantes} personas · ${destacada.progreso} %`;
      iniciarCuentaRegresiva(destacada.fechaLimiteArmado);
    }
  },
});
