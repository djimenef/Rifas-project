// Página de inicio. Los datos (rifas, personas, avance) salen de RifasService.
import { listo } from '../layout.js';
import { rifasService, billeteraService } from '../services/index.js';
import { url, recurso } from '../lib/rutas.js';
import { soles, puntos } from '../lib/formato.js';
import { tarjetaRifa } from '../components/tarjeta-rifa.js';
import { montarCarrusel } from '../components/carrusel.js';
import { cuentaRegresiva, iniciarCuentas } from '../components/cuenta-regresiva.js';
import { esc } from '../lib/html.js';
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

// --- Carrusel de rifas destacadas (en el ticket) ---
const ETIQUETA_DESTACADA = { ARMANDO: 'Rifa Armándose', ABIERTA: 'Rifa Confirmada' };

function diapositiva(r, i, total) {
  const hasta = r.fechaLimiteArmado ?? r.fechaCierre;
  const fondo = r.producto.imagen
    ? `<img class="destacada-foto" src="${esc(recurso(r.producto.imagen))}" alt="">`
    : `<span class="destacada-fondo" aria-hidden="true">${r.producto.emoji}</span>`;
  return `
    <a class="destacada" href="${url('rifa', { slug: r.slug })}" role="group" aria-roledescription="diapositiva"
       aria-label="${i + 1} de ${total}: ${esc(r.producto.nombre)}">
      ${fondo}
      <small>${ETIQUETA_DESTACADA[r.estado] ?? 'Rifa destacada'} · ${esc(r.categoria)}</small>
      <h3>${esc(r.producto.nombre)}</h3>
      <span class="destacada-detalle">Precio referencial: ${soles(r.producto.precioTienda)}</span>
      <span class="destacada-detalle">👥 ${r.participantes} personas · ${r.progreso} %</span>
      ${hasta ? `
      <div class="divider"></div>
      <small>La rifa se cierra en</small>
      ${cuentaRegresiva(hasta)}` : ''}
    </a>`;
}

async function cargarDestacadas() {
  const carrusel = document.getElementById('destacadas');
  const pista = carrusel.querySelector('.carrusel-pista');
  try {
    const rifas = await rifasService.destacadas();
    if (!rifas.length) throw new Error('sin destacadas');
    pista.innerHTML = rifas.map((r, i) => diapositiva(r, i, rifas.length)).join('');
    iniciarCuentas();
    montarCarrusel(carrusel, { nombre: (i, total) => `Ver rifa destacada ${i + 1} de ${total}` });
  } catch {
    pista.querySelector('h3').textContent = 'Mira todas las rifas';
  }
}

const { usuario } = await listo;

// Límites de recarga configurados (los define el admin).
billeteraService.opcionesRecarga().then(o => { limites = o; qtyInput.min = o.minimo; qtyInput.max = o.maximo; update(); }).catch(() => {});

if (usuario?.rol === 'PARTICIPANTE') {
  const cta = document.getElementById('registro-cta');
  cta.textContent = 'Ver mis rifas';
  cta.href = url('misRifas');
}

// Rifas Confirmadas: las 3 que se cierran primero, con la foto nítida y su cuenta regresiva.
cargarSeccion(document.getElementById('rifas-confirmadas'), {
  textoCargando: 'Cargando rifas…',
  cargar: () => rifasService.listar({ estados: ['ABIERTA'] }),
  vacio: { titulo: 'No hay rifas confirmadas ahora', texto: 'Cuando una rifa llegue al 100 %, aparecerá aquí.', accion: { texto: 'Ver todas las rifas', href: url('rifas') } },
  mostrar: rifas => {
    const proximas = rifas.filter(r => r.fechaCierre).toSorted((a, b) => new Date(a.fechaCierre) - new Date(b.fechaCierre));
    document.getElementById('rifas-confirmadas').innerHTML =
      `<div class="draws">${proximas.slice(0, 3).map(r => tarjetaRifa(r, { cuenta: true })).join('')}</div>`;
    iniciarCuentas();
  },
});

cargarSeccion(document.getElementById('rifas-destacadas'), {
  textoCargando: 'Cargando rifas…',
  cargar: () => rifasService.listar({ estados: ['ARMANDO', 'ABIERTA'] }),
  vacio: { titulo: 'No hay rifas armándose ahora', texto: 'Vuelve pronto: publicamos rifas nuevas cada semana.', accion: { texto: 'Ver todas las rifas', href: url('rifas') } },
  mostrar: rifas => {
    const armando = rifas.filter(r => r.estado === 'ARMANDO');
    // Primero las que tienen foto del producto y, entre ellas, las más avanzadas.
    const vitrina = (armando.length ? armando : rifas)
      .toSorted((a, b) => !!b.producto.imagen - !!a.producto.imagen || b.progreso - a.progreso);
    document.getElementById('rifas-destacadas').innerHTML =
      `<div class="draws">${vitrina.slice(0, 6).map(r => tarjetaRifa(r)).join('')}</div>`;

    document.getElementById('stat-personas').textContent = rifas.reduce((t, r) => t + r.participantes, 0).toLocaleString('es-PE');
    document.getElementById('stat-rifas').textContent = armando.length;
  },
});

cargarDestacadas();
