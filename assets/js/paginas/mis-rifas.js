// Mis rifas (/mis-rifas): pestañas Armando · Abiertas · Finalizadas (?pestana=).
// El agrupado lo hace RifasService.misRifas (GRUPOS_MIS_RIFAS del dominio).
import { listo } from '../layout.js';
import { rifasService } from '../services/index.js';
import { url, parametro } from '../lib/rutas.js';
import { puntos, opciones } from '../lib/formato.js';
import { tarjetaRifa } from '../components/tarjeta-rifa.js';
import { tabs, montarTabs } from '../components/tabs.js';
import { cargarSeccion, estadoVacio } from '../components/estados.js';

const PESTANAS = [
  { id: 'armando', grupo: 'ARMANDO', texto: 'Armando',
    ayuda: 'Rifas que todavía se están armando. Tus Chances están retenidas y solo se usan si la rifa se arma.',
    vacio: { icono: '🍀', titulo: 'No tienes Chances en rifas que se están armando', texto: 'Elige una rifa y pon tus Chances para ayudar a que se arme.', accion: { texto: 'Ver rifas', href: url('rifas') } } },
  { id: 'abiertas', grupo: 'ABIERTAS', texto: 'Abiertas',
    ayuda: 'Rifas Confirmadas y Cerradas: tus Chances ya son opciones de ganar y esperan a ser rifadas.',
    vacio: { icono: '🎟️', titulo: 'Aún no tienes opciones en rifas confirmadas', texto: 'Cuando una de tus rifas se arme, o compres opciones en una rifa abierta, aparecerá aquí.' } },
  { id: 'finalizadas', grupo: 'FINALIZADAS', texto: 'Finalizadas',
    ayuda: 'Rifas Realizadas, con Premio Entregado o Descartadas.',
    vacio: { icono: '🏁', titulo: 'Todavía no tienes rifas finalizadas', texto: 'Aquí verás tus rifas realizadas y las descartadas.' } },
];

const seccion = document.getElementById('mis-rifas');
const { permitido } = await listo;

function mio({ rifa, retenido, tickets }) {
  if (['NO_SE_ARMO', 'CANCELADA', 'DESCARTADA'].includes(rifa.estado)) return 'Tus Chances volvieron a tu billetera.';
  if (retenido) return `Tus Chances aquí: ${puntos(retenido)} (retenidas)`;
  if (tickets.length) return `Tus opciones: ${opciones(tickets.length)}`;
  return '';
}

function tarjeta(item) {
  const pie = item.tickets.length
    ? `<a class="btn btn-ghost btn-sm" href="${url('misTickets', { codigo: item.rifa.codigo })}">Ver mis tickets</a>`
    : '';
  return tarjetaRifa(item.rifa, { detalle: true, mio: mio(item), pie });
}

function panel(p, items) {
  if (!items.length) return estadoVacio(p.vacio);
  return `<p class="mis-pestana-texto">${p.ayuda}</p><div class="draws">${items.map(tarjeta).join('')}</div>`;
}

if (permitido) {
  cargarSeccion(seccion, {
    textoCargando: 'Cargando tus rifas…',
    cargar: () => rifasService.misRifas(),
    vacio: { icono: '🎟️', titulo: 'Todavía no participas en ninguna rifa', texto: 'Pon tus Chances en una rifa que se está armando y síguela desde aquí.', accion: { texto: 'Ver rifas', href: url('rifas') } },
    mostrar: lista => {
      const porGrupo = Object.fromEntries(PESTANAS.map(p => [p.grupo, lista.filter(x => x.grupo === p.grupo)]));
      const pedida = PESTANAS.find(p => p.id === parametro('pestana'));
      // Sin pestaña pedida, abre la primera que tenga rifas.
      const activa = pedida ?? PESTANAS.find(p => porGrupo[p.grupo].length) ?? PESTANAS[0];
      seccion.innerHTML = `<div class="mis-rifas">${tabs('mis', PESTANAS.map(p => ({
        id: p.id,
        texto: p.texto,
        contenido: panel(p, porGrupo[p.grupo]),
      })), activa.id)}</div>`;
      // Contador en cada pestaña (el componente escapa el texto, así que se agrega después).
      PESTANAS.forEach(p => seccion.querySelector(`#mis-tab-${p.id}`).insertAdjacentHTML('beforeend',
        `<span class="tab-cuenta" aria-label="${porGrupo[p.grupo].length} rifas">${porGrupo[p.grupo].length}</span>`));
      montarTabs(seccion.querySelector('[data-tabs]'), id => history.replaceState(null, '', url('misRifas', { pestana: id })));
    },
  });
}
