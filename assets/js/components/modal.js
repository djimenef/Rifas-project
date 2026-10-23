import { esc } from '../lib/html.js';

// Modal accesible sobre <dialog>: atrapa el foco, se cierra con Esc, con la × o al hacer clic fuera.

/**
 * @param {{
 *   titulo: string,
 *   contenido: string,                       // HTML del cuerpo
 *   acciones?: { texto: string, variante?: 'primary' | 'ghost', alHacerClic?: (cerrar: () => void) => void }[],
 *   alCerrar?: () => void,
 * }} opciones
 * @returns {{ dialog: HTMLDialogElement, cerrar: () => void }}
 */
export function abrirModal({ titulo, contenido, acciones = [], alCerrar }) {
  const dialog = document.createElement('dialog');
  dialog.className = 'modal';
  const idTitulo = 'modal-titulo-' + Math.random().toString(36).slice(2, 8);
  dialog.setAttribute('aria-labelledby', idTitulo);
  dialog.innerHTML = `
    <div class="modal-head">
      <h2 id="${idTitulo}">${esc(titulo)}</h2>
      <button type="button" class="modal-cerrar" aria-label="Cerrar">×</button>
    </div>
    <div class="modal-cuerpo">${contenido}</div>
    ${acciones.length ? '<div class="modal-acciones"></div>' : ''}`;

  const cerrar = () => dialog.close();

  const zonaAcciones = dialog.querySelector('.modal-acciones');
  acciones.forEach(a => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = `btn btn-${a.variante ?? 'primary'}`;
    b.textContent = a.texto;
    b.addEventListener('click', () => (a.alHacerClic ? a.alHacerClic(cerrar) : cerrar()));
    zonaAcciones.appendChild(b);
  });

  dialog.querySelector('.modal-cerrar').addEventListener('click', cerrar);
  dialog.addEventListener('click', e => { if (e.target === dialog) cerrar(); }); // clic en el fondo
  dialog.addEventListener('close', () => { dialog.remove(); alCerrar?.(); });

  document.body.appendChild(dialog);
  dialog.showModal();
  return { dialog, cerrar };
}
