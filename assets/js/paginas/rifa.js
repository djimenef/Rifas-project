// Detalle público de una rifa (/r/?slug=): enlace compartible, una variante por estado (README §6 y §7.4).
// Cualquiera la puede ver; para poner Chances o comprar opciones se pide sesión y luego se regresa aquí
// con ?accion=poner|comprar para abrir el modal directamente (PROMPT-FASE0, "Flujos").
import { listo } from '../layout.js';
import { rifasService } from '../services/index.js';
import { url, parametro, recurso } from '../lib/rutas.js';
import { esc } from '../lib/html.js';
import { soles, puntos, opciones, fechaHora, fechaLarga, tiempoRestante } from '../lib/formato.js';
import { barraAvance } from '../components/barra-avance.js';
import { badgeRifa } from '../components/tarjeta-rifa.js';
import { cargarSeccion } from '../components/estados.js';
import { mostrarToast } from '../components/toast.js';
import { descargarTexto } from '../lib/descarga.js';
import { abrirModalChances, listaTickets } from '../components/modal-chances.js';

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
      titulo: '💡 Rifa Sugerida',
      texto: `🔒 Esta rifa es privada: solo se entra por su enlace y todavía no aparece en el portal.${autor} Quien la sugirió es responsable de juntar el apoyo mínimo; al lograrlo pasa a <b>Rifa Armándose</b>. Tus Chances quedan retenidas y solo se usan si la rifa se arma.`,
      boton: { modo: 'poner', texto: 'Poner Chances' },
    };
    case 'ARMANDO': return {
      titulo: '🍀 Rifa Armándose',
      texto: `Lleva el ${r.progreso} % de lo que necesita. Al llegar al 100 % pasa a <b>Rifa Confirmada</b>. Tus Chances quedan retenidas y solo se usan si la rifa se arma; si no se arma, vuelven completas a tu billetera.`,
      boton: { modo: 'poner', texto: 'Poner Chances' },
    };
    case 'ABIERTA': return {
      titulo: '🟢 Rifa Confirmada',
      texto: `Llegó al 100 % y sigue abierta${r.fechaCierre ? ` hasta el ${esc(fechaHora(r.fechaCierre))}` : ''}${r.minutosExtra ? ` (con ${r.minutosExtra} min de tiempo extra)` : ''}. Cada Chance que pongas ahora es una opción de ganar. <b>Tiempo extra:</b> si faltan 5 minutos o menos, cada 5 personas que se unan suman 5 minutos más.`,
      boton: { modo: 'comprar', texto: 'Comprar opciones' },
    };
    case 'PROPUESTA': return {
      titulo: '🔎 Validando producto',
      texto: `Esta rifa sugerida juntó el apoyo mínimo y el equipo está validando el producto y su precio.${autor} Por ahora no recibe Chances nuevas; las que ya se pusieron siguen retenidas.`,
    };
    case 'REVISION_LINK': return {
      titulo: '🔎 Validando producto',
      texto: 'El equipo está validando el link del producto (que exista y que sea de una tienda confiable). Mientras tanto, esta rifa no recibe Chances.',
    };
    case 'BORRADOR': return { titulo: 'Borrador', texto: 'Esta rifa todavía no se publica. Solo la ve el equipo de administración.' };
    case 'CERRADA': case 'EN_REVISION': return {
      titulo: '⏳ Rifa Cerrada · Por rifar',
      texto: 'Se acabó el tiempo: ya nadie puede poner más Chances. Estamos validando que el producto siga disponible y que todo esté en orden; luego anunciamos la fecha en que se rifa.',
    };
    case 'PROGRAMADA': return {
      titulo: `📅 Rifa Cerrada · se rifa el ${esc(fechaLarga(r.fechaSorteo))}`,
      texto: `Rifa en vivo: ${esc(fechaHora(r.fechaSorteo))}. Ya publicamos la lista de opciones y su huella para que cualquiera pueda verificarla.`,
    };
    case 'SORTEADA': case 'COMPRANDO': case 'EN_CAMINO': return {
      titulo: `🏆 Rifa Realizada · Ganador: ${esc(r.ganadorApodo ?? '—')}`,
      texto: `${r.sorteo ? `Salió la opción <b>#${r.sorteo.ticketGanador}</b>. ` : ''}Ahora compramos el premio a nombre del ganador; se entrega solo al titular del DNI de la cuenta.`,
      enlace: { href: '#transparencia', texto: 'Ver cómo se eligió al ganador' },
    };
    case 'ENTREGADA': return {
      titulo: `✅ Premio Entregado · Ganador: ${esc(r.ganadorApodo ?? '—')}`,
      texto: `${r.sorteo ? `Salió la opción <b>#${r.sorteo.ticketGanador}</b>. ` : ''}El premio ya se entregó al titular del DNI de la cuenta ganadora.`,
      enlace: { href: '#transparencia', texto: 'Ver cómo se eligió al ganador' },
    };
    case 'NO_SE_ARMO': return {
      titulo: '⚫ Rifa Descartada',
      texto: 'No llegó al 100 % a tiempo. Todas las Chances puestas volvieron completas a las billeteras.',
      enlace: { href: url('rifas'), texto: 'Ver otras rifas' },
    };
    case 'CANCELADA': return {
      titulo: '⚫ Rifa Descartada',
      texto: `${r.motivo ? esc(r.motivo) + ' ' : ''}Todas las Chances se devolvieron íntegramente.`,
      enlace: { href: url('rifas'), texto: 'Ver otras rifas' },
    };
    case 'DESCARTADA': return {
      titulo: '⚫ Rifa Descartada',
      texto: `${r.motivo ? esc(r.motivo) + ' ' : ''}Las Chances puestas volvieron a las billeteras.`,
    };
    default: return { titulo: '', texto: '' };
  }
}

function lineaTiempo(r) {
  if (['ARMANDO', 'CAPTANDO'].includes(r.estado) && r.fechaLimiteArmado) return `⏳ ${tiempoRestante(r.fechaLimiteArmado)} · hasta el ${fechaHora(r.fechaLimiteArmado)}`;
  if (r.estado === 'ABIERTA' && r.fechaCierre) return `⏳ Cierra el ${fechaHora(r.fechaCierre)}${r.minutosExtra ? ` · +${r.minutosExtra} min de tiempo extra` : ''}`;
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
      <h2 id="transparencia-titulo">Transparencia: cómo se elige al ganador</h2>
      <p>Cada Chance puesta es una opción con su número: si pusiste 10 Chances, tienes 10 opciones de ganar. Al cerrar la rifa congelamos la lista de opciones y publicamos su huella digital antes de rifarla. Así nadie puede cambiarla después.</p>
      <p>La lista tiene el número y el código de cada opción, <b>sin datos de quién es</b>. Tú ves los códigos de tus opciones en "Mis tickets" y puedes comprobar que están en la lista.</p>
      <p>Para elegir al ganador, mezclamos todas las opciones al azar, así las de una misma persona no quedan juntas, y elegimos una de la lista mezclada. La mezcla y la elección salen de la semilla aleatoria y de la huella: con esos dos datos cualquiera puede repetirlas y obtener el mismo resultado.</p>
      <dl class="datos">
        <div><dt>Huella de la lista (SHA-256)</dt><dd class="texto-mono">${esc(r.hashLista)}</dd></div>
        ${r.fechaSorteo ? `<div><dt>Fecha en que se rifa</dt><dd>${esc(fechaHora(r.fechaSorteo))}</dd></div>` : ''}
        ${r.sorteo ? `
        <div><dt>Semilla aleatoria</dt><dd class="texto-mono">${esc(r.sorteo.semilla)}</dd></div>
        <div><dt>Opción ganadora</dt><dd>#${r.sorteo.ticketGanador}</dd></div>
        ${r.sorteo.posicion ? `<div><dt>Posición en la lista mezclada</dt><dd>${r.sorteo.posicion} de ${r.sorteo.totalOpciones}</dd></div>` : ''}
        <div><dt>Ganador</dt><dd>${esc(r.ganadorApodo ?? '—')}</dd></div>` : ''}
      </dl>
      <div class="detalle-lista-acciones">
        <button type="button" class="btn btn-ghost btn-sm" data-lista>Descargar lista de opciones (CSV)</button>
      </div>
    </section>`;
}

async function descargarLista(r) {
  try {
    const lista = await rifasService.listaOpciones(r.codigo);
    descargarTexto(lista.nombreArchivo, lista.csv);
  } catch (e) {
    mostrarToast(e.message, { tipo: 'error' });
  }
}

function bloquePremio(r) {
  if (!['SORTEADA', 'COMPRANDO', 'EN_CAMINO', 'ENTREGADA'].includes(r.estado)) return '';
  const e = r.entrega ?? {};
  const pasos = [
    ['Rifa realizada', r.sorteo?.fecha],
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
        ${r.producto.imagen
          ? `<div class="detalle-media detalle-foto"><img src="${esc(recurso(r.producto.imagen))}" alt="${esc(r.producto.nombre)}"></div>`
          : `<div class="detalle-media" aria-hidden="true"><span>${r.producto.emoji}</span></div>`}
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
          ${r.producto.descripcion ? `
          <section class="detalle-descripcion" aria-labelledby="descripcion-titulo">
            <h2 id="descripcion-titulo">Descripción del producto</h2>
            <p>${esc(r.producto.descripcion)}</p>
            <p class="detalle-fuente">Información referencial tomada de la tienda. El premio puede ser este producto o uno equivalente de igual o mayor valor.</p>
          </section>` : ''}
        </div>
      </div>
      <div class="detalle-lado">${bloqueAccion(r, a)}</div>
    </div>
    ${secundarias ? `<div class="detalle-secciones">${secundarias}</div>` : ''}`;

  contenedor.querySelector('[data-compartir]').addEventListener('click', () => compartir(r));
  contenedor.querySelector('[data-lista]')?.addEventListener('click', () => descargarLista(r));
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
        <a class="enlace" href="${url('misTickets', { codigo: r.codigo })}">Ver mis tickets</a>
      </div>`;
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
