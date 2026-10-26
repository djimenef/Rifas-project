import { adminService } from '../services/index.js';
import { esc } from '../lib/html.js';
import { fechaHora } from '../lib/formato.js';
import { abrirModal } from './modal.js';
import { badgeEstado, NOMBRE_ESTADO } from './badge.js';
import { datosBadge } from './tarjeta-rifa.js';
import { mostrarToast } from './toast.js';

// Piezas compartidas por las pantallas de rifas del panel (Rifas y Cola de revisión):
// badge interno y modales de acción (programar sorteo, cancelar con motivo, simulaciones de la Fase 0).
// Las reglas las aplica AdminService; aquí solo se piden los datos y se muestran sus errores.

/** Badge de estado para el panel: incluye los estados sin badge público (Borrador, Descartada). */
export const badgeAdmin = r => badgeEstado(r.estado, datosBadge(r)) || `<span class="badge">${esc(NOMBRE_ESTADO[r.estado] ?? r.estado)}</span>`;

const errorEn = (dialog, e) => {
  const campos = Object.values(e.campos ?? {});
  dialog.querySelector('[data-error]').innerHTML =
    `<p class="aviso aviso-error" role="alert"><span class="aviso-icono" aria-hidden="true">!</span><span>${esc(campos[0] ?? e.message)}</span></p>`;
};

/**
 * Modal con un formulario: `contenido` trae los campos; `enviar` recibe el diálogo y hace la llamada al servicio.
 * @param {{ titulo: string, contenido: string, textoBoton: string, enviar: (dialog: HTMLDialogElement) => Promise<string>, alTerminar?: () => void }} o
 *   `enviar` devuelve el texto del toast de éxito.
 */
function modalAccion({ titulo, contenido, textoBoton, enviar, alTerminar }) {
  const { dialog } = abrirModal({
    titulo,
    contenido: `${contenido}<div data-error role="status" aria-live="polite"></div>`,
    acciones: [
      { texto: 'Volver', variante: 'ghost' },
      {
        texto: textoBoton,
        alHacerClic: async cerrar => {
          const boton = dialog.querySelector('.modal-acciones .btn-primary');
          boton.disabled = true;
          try {
            const mensaje = await enviar(dialog);
            cerrar();
            mostrarToast(mensaje);
            alTerminar?.();
          } catch (e) {
            boton.disabled = false;
            errorEn(dialog, e);
          }
        },
      },
    ],
  });
  dialog.querySelector('input, textarea')?.focus();
  return dialog;
}

/** Valor por defecto del sorteo: pasado mañana a las 8:00 p. m. (hora local), en formato de datetime-local. */
function fechaSorteoSugerida() {
  const d = new Date();
  d.setDate(d.getDate() + 2);
  d.setHours(20, 0, 0, 0);
  const p = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

/** Aprobar la revisión y anunciar la fecha en que se rifa (→ PROGRAMADA con hash público). */
export function modalProgramar(rifa, alTerminar) {
  modalAccion({
    titulo: 'Aprobar y anunciar la fecha',
    contenido: `
      <p class="modal-texto">Al aprobar, <b>${esc(rifa.producto.nombre)}</b> queda con la <b>fecha en que se rifa</b> anunciada y se publica la huella de la lista de opciones.</p>
      <label>Fecha y hora en que se rifa<input type="datetime-local" name="fechaSorteo" value="${fechaSorteoSugerida()}" required></label>`,
    textoBoton: 'Aprobar y anunciar',
    enviar: async dialog => {
      const valor = dialog.querySelector('[name="fechaSorteo"]').value;
      const r = await adminService.aprobarYProgramar(rifa.id, valor ? new Date(valor).toISOString() : '');
      return `Se rifa el ${fechaHora(r.fechaSorteo)}`;
    },
    alTerminar,
  });
}

/** Cancelar con motivo: solo ANTES de confirmarse (Sugerida, Armándose). Libera las Chances retenidas. */
export function modalCancelar(rifa, alTerminar) {
  modalAccion({
    titulo: 'Cancelar con motivo',
    contenido: `
      <p class="modal-texto">Se cancela <b>${esc(rifa.producto.nombre)}</b>, que todavía no se confirma. Pasa a <b>Rifa Descartada</b> y todas las Chances retenidas vuelven completas a las billeteras. No se puede deshacer.</p>
      <label>Motivo (lo verá el público)<textarea name="motivo" required maxlength="300" placeholder="Ej.: el producto ya no está disponible en ninguna tienda confiable."></textarea></label>`,
    textoBoton: 'Cancelar rifa',
    enviar: async dialog => {
      await adminService.cancelarRifa(rifa.id, dialog.querySelector('[name="motivo"]').value);
      return 'Rifa cancelada. Se devolvieron todas las Chances retenidas.';
    },
    alTerminar,
  });
}

/**
 * Cancelar por fuerza mayor: la ÚNICA forma de cancelar una Rifa Confirmada (Confirmada, Cerrada, con fecha para rifar).
 * Una Rifa Confirmada siempre se rifa; si el producto cambió o ya no existe, se entrega uno equivalente (README §7.11).
 */
export function modalCancelarFuerzaMayor(rifa, alTerminar) {
  modalAccion({
    titulo: 'Cancelar por fuerza mayor',
    contenido: `
      <p class="modal-texto"><b>${esc(rifa.producto.nombre)}</b> ya está confirmada y <b>siempre se rifa</b>. Si el producto cambió de precio o ya no existe, no se cancela: se entrega uno equivalente de igual o mayor valor.</p>
      <p class="modal-texto">Solo cancela si hay una causa de <b>fuerza mayor legal</b>. Se reembolsan íntegramente todas las Chances y opciones, y la rifa pasa a <b>Rifa Descartada</b>. No se puede deshacer.</p>
      <label class="check"><input type="checkbox" name="fuerzaMayorLegal" required> Confirmo que es un caso de fuerza mayor legal</label>
      <label>Motivo (lo verá el público)<textarea name="motivo" required maxlength="300" placeholder="Ej.: orden de la autoridad competente."></textarea></label>`,
    textoBoton: 'Cancelar por fuerza mayor',
    enviar: async dialog => {
      await adminService.cancelarRifa(rifa.id, dialog.querySelector('[name="motivo"]').value,
        { fuerzaMayorLegal: !!dialog.querySelector('[name="fuerzaMayorLegal"]')?.checked });
      return 'Rifa cancelada por fuerza mayor. Se reembolsaron todas las Chances.';
    },
    alTerminar,
  });
}

/** Fase 0: simula que otras personas ponen Chances o compran opciones. */
export function modalSimularAporte(rifa, alTerminar) {
  modalAccion({
    titulo: 'Simular aporte (demo)',
    contenido: `
      <p class="modal-texto">Solo Fase 0: simula que otras personas ponen Chances en esta rifa. Si se cubre la meta, la rifa se confirma.</p>
      <div class="two">
        <label>Chances<input type="text" inputmode="numeric" name="puntos" value="100" required></label>
        <label>Personas nuevas<input type="text" inputmode="numeric" name="personas" value="10" required></label>
      </div>`,
    textoBoton: 'Simular aporte',
    enviar: async dialog => {
      const n = v => Number(dialog.querySelector(`[name="${v}"]`).value);
      const r = await adminService.simularAporteExterno(rifa.id, n('puntos'), n('personas'));
      return `Aporte simulado. Estado: ${NOMBRE_ESTADO[r.estado]}`;
    },
    alTerminar,
  });
}

/** Confirmación simple para acciones de un clic (publicar, cerrar, vencer ventana). */
export function modalConfirmar({ titulo, texto, textoBoton, accion, alTerminar }) {
  modalAccion({ titulo, contenido: `<p class="modal-texto">${texto}</p>`, textoBoton, enviar: accion, alTerminar });
}
