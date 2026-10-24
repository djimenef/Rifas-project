// Mapa de rutas del sitio (PROMPT-FASE0 "Mapa de rutas") y utilidades para armar enlaces.
// Cada pantalla vive en su carpeta con su index.html; las rutas dinámicas usan parámetros (?slug=, ?codigo=).
// Excepción por decisión del proyecto: login y registro son archivos sueltos en la raíz.

const RAIZ = new URL('../../../', import.meta.url);

/** @param {string} destino ruta relativa a la raíz, p. ej. 'rifas/' o 'iniciar-sesion.html' */
export function ruta(destino = '') {
  const u = new URL(destino, RAIZ);
  return u.pathname + u.search + u.hash;
}

/**
 * acceso: 'publico' · 'sin-sesion' (login, registro, recuperar) · 'sesion' (cualquier usuario con sesión)
 *         'participante' · 'admin'
 * layout: 'publico' (header y footer del sitio) · 'volver' (logo + "← Volver al inicio") · 'admin' (panel de gestión)
 * seccion: sección del menú lateral del panel de administración
 */
export const RUTAS = Object.freeze({
  inicio: { archivo: '', nombre: 'Inicio', acceso: 'publico' },
  rifas: { archivo: 'rifas/', nombre: 'Rifas', acceso: 'publico' },
  rifa: { archivo: 'r/', nombre: 'Detalle de rifa', acceso: 'publico' },                       // ?slug=
  ganadores: { archivo: 'ganadores/', nombre: 'Ganadores', acceso: 'publico' },
  comoFunciona: { archivo: 'como-funciona/', nombre: 'Cómo funciona', acceso: 'publico' },
  preguntas: { archivo: 'preguntas-frecuentes/', nombre: 'Preguntas frecuentes', acceso: 'publico' },
  terminos: { archivo: 'legal/terminos/', nombre: 'Términos y condiciones', acceso: 'publico' },
  privacidad: { archivo: 'legal/privacidad/', nombre: 'Política de privacidad', acceso: 'publico' },
  reglamento: { archivo: 'legal/reglamento/', nombre: 'Reglamento de rifas', acceso: 'publico' },
  reclamaciones: { archivo: 'libro-de-reclamaciones/', nombre: 'Libro de Reclamaciones', acceso: 'publico' },

  login: { archivo: 'iniciar-sesion.html', nombre: 'Iniciar sesión', acceso: 'sin-sesion', layout: 'volver' },
  registro: { archivo: 'crear-cuenta.html', nombre: 'Crear cuenta', acceso: 'sin-sesion', layout: 'volver' },
  verificar: { archivo: 'verificar/', nombre: 'Verificar cuenta', acceso: 'sesion' },
  recuperar: { archivo: 'recuperar/', nombre: 'Recuperar contraseña', acceso: 'sin-sesion' },

  billetera: { archivo: 'billetera/', nombre: 'Mi billetera', acceso: 'participante' },
  historial: { archivo: 'billetera/historial/', nombre: 'Mi historial de puntos', acceso: 'participante' },
  recargar: { archivo: 'billetera/recargar/', nombre: 'Recargar puntos', acceso: 'participante' },
  misRifas: { archivo: 'mis-rifas/', nombre: 'Mis rifas', acceso: 'participante' },
  misTickets: { archivo: 'mis-rifas/tickets/', nombre: 'Mis tickets en una rifa', acceso: 'participante' },   // ?codigo=
  perfil: { archivo: 'perfil/', nombre: 'Perfil', acceso: 'participante' },
  crearRifa: { archivo: 'crear-rifa/', nombre: 'Proponer rifa', acceso: 'participante' },
  misPropuestas: { archivo: 'mis-propuestas/', nombre: 'Mis rifas propuestas', acceso: 'participante' },

  admin: { archivo: 'admin/', nombre: 'Dashboard', acceso: 'admin', layout: 'admin', seccion: 'dashboard' },
  adminRifas: { archivo: 'admin/rifas/', nombre: 'Rifas', acceso: 'admin', layout: 'admin', seccion: 'rifas' },
  adminRifaNueva: { archivo: 'admin/rifas/nueva/', nombre: 'Nueva rifa', acceso: 'admin', layout: 'admin', seccion: 'rifas' },
  adminRevision: { archivo: 'admin/revision/', nombre: 'Cola de revisión', acceso: 'admin', layout: 'admin', seccion: 'revision' },
  adminSorteos: { archivo: 'admin/sorteos/', nombre: 'Sorteos', acceso: 'admin', layout: 'admin', seccion: 'sorteos' },
  adminSorteo: { archivo: 'admin/sorteo/', nombre: 'Ejecutar sorteo', acceso: 'admin', layout: 'admin', seccion: 'sorteos' },          // ?codigo=
  adminEntregas: { archivo: 'admin/entregas/', nombre: 'Compras y entregas', acceso: 'admin', layout: 'admin', seccion: 'entregas' },
  adminEntrega: { archivo: 'admin/entrega/', nombre: 'Compra y entrega', acceso: 'admin', layout: 'admin', seccion: 'entregas' },      // ?codigo=
  adminProductos: { archivo: 'admin/productos/', nombre: 'Productos', acceso: 'admin', layout: 'admin', seccion: 'productos' },
  adminCategorias: { archivo: 'admin/categorias/', nombre: 'Categorías', acceso: 'admin', layout: 'admin', seccion: 'categorias' },
  adminUsuarios: { archivo: 'admin/usuarios/', nombre: 'Usuarios', acceso: 'admin', layout: 'admin', seccion: 'usuarios' },
  adminPropuestas: { archivo: 'admin/propuestas/', nombre: 'Propuestas', acceso: 'admin', layout: 'admin', seccion: 'propuestas' },

  devComponentes: { archivo: 'dev/componentes/', nombre: 'Componentes', acceso: 'publico', layout: 'volver' },
});

/** Secciones del menú lateral del panel de administración, en orden. */
export const SECCIONES_ADMIN = Object.freeze([
  { seccion: 'dashboard', id: 'admin', texto: 'Dashboard', icono: '📊' },
  { seccion: 'rifas', id: 'adminRifas', texto: 'Rifas', icono: '🎟️' },
  { seccion: 'revision', id: 'adminRevision', texto: 'Revisión', icono: '🔎' },
  { seccion: 'sorteos', id: 'adminSorteos', texto: 'Sorteos', icono: '🎲' },
  { seccion: 'entregas', id: 'adminEntregas', texto: 'Compras y entregas', icono: '📦' },
  { seccion: 'productos', id: 'adminProductos', texto: 'Productos', icono: '🛍️' },
  { seccion: 'categorias', id: 'adminCategorias', texto: 'Categorías', icono: '🗂️' },
  { seccion: 'usuarios', id: 'adminUsuarios', texto: 'Usuarios', icono: '👥' },
  { seccion: 'propuestas', id: 'adminPropuestas', texto: 'Propuestas', icono: '📝' },
]);

/**
 * Enlace a una pantalla del mapa.
 * @param {keyof typeof RUTAS} id
 * @param {Record<string, string|number|undefined|null>} [parametros] p. ej. { slug: 'ps5-slim' } o { volver: '/r/?slug=ps5-slim' }
 */
export function url(id, parametros = {}) {
  const r = RUTAS[id];
  if (!r) throw new Error(`Ruta desconocida: ${id}`);
  const query = new URLSearchParams(Object.entries(parametros).filter(([, v]) => v !== undefined && v !== null && v !== '')).toString();
  return ruta(r.archivo) + (query ? '?' + query : '');
}

/** Ruta actual (camino + parámetros), para usarla como ?volver=. */
export const rutaActual = () => location.pathname + location.search;

/**
 * Destino de ?volver= validado: solo rutas internas del sitio (evita redirecciones a otros dominios).
 * @param {string} [porDefecto] ruta a usar si no hay `volver` válido
 */
export function destinoVolver(porDefecto = url('rifas')) {
  const v = new URLSearchParams(location.search).get('volver');
  return v && v.startsWith('/') && !v.startsWith('//') && !v.includes('\\') ? v : porDefecto;
}

/** Ruta de un recurso del sitio (p. ej. una foto en assets/img/) o una URL externa tal cual. */
export const recurso = destino => (/^https?:\/\//.test(destino) ? destino : ruta(destino));

/** Valor de un parámetro de la URL actual. */
export const parametro = nombre => new URLSearchParams(location.search).get(nombre);
