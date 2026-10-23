// Panel de demo (SOLO Fase 0): botón flotante para cambiar de rol y forzar el estado de la pantalla.
// Es una herramienta de desarrollo: por eso puede tocar la sesión y reiniciar los datos de ejemplo directamente.
import { guardarSesion, borrarSesion } from '../session.js';
import { reiniciarDatos } from '../services/mock/db.js';
import { estadoForzado, forzarEstado } from '../lib/demo.js';
import { esc } from '../lib/html.js';

const ROLES = [
  { valor: 'visitante', texto: 'Visitante', usuarioId: null },
  { valor: 'participante', texto: 'Participante', usuarioId: 'u-lucia' },
  { valor: 'admin', texto: 'Admin', usuarioId: 'u-admin' },
];
const ESTADOS = [
  { valor: null, texto: 'Normal' },
  { valor: 'cargando', texto: 'Cargando' },
  { valor: 'vacio', texto: 'Vacío' },
  { valor: 'error', texto: 'Error' },
];

const opcion = (activo, texto, atributos) =>
  `<button type="button" class="btn btn-sm ${activo ? 'btn-primary' : 'btn-ghost'}" aria-pressed="${activo}" ${atributos}>${texto}</button>`;

/** @param {{ id: string, apodo: string, rol: string } | null} usuario */
export function montarPanelDemo(usuario) {
  const rolActual = !usuario ? 'visitante' : usuario.rol === 'ADMIN' ? 'admin' : 'participante';
  const estado = estadoForzado();
  const panel = document.createElement('div');
  panel.className = 'demo';
  panel.innerHTML = `
    <button type="button" class="demo-boton" aria-expanded="false" aria-controls="demo-panel">🛠 Demo</button>
    <div class="demo-panel" id="demo-panel" role="dialog" aria-label="Panel de demo" hidden>
      <p class="demo-nota">Solo Fase 0. ${usuario ? `Sesión: <b>${esc(usuario.apodo)}</b>` : 'Sin sesión'}</p>
      <div class="demo-grupo">
        <span class="demo-titulo" id="demo-rol">Ver como</span>
        <div class="demo-opciones" role="group" aria-labelledby="demo-rol">
          ${ROLES.map(r => opcion(r.valor === rolActual, r.texto, `data-rol="${r.valor}"`)).join('')}
        </div>
      </div>
      <div class="demo-grupo">
        <span class="demo-titulo" id="demo-estado">Estado de esta pantalla</span>
        <div class="demo-opciones" role="group" aria-labelledby="demo-estado">
          ${ESTADOS.map(e => opcion(e.valor === estado, e.texto, `data-estado="${e.valor ?? ''}"`)).join('')}
        </div>
      </div>
      <button type="button" class="btn btn-ghost btn-sm btn-block" data-reiniciar>Reiniciar datos de ejemplo</button>
    </div>`;
  document.body.appendChild(panel);

  const boton = panel.querySelector('.demo-boton');
  const caja = panel.querySelector('.demo-panel');
  const abrir = abierto => { caja.hidden = !abierto; boton.setAttribute('aria-expanded', abierto); };
  boton.addEventListener('click', e => { e.stopPropagation(); abrir(caja.hidden); });
  document.addEventListener('click', e => { if (!panel.contains(e.target)) abrir(false); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') abrir(false); });

  panel.querySelectorAll('[data-rol]').forEach(b => b.addEventListener('click', () => {
    const rol = ROLES.find(r => r.valor === b.dataset.rol);
    if (rol.usuarioId) guardarSesion(rol.usuarioId); else borrarSesion();
    location.reload();
  }));
  panel.querySelectorAll('[data-estado]').forEach(b => b.addEventListener('click', () => {
    forzarEstado(b.dataset.estado || null);
    location.reload();
  }));
  panel.querySelector('[data-reiniciar]').addEventListener('click', () => {
    reiniciarDatos();
    location.reload();
  });
}
