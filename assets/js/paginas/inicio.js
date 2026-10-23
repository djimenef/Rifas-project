// Página de inicio. Los datos (rifas, personas, avance) salen de RifasService.
import { listo } from '../layout.js';
import { rifasService, billeteraService } from '../services/index.js';
import { url } from '../lib/rutas.js';
import { soles, puntos } from '../lib/formato.js';
import { tarjetaRifa } from '../components/tarjeta-rifa.js';
import { cargarSeccion } from '../components/estados.js';

const PRECIO_PUNTO = 1;                      // 1 Chance = S/ 1
let limites = { minimo: 5, maximo: 500 };    // se reemplazan por los de BilleteraService.opcionesRecarga()
const qtyInput = document.getElementById('qty');
const aviso = document.getElementById('qty-aviso');
const packs = [...document.querySelectorAll('.pack')];
const list = document.getElementById('unlock-list');
const recargarCta = document.getElementById('recargar-cta');

// --- Calculadora de recarga: atajos de 5, 10, 15 y 20, o cualquier cantidad entera dentro de los límites ---
function mostrarAviso(texto) {
  aviso.textContent = texto;
  aviso.hidden = !texto;
}

function update({ ajustar = true } = {}) {
  let q = Math.round(Number(qtyInput.value));
  if (!Number.isFinite(q) || qtyInput.value === '') q = limites.minimo;
  if (ajustar) {
    if (q < limites.minimo) { q = limites.minimo; mostrarAviso(`Mínimo ${limites.minimo} Chances`); }
    else if (q > limites.maximo) { q = limites.maximo; mostrarAviso(`Máximo ${limites.maximo} Chances por recarga`); }
    else mostrarAviso('');
    qtyInput.value = q;
  } else if (q < limites.minimo || q > limites.maximo) {
    return;   // mientras escribe, no corrige: espera a que termine
  }
  document.getElementById('sum-qty').textContent = q;
  document.getElementById('sum-total').textContent = soles(q * PRECIO_PUNTO, true);
  packs.forEach(p => p.classList.toggle('active', +p.dataset.qty === q));   // solo se marca si coincide
  recargarCta.textContent = `Recargar ${puntos(q)}`;
  recargarCta.href = url('recargar', { cantidad: q });
  list.innerHTML = [
    `${q} ${q === 1 ? 'opción' : 'opciones'} de ganar para poner en las rifas que se están armando`,
    'Puedes repartirlas entre varias rifas',
    'Si la rifa no se arma, vuelven a tu billetera',
  ].map(texto => `<li class="on"><span class="ic">✓</span>${texto}</li>`).join('');
}

packs.forEach(p => p.addEventListener('click', () => { qtyInput.value = p.dataset.qty; update(); }));
document.getElementById('minus').onclick = () => { qtyInput.value = +qtyInput.value - 1; update(); };
document.getElementById('plus').onclick = () => { qtyInput.value = +qtyInput.value + 1; update(); };
qtyInput.addEventListener('input', () => update({ ajustar: false }));
qtyInput.addEventListener('change', () => update());
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

const { usuario } = await listo;

// Límites de recarga configurados (los define el admin).
billeteraService.opcionesRecarga().then(o => { limites = o; qtyInput.min = o.minimo; qtyInput.max = o.maximo; update(); }).catch(() => {});

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
      `<div class="draws">${(armando.length ? armando : rifas).slice(0, 3).map(r => tarjetaRifa(r)).join('')}</div>`;

    document.getElementById('stat-personas').textContent = rifas.reduce((t, r) => t + r.participantes, 0).toLocaleString('es-PE');
    document.getElementById('stat-rifas').textContent = armando.length;

    // Rifa destacada: la de mayor precio que se está armando.
    const destacada = [...armando].sort((a, b) => b.producto.precioTienda - a.producto.precioTienda)[0];
    if (destacada) {
      document.getElementById('destacada-etiqueta').textContent = `Armando Rifa · ${destacada.categoria}`;
      const enlace = document.getElementById('destacada-enlace');
      enlace.textContent = destacada.producto.nombre;
      enlace.href = url('rifa', { slug: destacada.slug });
      document.getElementById('destacada-detalle').textContent =
        `Precio referencial: ${soles(destacada.producto.precioTienda)} · ${destacada.participantes} personas · ${destacada.progreso} %`;
      iniciarCuentaRegresiva(destacada.fechaLimiteArmado);
    }
  },
});
