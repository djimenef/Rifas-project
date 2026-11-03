// Revisión de rutas (desarrollo, Paso 8): abre cada pantalla de RUTAS con el rol que pide, a 1280 px y a 360 px,
// y revisa errores de JavaScript, secciones con error, "En construcción", desborde horizontal y enlaces internos rotos.
// Las rutas dinámicas toman un código real de los datos de ejemplo (se piden a los servicios, no se escriben a mano).
import { authService, rifasService, adminService } from '../services/index.js';
import { reiniciarDatos, configurarLatencia } from '../services/mock/db.js';
import { RUTAS, url } from '../lib/rutas.js';
import { esc } from '../lib/html.js';

const filas = document.getElementById('filas');
const resumen = document.getElementById('resumen');
const marco = document.getElementById('marco');
const ANCHOS = [1280, 360];
const esperar = ms => new Promise(r => setTimeout(r, ms));

// Credenciales de demo (CLAUDE.md, mocks/usuarios.js).
const CUENTAS = {
  participante: ['lucia@dalechance.pe', 'demo123'],
  admin: ['admin@dalechance.pe', 'admin123'],
};
/** Rol con el que se abre cada tipo de acceso. 'sin-sesion' y 'publico' se abren sin sesión. */
const ROL = { publico: null, 'sin-sesion': null, sesion: 'participante', participante: 'participante', admin: 'admin' };
const OMITIR = ['devComponentes'];   // página interna, no es del sitio

async function entrarComo(rol) {
  await authService.cerrarSesion();
  if (rol) await authService.iniciarSesion(...CUENTAS[rol]);
}

/** Parámetros reales para las rutas dinámicas (y una variante de detalle en Admin · Rifas). */
async function parametrosDinamicos() {
  reiniciarDatos();
  await entrarComo('participante');
  const conTickets = (await rifasService.misRifas()).find(x => x.tickets.length);
  await entrarComo('admin');
  const rifas = await adminService.listarRifas();
  const porEstado = e => rifas.find(r => r.estado === e)?.codigo;
  return {
    rifa: { slug: (await rifasService.listar({ estados: ['ARMANDO'] }))[0].slug },
    misTickets: { codigo: conTickets.rifa.codigo },
    adminSorteo: { codigo: porEstado('PROGRAMADA') },
    adminEntrega: { codigo: porEstado('SORTEADA') },
    'adminRifas (detalle)': { codigo: porEstado('ABIERTA') },
  };
}

/** Carga la ruta en el marco y espera a que termine de dibujar (sin secciones cargando). */
function cargarEnMarco(ruta, ancho) {
  return new Promise(resolve => {
    const errores = [];
    marco.style.width = ancho + 'px';
    marco.onload = async () => {
      const win = marco.contentWindow;
      win.addEventListener('error', e => errores.push(e.message));
      win.addEventListener('unhandledrejection', e => errores.push(String(e.reason?.message ?? e.reason)));
      // Espera hasta 8 s a que no queden secciones cargando.
      for (let i = 0; i < 40; i++) {
        await esperar(200);
        const doc = marco.contentDocument;
        if (doc.querySelector('main')?.childElementCount && !doc.querySelector('[aria-busy="true"]')) break;
      }
      resolve({ doc: marco.contentDocument, errores });
    };
    // Los errores de los módulos ocurren antes del load: se capturan escuchando apenas existe la ventana.
    marco.src = ruta;
    const vigilar = setInterval(() => {
      const win = marco.contentWindow;
      if (win && win.location.href.endsWith(ruta) && !win.__vigilado) {
        win.__vigilado = true;
        win.addEventListener('error', e => errores.push(e.message));
        win.addEventListener('unhandledrejection', e => errores.push(String(e.reason?.message ?? e.reason)));
        clearInterval(vigilar);
      }
    }, 5);
    setTimeout(() => clearInterval(vigilar), 5000);
  });
}

function revisar(doc, errores) {
  const problemas = [...errores.map(e => `JS: ${e}`)];
  if (doc.querySelector('.estado-error')) problemas.push('sección con error: ' + doc.querySelector('.estado-error h3')?.textContent);
  if (/En construcción/.test(doc.body.innerText)) problemas.push('"En construcción"');
  if (/Sin acceso|No tienes acceso/.test(doc.body.innerText)) problemas.push('sin acceso con este rol');
  const desborde = doc.documentElement.scrollWidth - doc.documentElement.clientWidth;
  if (desborde > 0) problemas.push(`desborde horizontal de ${desborde} px`);
  return problemas;
}

const enlaces = new Map();   // ruta → primera pantalla donde apareció

function recogerEnlaces(doc, origen) {
  doc.querySelectorAll('a[href]').forEach(a => {
    const u = new URL(a.getAttribute('href'), doc.baseURI);
    if (u.origin !== location.origin || u.pathname.startsWith('/dev/')) return;
    if (!enlaces.has(u.pathname)) enlaces.set(u.pathname, origen);
  });
}

function fila(nombre, rol, porAncho) {
  const celda = p => (p.length ? '<td class="falla">✗</td>' : '<td class="ok">✓</td>');
  const detalle = ANCHOS.flatMap(a => porAncho[a].map(p => `${a} px · ${p}`));
  filas.insertAdjacentHTML('beforeend', `<tr>
    <td>${esc(nombre)}</td><td>${esc(rol ?? 'visitante')}</td>${ANCHOS.map(a => celda(porAncho[a])).join('')}
    <td>${detalle.length ? esc(detalle.join(' · ')) : '—'}</td></tr>`);
  return detalle.length === 0;
}

configurarLatencia(0);
const dinamicos = await parametrosDinamicos();
const casos = Object.entries(RUTAS)
  .filter(([id]) => !OMITIR.includes(id))
  .map(([id, r]) => ({ nombre: id, id, rol: ROL[r.acceso], parametros: dinamicos[id] ?? {} }));
casos.push({ nombre: 'adminRifas (detalle)', id: 'adminRifas', rol: 'admin', parametros: dinamicos['adminRifas (detalle)'] });

let correctas = 0;
for (const [i, caso] of casos.entries()) {
  resumen.textContent = `Revisando ${i + 1} de ${casos.length}: ${caso.nombre}…`;
  reiniciarDatos();
  await entrarComo(caso.rol);
  const ruta = url(caso.id, caso.parametros);
  const porAncho = {};
  for (const ancho of ANCHOS) {
    const { doc, errores } = await cargarEnMarco(ruta, ancho);
    porAncho[ancho] = revisar(doc, errores);
    recogerEnlaces(doc, caso.nombre);
  }
  if (fila(caso.nombre, caso.rol, porAncho)) correctas++;
}

// Enlaces internos: cada uno debe responder 200.
const rotos = [];
for (const [ruta, origen] of enlaces) {
  const r = await fetch(ruta, { method: 'HEAD' }).catch(() => null);
  if (!r?.ok) rotos.push(`${ruta} (en ${origen})`);
}
document.getElementById('enlaces').textContent = rotos.length
  ? `${rotos.length} de ${enlaces.size} enlaces rotos: ${rotos.join(' · ')}`
  : `${enlaces.size} enlaces internos distintos, todos responden.`;

reiniciarDatos();
await authService.cerrarSesion();
marco.removeAttribute('src');
resumen.textContent = `${correctas} de ${casos.length} pantallas sin problemas · ${rotos.length} enlaces rotos`;
resumen.dataset.listo = 'true';
