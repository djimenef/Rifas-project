import { esc } from '../lib/html.js';

// Cuenta regresiva en casillas (días, horas, min, seg). La usan el ticket de Inicio y las tarjetas de Rifas Confirmadas.
// Un solo intervalo actualiza todas las cuentas de la página, incluidas las que se dibujan después.

const pad = n => String(n).padStart(2, '0');

/** @param {string} hasta fecha ISO @returns {string} HTML de la cuenta regresiva */
export const cuentaRegresiva = hasta => `
  <div class="countdown" data-hasta="${esc(hasta)}">
    <div><b>00</b><span>días</span></div>
    <div><b>00</b><span>horas</span></div>
    <div><b>00</b><span>min</span></div>
    <div><b>00</b><span>seg</span></div>
  </div>`;

function actualizarCuentas() {
  document.querySelectorAll('.countdown[data-hasta]').forEach(c => {
    let s = Math.max(0, Math.floor((new Date(c.dataset.hasta) - Date.now()) / 1000));
    const [d, h, m, sg] = c.querySelectorAll('b');
    d.textContent = pad(Math.floor(s / 86400)); s %= 86400;
    h.textContent = pad(Math.floor(s / 3600)); s %= 3600;
    m.textContent = pad(Math.floor(s / 60));
    sg.textContent = pad(s % 60);
  });
}

let intervalo = null;
/** Pone al día las cuentas de la página y, la primera vez, arranca el intervalo de 1 s. */
export function iniciarCuentas() {
  actualizarCuentas();
  intervalo ??= setInterval(actualizarCuentas, 1000);
}
