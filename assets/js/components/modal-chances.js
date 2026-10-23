import { rifasService, billeteraService, nuevaClaveIdempotencia } from '../services/index.js';
import { url } from '../lib/rutas.js';
import { esc } from '../lib/html.js';
import { puntos, opciones } from '../lib/formato.js';
import { abrirModal } from './modal.js';
import { selectorCantidad, montarSelectorCantidad } from './selector-cantidad.js';
import { cargando, estadoError } from './estados.js';
import { mostrarToast } from './toast.js';
import { actualizarSaldo } from './header.js';

// Modal "Poner Chances" (rifa armándose: quedan retenidas) y "Comprar opciones" (rifa abierta: se consumen).
// Pasos: elegir cantidad → confirmar (saldo antes y después) → éxito (README §7.10).
// Las reglas (saldo, máximo por persona, estado de la rifa, idempotencia) las aplica RifasService;
// aquí solo se muestran sus resultados y errores.

const MAX_SELECTOR = 500;   // tope visual del selector cuando el límite es el saldo (así se ve "saldo insuficiente")

/** "#12, #13, #14" · con más de 10, "#1, #2, … y 25 más" */
export function listaTickets(tickets, max = 10) {
  const visibles = tickets.slice(0, max).map(n => '#' + n).join(', ');
  return tickets.length > max ? `${visibles} y ${tickets.length - max} más` : visibles;
}

const fila = (dt, dd) => `<div><dt>${esc(dt)}</dt><dd>${dd}</dd></div>`;

/**
 * @param {{ rifa: import('../domain/rifa.js').Rifa, modo: 'poner'|'comprar', alTerminar?: () => void }} opciones
 */
export function abrirModalChances({ rifa, modo, alTerminar }) {
  const poner = modo === 'poner';
  const { dialog, cerrar } = abrirModal({ titulo: poner ? 'Poner Chances' : 'Comprar opciones', contenido: cargando({ texto: 'Revisando tu saldo…', filas: 2 }) });
  const cuerpo = dialog.querySelector('.modal-cuerpo');
  let cantidad = 5;
  let datos;

  async function iniciar() {
    cuerpo.innerHTML = cargando({ texto: 'Revisando tu saldo…', filas: 2 });
    try {
      const [billetera, participacion] = await Promise.all([billeteraService.obtener(), rifasService.miParticipacion(rifa.id)]);
      datos = { billetera, participacion };
      pasoElegir();
    } catch (e) {
      cuerpo.innerHTML = estadoError({ texto: e.message });
      cuerpo.querySelector('[data-reintentar]')?.addEventListener('click', iniciar);
    }
  }

  function pasoElegir() {
    const { disponible } = datos.billetera;
    const { maxPuedoPoner } = datos.participacion;
    // Si lo que limita es el máximo por persona (o el tope de la rifa) y no el saldo, el selector no deja pasarlo.
    const limitePersonal = maxPuedoPoner < disponible;
    if (limitePersonal && maxPuedoPoner === 0) {
      cuerpo.innerHTML = `
        <p class="aviso aviso-oro"><span class="aviso-icono" aria-hidden="true">✋</span><span>Ya llegaste al máximo de Chances por persona en esta rifa.</span></p>
        <div class="modal-acciones"><button type="button" class="btn btn-primary" data-cerrar>Entendido</button></div>`;
      cuerpo.querySelector('[data-cerrar]').addEventListener('click', cerrar);
      return;
    }
    const max = limitePersonal ? maxPuedoPoner : MAX_SELECTOR;
    cantidad = Math.max(1, Math.min(cantidad, max));
    cuerpo.innerHTML = `
      <p class="modal-rifa">${rifa.producto.emoji} <b>${esc(rifa.producto.nombre)}</b></p>
      <p class="modal-texto">${poner
        ? 'Tus Chances quedan retenidas y solo se usan si la rifa se arma. Si no se arma, vuelven completas a tu billetera.'
        : 'La rifa ya va: cada Chance es una opción de ganar en el sorteo.'}</p>
      <p class="modal-saldo">Tienes <b>${puntos(disponible)}</b> disponibles.</p>
      <div class="modal-cantidad"><span>${poner ? '¿Cuántas Chances quieres poner?' : '¿Cuántas opciones quieres comprar?'}</span>
        ${selectorCantidad({ valor: cantidad, min: 1, max, etiqueta: poner ? 'Chances a poner' : 'Opciones a comprar' })}
      </div>
      <div id="modal-aviso" role="status" aria-live="polite"></div>
      <div class="modal-acciones">
        <button type="button" class="btn btn-ghost" data-cerrar>Cancelar</button>
        <button type="button" class="btn btn-primary" data-continuar>Continuar</button>
      </div>`;
    const aviso = cuerpo.querySelector('#modal-aviso');
    const continuar = cuerpo.querySelector('[data-continuar]');
    montarSelectorCantidad(cuerpo.querySelector('.qty'), v => {
      cantidad = v;
      const faltan = v - disponible;
      continuar.disabled = faltan > 0;
      aviso.innerHTML = faltan > 0 ? `
        <div class="aviso aviso-error"><span class="aviso-icono" aria-hidden="true">!</span>
          <div><p><b>No tienes Chances suficientes.</b> Te faltan ${puntos(faltan)}.</p>
          <a class="btn btn-primary btn-sm modal-recargar" href="${url('recargar', { cantidad: Math.max(faltan, 5), volver: url('rifa', { slug: rifa.slug, accion: modo }) })}">Recargar</a></div>
        </div>` : `<p class="modal-quedan">Te quedarían ${puntos(disponible - v)} disponibles.</p>`;
    });
    cuerpo.querySelector('[data-cerrar]').addEventListener('click', cerrar);
    continuar.addEventListener('click', () => pasoConfirmar());
    cuerpo.querySelector('.qty input').focus();
  }

  function pasoConfirmar(error = '') {
    const { disponible, retenido } = datos.billetera;
    const clave = nuevaClaveIdempotencia();      // una por intento de confirmación (§7.10)
    cuerpo.innerHTML = `
      <p class="modal-texto">Revisa antes de confirmar:</p>
      <dl class="datos">
        ${fila('Rifa', esc(rifa.producto.nombre))}
        ${fila(poner ? 'Chances a poner' : 'Opciones a comprar', poner ? puntos(cantidad) : `${opciones(cantidad)} (${puntos(cantidad)})`)}
        ${fila('Disponible', `${puntos(disponible)} → <b>${puntos(disponible - cantidad)}</b>`)}
        ${poner ? fila('Retenidas', `${puntos(retenido)} → <b>${puntos(retenido + cantidad)}</b>`) : ''}
      </dl>
      <p class="modal-nota">${poner
        ? 'Puedes retirar tus Chances mientras la rifa se está armando, si la rifa lo permite.'
        : 'La compra no se puede deshacer. Si la rifa se cancela, te devolvemos tus Chances.'}</p>
      ${error ? `<p class="aviso aviso-error" role="alert"><span class="aviso-icono" aria-hidden="true">!</span><span>${esc(error)}</span></p>` : ''}
      <div class="modal-acciones">
        <button type="button" class="btn btn-ghost" data-volver>Volver</button>
        <button type="button" class="btn btn-primary" data-confirmar>${poner ? `Poner ${puntos(cantidad)}` : `Comprar ${opciones(cantidad)}`}</button>
      </div>`;
    cuerpo.querySelector('[data-volver]').addEventListener('click', pasoElegir);
    const confirmar = cuerpo.querySelector('[data-confirmar]');
    confirmar.addEventListener('click', async () => {
      confirmar.disabled = true;      // evita el doble clic (y la clave de idempotencia evita el doble descuento)
      confirmar.textContent = 'Procesando…';
      try {
        const comprobante = poner
          ? await rifasService.comprometer(rifa.id, cantidad, clave)
          : await rifasService.comprar(rifa.id, cantidad, clave);
        pasoExito(comprobante);
      } catch (e) {
        if (e.codigo === 'SALDO_INSUFICIENTE' || e.codigo === 'SUPERA_MAXIMO') {
          await iniciar();            // el saldo o el máximo cambiaron: vuelve a elegir con los datos nuevos
          cuerpo.querySelector('#modal-aviso')?.insertAdjacentHTML('afterbegin', `<p class="aviso aviso-error" role="alert"><span class="aviso-icono" aria-hidden="true">!</span><span>${esc(e.message)}</span></p>`);
        } else {
          pasoConfirmar(e.message);
        }
      }
    });
    confirmar.focus();
  }

  function pasoExito(c) {
    dialog.querySelector('h2').textContent = '¡Listo!';
    const titulo = poner ? `Pusiste ${puntos(c.cantidad)} en esta rifa` : `Compraste ${opciones(c.cantidad)}`;
    let detalle;
    if (c.rifaConfirmada) detalle = `🎉 ¡Con tus Chances la rifa se armó! Ahora son opciones de ganar: ${listaTickets(c.tickets ?? [])}.`;
    else if (poner) detalle = 'Tus Chances quedan retenidas. Te avisaremos cuando la rifa se arme.';
    else detalle = `Tus opciones: ${listaTickets(c.tickets ?? [])}.`;
    cuerpo.innerHTML = `
      <p class="aviso aviso-ok"><span class="aviso-icono" aria-hidden="true">✓</span><span><b>${esc(titulo)}</b></span></p>
      <p class="modal-texto">${esc(detalle)}</p>
      <dl class="datos">
        ${fila('Disponible ahora', puntos(c.disponibleDespues))}
        ${poner ? fila('Retenidas ahora', puntos(c.retenidoDespues)) : ''}
        ${fila('N.º de operación', `<span class="texto-mono">${esc(c.numeroOperacion)}</span>`)}
      </dl>
      <div class="modal-acciones">
        <a class="btn btn-ghost" href="${url('historial')}">Ver mi historial</a>
        <button type="button" class="btn btn-primary" data-cerrar>Cerrar</button>
      </div>`;
    cuerpo.querySelector('[data-cerrar]').addEventListener('click', cerrar);
    cuerpo.querySelector('[data-cerrar]').focus();
    mostrarToast(poner ? `¡Listo! Pusiste ${puntos(c.cantidad)}` : `¡Listo! Compraste ${opciones(c.cantidad)}`);
    actualizarSaldo();
    alTerminar?.();
  }

  iniciar();
}

/**
 * Confirmación para retirar las Chances retenidas de una rifa que se está armando.
 * @param {{ rifa: import('../domain/rifa.js').Rifa, retenido: number, alTerminar?: () => void }} opciones
 */
export function abrirModalRetiro({ rifa, retenido, alTerminar }) {
  const { dialog } = abrirModal({
    titulo: 'Retirar mis Chances',
    contenido: `
      <p class="modal-texto">Vas a retirar <b>${puntos(retenido)}</b> de <b>${esc(rifa.producto.nombre)}</b>. Vuelven a tu saldo disponible y dejas de participar en esta rifa.</p>
      <div id="modal-aviso" role="status" aria-live="polite"></div>`,
    acciones: [
      { texto: 'Cancelar', variante: 'ghost' },
      {
        texto: 'Retirar mis Chances',
        alHacerClic: async cerrar => {
          const boton = dialog.querySelector('.modal-acciones .btn-primary');
          boton.disabled = true;
          boton.textContent = 'Retirando…';
          try {
            const c = await rifasService.retirarCompromiso(rifa.id);
            cerrar();
            mostrarToast(`Retiraste ${puntos(c.cantidad)}. Ya están en tu saldo disponible.`);
            actualizarSaldo();
            alTerminar?.();
          } catch (e) {
            boton.disabled = false;
            boton.textContent = 'Retirar mis Chances';
            dialog.querySelector('#modal-aviso').innerHTML = `<p class="aviso aviso-error" role="alert"><span class="aviso-icono" aria-hidden="true">!</span><span>${esc(e.message)}</span></p>`;
          }
        },
      },
    ],
  });
}
