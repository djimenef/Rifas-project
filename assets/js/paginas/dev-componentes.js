// Catálogo interno de componentes (desarrollo).
import '../layout.js';
import { badgeEstado, ESTADOS_CON_BADGE } from '../components/badge.js';
import { barraAvance } from '../components/barra-avance.js';
import { selectorCantidad, montarSelectorCantidad } from '../components/selector-cantidad.js';
import { tabs, montarTabs } from '../components/tabs.js';
import { estadoVacio, estadoError, cargando } from '../components/estados.js';
import { abrirModal } from '../components/modal.js';
import { mostrarToast } from '../components/toast.js';

document.getElementById('badges').innerHTML = ESTADOS_CON_BADGE
  .map(e => badgeEstado(e, { fecha: '5 nov, 8:30 p. m.', apodo: 'lucho_23' }))
  .join('');

document.getElementById('barras').innerHTML = [0, 12, 41, 65, 90, 100].map(barraAvance).join('');

const sel = document.getElementById('selector');
sel.innerHTML = selectorCantidad({ valor: 5, min: 1, max: 20, unidad: 'Chances', etiqueta: 'Chances a poner' });
montarSelectorCantidad(sel.querySelector('.qty'), v => { document.getElementById('valor-qty').textContent = v; });

const t = document.getElementById('tabs');
t.innerHTML = tabs('mis-rifas', [
  { id: 'armando', texto: 'Armando', contenido: '<p>Rifas donde tus Chances están retenidas.</p>' },
  { id: 'abiertas', texto: 'Abiertas', contenido: '<p>Rifas confirmadas donde ya tienes tickets.</p>' },
  { id: 'finalizadas', texto: 'Finalizadas', contenido: '<p>Rifas realizadas, premios entregados y rifas descartadas.</p>' },
]);
montarTabs(t.querySelector('[data-tabs]'));

document.getElementById('estados').innerHTML =
  estadoVacio({ titulo: 'Aún no tienes rifas', texto: 'Pon Chances en una rifa para verla aquí.', accion: { texto: 'Ver rifas', href: '#' } }) +
  estadoError() +
  `<div class="card">${cargando({ texto: 'Cargando rifas…' })}</div>`;

document.getElementById('abrir-modal').addEventListener('click', () => {
  let cantidad;
  const { dialog } = abrirModal({
    titulo: 'Poner Chances',
    contenido: `<p>${badgeEstado('ARMANDO')}</p><p>Tus Chances quedan retenidas y solo se usan si la rifa se arma.</p>${selectorCantidad({ valor: 5, max: 35 })}`,
    acciones: [
      { texto: 'Cancelar', variante: 'ghost' },
      { texto: 'Confirmar', alHacerClic: cerrar => { cerrar(); mostrarToast(`¡Listo! Pusiste ${cantidad.valor()} Chances en la rifa.`); } },
    ],
  });
  cantidad = montarSelectorCantidad(dialog.querySelector('.qty'));
});
document.getElementById('toast-ok').addEventListener('click', () => mostrarToast('Enlace copiado.'));
document.getElementById('toast-error').addEventListener('click', () => mostrarToast('Saldo insuficiente.', { tipo: 'error' }));
