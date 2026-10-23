// Detalle público de una rifa (/r/?slug=): enlace compartible, una variante por estado (README §6 y §7.4).
// Cualquiera la puede ver; para poner Chances o comprar opciones se pide sesión y luego se regresa aquí
// con ?accion=poner|comprar para abrir el modal directamente (PROMPT-FASE0, "Flujos").
import { listo } from '../layout.js';
import { rifasService } from '../services/index.js';
import { url, parametro } from '../lib/rutas.js';
import { esc } from '../lib/html.js';
import { soles, puntos, opciones, fechaHora, fechaLarga, tiempoRestante } from '../lib/formato.js';
import { barraAvance } from '../components/barra-avance.js';
import { badgeRifa } from '../components/tarjeta-rifa.js';
import { cargarSeccion } from '../components/estados.js';
import { mostrarToast } from '../components/toast.js';
import { abrirModalChances, abrirModalRetiro, listaTickets } from '../components/modal-chances.js';

const slug = parametro('slug');
const contenedor = document.getElementById('detalle');
document.getElementById('volver-listado').href = url('rifas');

const { usuario } = await listo;
const esParticipante = usuario?.rol === 'PARTICIPANTE';
const esAdmin = usuario?.rol === 'ADMIN';

// --- Textos por estado ---

/** Bloque de acción según el estado. `boton` = { modo, texto } cuando la rifa recibe Chances. */
function accionPorEstado(r) {
  const autor = r.autorApodo ? ` Propuesta por <b>${esc(r.autorApodo)}</b>.` : '';
  switch (r.estado) {
    case 'CAPTANDO': return {
      titulo: '🔥 Calentando Rifa',
      texto: `🔒 Esta rifa es privada: solo se entra por su enlace y todavía no aparece en el listado.${autor} Si junta el apoyo mínimo, pasa a <b>Armando Rifa</b>. Tus Chances quedan retenidas y solo se usan si la rifa se arma.`,
      boton: { modo: 'poner', texto: 'Poner Chances' },
    };
    case 'ARMANDO': return {
      titulo: '🍀 Armando Rifa',
      texto: 'Pon tus Chances para que esta rifa se arme. Tus Chances quedan retenidas y solo se usan si la rifa se arma. Si no se arma, vuelven completas a tu billetera.',
      boton: { modo: 'poner', texto: 'Poner Chances' },
    };
    case 'ABIERTA': return {
      titulo: '🟢 ¡Va! Rifa confirmada',
      texto: `La rifa se armó y sigue abierta${r.fechaCierre ? ` hasta el ${esc(fechaHora(r.fechaCierre))}` : ''}. Cada Chance que pongas ahora es una opción de ganar.`,
      boton: { modo: 'comprar', texto: 'Comprar opciones' },
    };
    case 'PROPUESTA': return {
      titulo: '📝 En moderación',
      texto: `Esta propuesta juntó el apoyo mínimo y el equipo la está revisando.${autor} Por ahora no recibe Chances nuevas; las que ya se pusieron siguen retenidas.`,
    };
    case 'REVISION_LINK': return {
      titulo: '🔎 Link en revisión',
      texto: 'Un administrador está validando el link del producto. Mientras tanto, esta rifa no recibe Chances.',
    };
    case 'BORRADOR': return { titulo: 'Borrador', texto: 'Esta rifa todavía no se publica. Solo la ve el equipo de administración.' };
    case 'CERRADA': return {
      titulo: '⚪ Cerrada',
      texto: 'Ya no se venden opciones. Ahora revisamos que todo esté en orden y luego publicamos la fecha del sorteo.',
    };
    case 'EN_REVISION': return {
      titulo: '🟠 En revisión',
      texto: 'Estamos revisando que el producto siga disponible, que la recaudación esté correcta y que no haya indicios de fraude. Luego publicamos la fecha del sorteo.',
    };
    case 'PROGRAMADA': return {
      titulo: `📅 Sorteo el ${esc(fechaLarga(r.fechaSorteo))}`,
      texto: `El sorteo es el ${esc(fechaHora(r.fechaSorteo))} y se transmite en vivo. Antes publicamos la huella de la lista de opciones para que cualquiera pueda verificarla.`,
    };
    case 'SORTEADA': case 'COMPRANDO': case 'EN_CAMINO': case 'ENTREGADA': return {
      titulo: `🏆 Ganador: ${esc(r.ganadorApodo ?? '—')}`,
      texto: `${r.sorteo ? `Salió la opción <b>#${r.sorteo.ticketGanador}</b>. ` : ''}El premio se compra a nombre del ganador y se entrega solo al titular del DNI de la cuenta.`,
      enlace: { href: '#transparencia', texto: 'Ver sorteo' },
    };
    case 'NO_SE_ARMO': return {
      titulo: '⚫ No se armó la Rifa',
      texto: 'No se juntaron las Chances a tiempo. Todas las Chances puestas volvieron completas a las billeteras.',
      enlace: { href: url('rifas'), texto: 'Ver otras rifas' },
    };
    case 'CANCELADA': return {
      titulo: '🔴 Cancelada',
      texto: `${r.motivo ? esc(r.motivo) + ' ' : ''}Todas las Chances se devolvieron íntegramente.`,
      enlace: { href: url('rifas'), texto: 'Ver otras rifas' },
    };
    case 'DESCARTADA': return {
      titulo: 'Propuesta descartada',
      texto: `${r.motivo ? esc(r.motivo) + ' ' : ''}Las Chances puestas volvieron a las billeteras.`,
    };
    default: return { titulo: '', texto: '' };
  }
}

function lineaTiempo(r) {
  if (['ARMANDO', 'CAPTANDO'].includes(r.estado) && r.fechaLimiteArmado) return `⏳ ${tiempoRestante(r.fechaLimiteArmado)} · hasta el ${fechaHora(r.fechaLimiteArmado)}`;
  if (r.estado === 'ABIERTA' && r.fechaCierre) return `⏳ Cierra el ${fechaHora(r.fechaCierre)}`;
  return '';
}

// --- Bloques ---

function bloqueAccion(r, a) {
  let control = '';
  if (a.boton) {
    if (esAdmin) control = `<a class="btn btn-ghost" href="${url('adminRifas', { codigo: r.codigo })}">Ver en el panel</a><p>Como administrador no puedes poner Chances.</p>`;
    else if (esParticipante) control = `<button type="button" class="btn btn-primary" data-accion="${a.boton.modo}">${a.boton.texto}</button>`;
    else control = `<a class="btn btn-primary" href="${url('login', { volver: url('rifa', { slug: r.slug, accion: a.boton.modo }) })}">${a.boton.texto}</a>
      <p>Inicia sesión o <a class="enlace" href="${url('registro', { volver: url('rifa', { slug: r.slug, accion: a.boton.modo }) })}">crea tu cuenta</a> para participar.</p>`;
  } else if (a.enlace) {
    control = `<a class="btn btn-ghost" href="${a.enlace.href}">${a.enlace.texto}</a>`;
  }
  return `
    <section class="card detalle-accion" aria-labelledby="accion-titulo">
      <h2 id="accion-titulo">${a.titulo}</h2>
      <p>${a.texto}</p>
      ${control}
      <div id="mi-participacion"></div>
    </section>`;
}

function bloqueTransparencia(r) {
  if (!r.hashLista) return '';
  return `
    <section class="card detalle-seccion" id="transparencia" aria-labelledby="transparencia-titulo">
      <h2 id="transparencia-titulo">Transparencia del sorteo</h2>
      <p>Al cerrar la rifa congelamos la lista de opciones (número y apodo) y publicamos su huella digital antes del sorteo. Así nadie puede cambiarla después.</p>
      <dl class="datos">
        <div><dt>Huella de la lista (SHA-256)</dt><dd class="texto-mono">${esc(r.hashLista)}</dd></div>
        ${r.fechaSorteo ? `<div><dt>Fecha del sorteo</dt><dd>${esc(fechaHora(r.fechaSorteo))}</dd></div>` : ''}
        ${r.sorteo ? `
        <div><dt>Semilla aleatoria</dt><dd class="texto-mono">${esc(r.sorteo.semilla)}</dd></div>
        <div><dt>Opción ganadora</dt><dd>#${r.sorteo.ticketGanador}</dd></div>
        <div><dt>Ganador</dt><dd>${esc(r.ganadorApodo ?? '—')}</dd></div>` : ''}
      </dl>
    </section>`;
}

function bloquePremio(r) {
  if (!['SORTEADA', 'COMPRANDO', 'EN_CAMINO', 'ENTREGADA'].includes(r.estado)) return '';
  const e = r.entrega ?? {};
  const pasos = [
    ['Sorteo realizado', r.sorteo?.fecha],
    ['Premio comprado', e.compradoEl],
    ['En camino', e.enviadoEl],
    ['Entregado', e.entregadoEl],
  ];
  return `
    <section class="card detalle-seccion" aria-labelledby="premio-titulo">
      <h2 id="premio-titulo">Seguimiento del premio</h2>
      <ol class="pasos-premio">
        ${pasos.map(([texto, fecha]) => `
        <li class="${fecha ? 'hecho' : ''}"><span class="ic" aria-hidden="true">${fecha ? '✓' : ''}</span>
          <span>${texto}<small>${fecha ? esc(fechaLarga(fecha)) : 'Pendiente'}</small></span></li>`).join('')}
      </ol>
    </section>`;
}

function dibujar(r) {
  document.title = `DaleChance · ${r.producto.nombre}`;
  const a = accionPorEstado(r);
  const tiempo = lineaTiempo(r);
  const secundarias = bloqueTransparencia(r) + bloquePremio(r);
  contenedor.innerHTML = `
    <div class="detalle">
      <div>
        <div class="detalle-media" aria-hidden="true"><span>${r.producto.emoji}</span></div>
        <div class="detalle-info">
          <p class="detalle-cat">${esc(r.categoria)}</p>
          <h1>${esc(r.producto.nombre)}</h1>
          <p class="detalle-precio">Precio referencial: ${soles(r.producto.precioTienda)}</p>
          <div class="detalle-estado">${badgeRifa(r)}${tiempo ? `<span class="detalle-tiempo">${esc(tiempo)}</span>` : ''}</div>
          <p class="detalle-personas">👥 ${r.participantes} personas</p>
          ${barraAvance(r.progreso)}
          <div class="detalle-pie">
            <p class="detalle-id">ID: ${esc(r.codigo)}</p>
            <button type="button" class="btn btn-ghost btn-sm" data-compartir>Compartir ↗</button>
          </div>
        </div>
      </div>
      <div class="detalle-lado">${bloqueAccion(r, a)}</div>
    </div>
    ${secundarias ? `<div class="detalle-secciones">${secundarias}</div>` : ''}`;

  contenedor.querySelector('[data-compartir]').addEventListener('click', () => compartir(r));
  contenedor.querySelector('[data-accion]')?.addEventListener('click', e => abrir(r, e.currentTarget.dataset.accion));
  if (esParticipante) mostrarParticipacion(r);
}

async function mostrarParticipacion(r) {
  const el = contenedor.querySelector('#mi-participacion');
  try {
    const p = await rifasService.miParticipacion(r.id);
    if (!p.retenido && !p.tickets.length) return;
    el.innerHTML = `
      <div class="detalle-mio">
        ${p.retenido ? `<p>Tus Chances aquí: <b>${puntos(p.retenido)}</b> (retenidas)</p>` : ''}
        ${p.tickets.length ? `<p>Tus opciones: <b>${opciones(p.tickets.length)}</b> · ${esc(listaTickets(p.tickets, 6))}</p>` : ''}
        ${p.puedeRetirar ? '<button type="button" class="enlace detalle-retirar" data-retirar>Retirar mis Chances</button>' : ''}
        <a class="enlace" href="${url('misTickets', { codigo: r.codigo })}">Ver mis tickets</a>
      </div>`;
    el.querySelector('[data-retirar]')?.addEventListener('click', () => abrirModalRetiro({ rifa: r, retenido: p.retenido, alTerminar: cargar }));
  } catch { /* sin participación visible: no se muestra el bloque */ }
}

function abrir(r, modo) {
  abrirModalChances({ rifa: r, modo, alTerminar: cargar });
}

async function compartir(r) {
  const enlace = location.origin + url('rifa', { slug: r.slug });
  try {
    await navigator.clipboard.writeText(enlace);
    mostrarToast('Enlace copiado. ¡Compártelo!');
  } catch {
    mostrarToast(`Copia este enlace: ${enlace}`, { duracion: 6000 });
  }
}

// --- Carga ---

let primeraCarga = true;
function cargar() {
  cargarSeccion(contenedor, {
    textoCargando: 'Cargando la rifa…',
    // "No encontrada" se muestra como estado vacío, no como error.
    cargar: async () => {
      if (!slug) return null;
      try { return await rifasService.obtenerPorSlug(slug); } catch (e) { if (e.codigo === 'NO_ENCONTRADA') return null; throw e; }
    },
    esVacio: r => !r,
    vacio: { icono: '🔍', titulo: 'No encontramos esta rifa', texto: 'Revisa el enlace o mira las rifas disponibles.', accion: { texto: 'Ver rifas', href: url('rifas') } },
    error: { titulo: 'No pudimos cargar la rifa' },
    mostrar: r => {
      dibujar(r);
      // Al volver del login o de recargar con ?accion=, se abre el modal una sola vez.
      const accion = parametro('accion');
      if (primeraCarga && esParticipante && accion && accionPorEstado(r).boton?.modo === accion) {
        history.replaceState(null, '', url('rifa', { slug }));
        abrir(r, accion);
      }
      primeraCarga = false;
    },
  });
}

cargar();
