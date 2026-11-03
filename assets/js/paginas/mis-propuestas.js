// Mis rifas propuestas (/mis-propuestas), Fase 2: las rifas que sugirió el participante, con un bloque por estado.
// - Rifa Sugerida (CAPTANDO): privada; enlace para compartir y avance hacia el apoyo mínimo (umbral de visibilidad).
// - Validando producto (REVISION_LINK, PROPUESTA) · pública (Rifa Armándose en adelante) · no se armó · descartada.
// Como en el resto del sitio, el avance se muestra en % y personas, nunca en montos (el umbral es interno).
import { listo } from '../layout.js';
import { rifasService } from '../services/index.js';
import { url, recurso, enlazarRutas } from '../lib/rutas.js';
import { esc } from '../lib/html.js';
import { fechaHora, tiempoRestante } from '../lib/formato.js';
import { barraAvance } from '../components/barra-avance.js';
import { badgeRifa } from '../components/tarjeta-rifa.js';
import { cargarSeccion } from '../components/estados.js';
import { enlaceRifa, compartirRifa } from '../components/compartir.js';
import { ESTADOS_CONFIRMADOS } from '../domain/rifa.js';

const seccion = document.getElementById('propuestas');
enlazarRutas();
const { permitido } = await listo;

const personas = n => `👥 ${n.toLocaleString('es-PE')} ${n === 1 ? 'persona' : 'personas'}`;

/** Enlace para compartir con su botón de copiar. */
const compartir = (r, texto) => `
  <div class="propuesta-compartir">
    <p>${texto}</p>
    <div class="propuesta-enlace">
      <span class="texto-mono">${esc(enlaceRifa(r))}</span>
      <button type="button" class="btn btn-primary btn-sm" data-copiar="${esc(r.id)}">Copiar enlace</button>
    </div>
  </div>`;

/** Bloque propio de cada estado. */
function bloque({ rifa: r, avanceUmbral, faltanParticipantes }) {
  switch (r.estado) {
    case 'CAPTANDO': return `
      <p class="propuesta-texto">🔒 Es privada: solo se entra por su enlace. Junta el apoyo mínimo para que el equipo la valide y pase a <b>Rifa Armándose</b>.</p>
      <div class="propuesta-avance">
        <p class="propuesta-etiqueta">Avance hacia el apoyo mínimo</p>
        ${barraAvance(avanceUmbral)}
        <p class="propuesta-meta">${personas(r.participantes)}${faltanParticipantes ? ` · faltan al menos ${faltanParticipantes} ${faltanParticipantes === 1 ? 'persona' : 'personas'} más` : ''}</p>
        ${r.fechaLimiteArmado ? `<p class="propuesta-meta">⏳ ${esc(tiempoRestante(r.fechaLimiteArmado))} · hasta el ${esc(fechaHora(r.fechaLimiteArmado))}</p>` : ''}
      </div>
      ${compartir(r, 'Comparte este enlace con tu comunidad:')}`;
    case 'REVISION_LINK': return `
      <p class="propuesta-texto">El equipo está validando el link del producto (que exista y que sea de una tienda confiable). Mientras tanto no recibe Chances; cuando pase a <b>Rifa Sugerida</b> podrás compartirla.</p>`;
    case 'PROPUESTA': return `
      <p class="propuesta-texto">🎉 ¡Juntaste el apoyo mínimo! El equipo está validando el producto y el precio. Ya no recibe Chances nuevas; las que se pusieron siguen retenidas.</p>
      <p class="propuesta-meta">${personas(r.participantes)}</p>`;
    case 'NO_SE_ARMO': return `
      <p class="propuesta-texto">No juntó el apoyo a tiempo. Todas las Chances volvieron completas a las billeteras.</p>`;
    case 'DESCARTADA': case 'CANCELADA': return `
      <p class="propuesta-texto">${r.motivo ? `Motivo: ${esc(r.motivo)} ` : ''}Todas las Chances volvieron completas a las billeteras.</p>`;
    default: return `
      <p class="propuesta-texto">${ESTADOS_CONFIRMADOS.includes(r.estado) ? '🟢 ¡Tu rifa se armó!' : '🍀 Tu rifa ya está en el portal.'} Sigue compartiéndola para que más personas se unan.</p>
      ${barraAvance(r.progreso)}
      <p class="propuesta-meta">${personas(r.participantes)}</p>
      ${['ARMANDO', 'ABIERTA'].includes(r.estado) ? compartir(r, 'Su enlace:') : ''}`;
  }
}

function tarjeta(p) {
  const r = p.rifa;
  // Hasta Rifa Armándose el producto se ve desenfocado, igual que en la tarjeta de rifa.
  const velada = ESTADOS_CONFIRMADOS.includes(r.estado) ? '' : ' propuesta-velada';
  return `
    <article class="card propuesta" aria-labelledby="propuesta-${esc(r.id)}">
      <div class="propuesta-cabecera">
        ${r.producto.imagen
          ? `<img class="propuesta-imagen${velada}" src="${esc(recurso(r.producto.imagen))}" alt="" loading="lazy">`
          : `<span class="propuesta-imagen${velada}" aria-hidden="true">${r.producto.emoji}</span>`}
        <div class="propuesta-datos">
          <h2 id="propuesta-${esc(r.id)}"><a href="${url('rifa', { slug: r.slug })}">${esc(r.producto.nombre)}</a></h2>
          <p>${badgeRifa(r)}</p>
          <p class="propuesta-id">ID: ${esc(r.codigo)} · Tu código de autor: ${esc(p.codigoAutor)}</p>
        </div>
      </div>
      ${bloque(p)}
    </article>`;
}

if (permitido) {
  cargarSeccion(seccion, {
    textoCargando: 'Cargando tus propuestas…',
    cargar: () => rifasService.misPropuestas(),
    vacio: { icono: '💡', titulo: 'Todavía no propones ninguna rifa', texto: 'Pega el link de un producto que te gustaría que se rife y compártelo con tu comunidad.', accion: { texto: 'Proponer rifa', href: url('crearRifa') } },
    error: { titulo: 'No pudimos cargar tus propuestas' },
    mostrar: lista => {
      seccion.innerHTML = `<div class="propuestas">${lista.map(tarjeta).join('')}</div>`;
      seccion.querySelectorAll('[data-copiar]').forEach(b => b.addEventListener('click', () =>
        compartirRifa(lista.find(p => p.rifa.id === b.dataset.copiar).rifa)));
    },
  });
}
