// Admin · Rifas (/admin/rifas): listado con filtro por estado y búsqueda, acciones por fila,
// y vista de detalle (?codigo=) con los datos internos y las acciones según el estado.
import { listo } from '../layout.js';
import { adminService } from '../services/index.js';
import { url, parametro } from '../lib/rutas.js';
import { esc } from '../lib/html.js';
import { soles, puntos, opciones, fechaHora } from '../lib/formato.js';
import { barraAvance } from '../components/barra-avance.js';
import { NOMBRE_ESTADO } from '../components/badge.js';
import { cargarSeccion } from '../components/estados.js';
import { badgeAdmin, modalCancelar, modalSimularAporte, modalConfirmar } from '../components/admin-rifas.js';
import { ESTADOS_RIFA, ESTADOS_COMPROMISO } from '../domain/rifa.js';

const pagina = document.getElementById('pagina');
const { permitido } = await listo;

const normalizar = s => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const fila = (dt, dd) => `<div><dt>${esc(dt)}</dt><dd>${dd}</dd></div>`;

// ---------- Listado ----------

function listado() {
  pagina.innerHTML = `
    <div class="admin-titulo">
      <div>
        <h1 class="pagina-titulo">Rifas</h1>
        <p class="pagina-sub">Todas las rifas con sus datos internos. Crea, publica y sigue cada una.</p>
      </div>
      <a class="btn btn-primary" href="${url('adminRifaNueva')}">+ Nueva rifa</a>
    </div>
    <form class="filtros admin-filtros" id="filtros" role="search" aria-label="Filtrar rifas">
      <label>Buscar<input type="search" id="busqueda" placeholder="Nombre o código (RF-…)" autocomplete="off"></label>
      <label>Estado<select id="filtro-estado"><option value="">Todos los estados</option>
        ${ESTADOS_RIFA.map(e => `<option value="${e}">${esc(NOMBRE_ESTADO[e])}</option>`).join('')}</select></label>
    </form>
    <div id="tabla"></div>`;

  const busqueda = pagina.querySelector('#busqueda');
  const estado = pagina.querySelector('#filtro-estado');
  const tabla = pagina.querySelector('#tabla');
  busqueda.value = parametro('q') ?? '';
  estado.value = ESTADOS_RIFA.includes(parametro('estado')) ? parametro('estado') : '';

  const cargar = () => {
    const query = new URLSearchParams(Object.entries({ q: busqueda.value.trim(), estado: estado.value }).filter(([, v]) => v));
    history.replaceState(null, '', location.pathname + (query.size ? '?' + query : ''));
    cargarSeccion(tabla, {
      textoCargando: 'Cargando rifas…',
      cargar: async () => {
        const q = normalizar(busqueda.value.trim());
        const rifas = await adminService.listarRifas({ estado: estado.value || undefined });
        return rifas.filter(r => !q || normalizar(r.producto.nombre).includes(q) || normalizar(r.codigo).includes(q));
      },
      vacio: { icono: '🔍', titulo: 'No hay rifas con esos filtros', texto: 'Prueba con otro estado o búsqueda.' },
      mostrar: rifas => {
        tabla.innerHTML = `
          <div class="tabla-scroll">
            <table class="tabla">
              <caption>${rifas.length} ${rifas.length === 1 ? 'rifa' : 'rifas'}</caption>
              <thead><tr>
                <th scope="col">Rifa</th><th scope="col">Estado</th><th scope="col">Avance</th>
                <th scope="col" class="num">Personas</th><th scope="col" class="num">Meta</th><th scope="col" class="num">Reunido</th>
                <th scope="col"><span class="sr-solo">Acciones</span></th>
              </tr></thead>
              <tbody>${rifas.map(filaRifa).join('')}</tbody>
            </table>
          </div>`;
        tabla.querySelectorAll('[data-publicar]').forEach(b => b.addEventListener('click', () => {
          const r = rifas.find(x => x.id === b.dataset.publicar);
          confirmarPublicar(r, cargar);
        }));
      },
    });
  };

  let espera;
  busqueda.addEventListener('input', () => { clearTimeout(espera); espera = setTimeout(cargar, 300); });
  estado.addEventListener('change', cargar);
  pagina.querySelector('#filtros').addEventListener('submit', e => { e.preventDefault(); cargar(); });
  cargar();
}

function filaRifa(r) {
  const reunido = ESTADOS_COMPROMISO.includes(r.estado) || ['PROPUESTA', 'NO_SE_ARMO', 'BORRADOR', 'REVISION_LINK', 'DESCARTADA'].includes(r.estado)
    ? r.puntosReunidos : r.opcionesVendidas;
  return `
    <tr>
      <td><div class="tabla-rifa"><span aria-hidden="true">${r.producto.emoji}</span>
        <div><a href="${url('adminRifas', { codigo: r.codigo })}">${esc(r.producto.nombre)}</a><small>${esc(r.codigo)} · ${esc(r.categoria)}</small></div></div></td>
      <td>${badgeAdmin(r)}</td>
      <td>${barraAvance(r.progreso)}</td>
      <td class="num">${r.participantes.toLocaleString('es-PE')}</td>
      <td class="num">${r.meta.toLocaleString('es-PE')}</td>
      <td class="num">${reunido.toLocaleString('es-PE')}</td>
      <td><div class="tabla-acciones">
        ${r.estado === 'BORRADOR' ? `<button type="button" class="btn btn-primary btn-sm" data-publicar="${esc(r.id)}">Publicar</button>` : ''}
        <a class="btn btn-ghost btn-sm" href="${url('adminRifas', { codigo: r.codigo })}">Ver detalle</a>
      </div></td>
    </tr>`;
}

function confirmarPublicar(r, alTerminar) {
  modalConfirmar({
    titulo: 'Publicar rifa',
    texto: `<b>${esc(r.producto.nombre)}</b> pasa a <b>Armando Rifa</b>: aparece en el listado público y empieza su ventana de armado de ${r.config.ventanaArmadoDias} días.`,
    textoBoton: 'Publicar',
    accion: async () => { await adminService.publicarRifa(r.id); return 'Rifa publicada: ya está Armando Rifa.'; },
    alTerminar,
  });
}

// ---------- Detalle ----------

function accionesPorEstado(r, recargar) {
  const acciones = [];
  const demo = '<span class="badge-demo">Demo</span>';
  switch (r.estado) {
    case 'BORRADOR':
      acciones.push(['Publicar', 'primary', () => confirmarPublicar(r, recargar)]);
      break;
    case 'ARMANDO': case 'CAPTANDO':
      acciones.push([`Simular aporte ${demo}`, 'ghost', () => modalSimularAporte(r, recargar)]);
      acciones.push([`Vencer ventana ${demo}`, 'ghost', () => modalConfirmar({
        titulo: 'Vencer ventana (demo)', texto: 'Solo Fase 0: simula que se acabó el tiempo sin cubrir la meta. La rifa pasa a <b>No se armó la Rifa</b> y se liberan todas las Chances retenidas.',
        textoBoton: 'Vencer ventana', accion: async () => { await adminService.vencerVentana(r.id); return 'La rifa no se armó: se liberaron las Chances.'; }, alTerminar: recargar,
      })]);
      acciones.push(['Cancelar rifa', 'ghost', () => modalCancelar(r, recargar)]);
      break;
    case 'ABIERTA':
      acciones.push([`Simular compras ${demo}`, 'ghost', () => modalSimularAporte(r, recargar)]);
      acciones.push([`Cerrar ahora ${demo}`, 'ghost', () => modalConfirmar({
        titulo: 'Cerrar rifa (demo)', texto: 'Solo Fase 0: simula que venció el tiempo abierta. La rifa se cierra, se congela la lista de opciones y pasa a revisión.',
        textoBoton: 'Cerrar rifa', accion: async () => { await adminService.cerrarRifa(r.id); return 'Rifa cerrada: ya está en la cola de revisión.'; }, alTerminar: recargar,
      })]);
      acciones.push(['Cancelar rifa', 'ghost', () => modalCancelar(r, recargar)]);
      break;
    case 'CERRADA': case 'EN_REVISION':
      acciones.push(['Ir a la cola de revisión', 'primary', url('adminRevision')]);
      break;
    case 'PROGRAMADA':
      acciones.push(['Ejecutar sorteo', 'primary', url('adminSorteo', { codigo: r.codigo })]);
      acciones.push(['Cancelar rifa', 'ghost', () => modalCancelar(r, recargar)]);
      break;
    case 'SORTEADA': case 'COMPRANDO': case 'EN_CAMINO':
      acciones.push(['Registrar compra y entrega', 'primary', url('adminEntrega', { codigo: r.codigo })]);
      break;
    default:
  }
  if (!['BORRADOR', 'DESCARTADA'].includes(r.estado)) acciones.push(['Ver página pública ↗', 'ghost', url('rifa', { slug: r.slug })]);
  return acciones;
}

function detalle(codigo) {
  const cargar = () => cargarSeccion(pagina, {
    textoCargando: 'Cargando rifa…',
    cargar: async () => {
      const lista = await adminService.listarRifas();
      const encontrada = lista.find(r => r.codigo === codigo.toUpperCase());
      return encontrada ? adminService.obtenerRifa(encontrada.id) : null;
    },
    esVacio: r => !r,
    vacio: { icono: '🔍', titulo: 'No encontramos esa rifa', texto: `No hay ninguna rifa con el código ${codigo}.`, accion: { texto: 'Ver todas las rifas', href: url('adminRifas') } },
    mostrar: r => dibujarDetalle(r, cargar),
  });
  cargar();
}

function dibujarDetalle(r, recargar) {
  document.title = `DaleChance · ${r.producto.nombre} · Admin`;
  const c = r.config;
  const f = r.fechas ?? {};
  const fechas = [['Creada', f.creada], ['Publicada', f.publicada], ['Límite de armado', f.limiteArmado], ['Límite de captación', f.limiteCaptacion],
    ['Confirmada', f.confirmada], ['Cierre', f.cierre], ['Sorteo', f.sorteo], ['Cancelada', f.cancelada], ['Descartada', f.descartada]].filter(([, v]) => v);
  const acciones = accionesPorEstado(r, recargar);

  pagina.innerHTML = `
    <a class="enlace admin-volver" href="${url('adminRifas')}">← Todas las rifas</a>
    <div class="admin-titulo">
      <div>
        <h1 class="pagina-titulo">${r.producto.emoji} ${esc(r.producto.nombre)}</h1>
        <p class="pagina-sub">${esc(r.codigo)} · ${esc(r.categoria)} · ${badgeAdmin(r)}</p>
      </div>
    </div>
    <div class="admin-detalle">
      <section class="card ancho" aria-labelledby="acciones-titulo">
        <h2 id="acciones-titulo">Acciones</h2>
        <div class="admin-acciones">
          ${acciones.map(([texto, variante, destino], i) => typeof destino === 'string'
            ? `<a class="btn btn-${variante}" href="${esc(destino)}">${texto}</a>`
            : `<button type="button" class="btn btn-${variante}" data-accion="${i}">${texto}</button>`).join('')}
        </div>
        ${r.motivo ? `<p class="admin-nota">Motivo registrado: ${esc(r.motivo)}</p>` : ''}
        <p class="admin-nota">Las acciones marcadas como Demo simulan procesos automáticos que en la Fase 1 hará el servidor.</p>
      </section>

      <section class="card" aria-labelledby="internos-titulo">
        <h2 id="internos-titulo">Datos internos</h2>
        <p class="admin-nota">Solo los ve el equipo. El público ve personas y % de avance.</p>
        ${barraAvance(r.progreso)}
        <dl class="datos">
          ${fila('Precio referencial', soles(r.producto.precioTienda))}
          ${fila('Margen', `${r.margenPct} % · ${soles(r.margen)}`)}
          ${fila('Meta', puntos(r.meta))}
          ${fila('Chances reunidas', puntos(r.puntosReunidos))}
          ${fila('Opciones vendidas', opciones(r.opcionesVendidas))}
          ${fila('Personas', r.participantes.toLocaleString('es-PE'))}
          ${fila('Máximo por persona', puntos(r.maxPorParticipante))}
          ${['CAPTANDO', 'PROPUESTA', 'REVISION_LINK'].includes(r.estado) ? fila('Umbral de visibilidad', puntos(r.umbral)) : ''}
        </dl>
      </section>

      <section class="card" aria-labelledby="config-titulo">
        <h2 id="config-titulo">Configuración</h2>
        <dl class="datos">
          ${fila('Ventana de armado', `${c.ventanaArmadoDias} días`)}
          ${fila('Tiempo abierta', `${c.tiempoAbiertaDias} días`)}
          ${fila('Tope de opciones', c.topeTickets == null ? 'Sin tope' : opciones(c.topeTickets))}
          ${fila('Mínimo por persona', puntos(c.minPorParticipante))}
          ${fila('Máximo por persona', `${c.maxPorParticipantePct} % de la meta`)}
          ${fila('Permite retirar Chances', c.permiteRetiro ? 'Sí' : 'No')}
        </dl>
      </section>

      <section class="card" aria-labelledby="producto-titulo">
        <h2 id="producto-titulo">Producto y link</h2>
        <dl class="datos">
          ${fila('Autor', r.autor.tipo === 'ADMIN' ? 'Administración' : esc(r.autorApodo ?? r.autor.tipo))}
          ${fila('Estado del link', { VALIDO: 'Válido', EN_REVISION: 'En revisión', REEMPLAZADO: 'Reemplazado' }[r.estadoLink] ?? esc(r.estadoLink))}
          ${fila('Link original', `<span class="texto-mono">${esc(r.linkOriginal)}</span>`)}
          ${r.linkCompra !== r.linkOriginal ? fila('Link de compra', `<span class="texto-mono">${esc(r.linkCompra)}</span>`) : ''}
          ${r.hashLista ? fila('Huella de la lista', `<span class="texto-mono">${esc(r.hashLista)}</span>`) : ''}
          ${r.ganadorApodo ? fila('Ganador', `${esc(r.ganadorApodo)} (#${r.sorteo?.ticketGanador ?? '—'})`) : ''}
        </dl>
      </section>

      <section class="card" aria-labelledby="fechas-titulo">
        <h2 id="fechas-titulo">Fechas</h2>
        <dl class="datos">${fechas.map(([t, v]) => fila(t, esc(fechaHora(v)))).join('')}</dl>
      </section>

      <section class="card ancho" aria-labelledby="historial-titulo">
        <h2 id="historial-titulo">Historial de estados</h2>
        <div class="tabla-scroll">
          <table class="tabla">
            <thead><tr><th scope="col">Fecha</th><th scope="col">De</th><th scope="col">A</th><th scope="col">Quién</th><th scope="col">Motivo</th></tr></thead>
            <tbody>${[...r.historial].reverse().map(h => `
              <tr><td>${esc(fechaHora(h.fecha))}</td><td>${esc(h.desde ? NOMBRE_ESTADO[h.desde] : '—')}</td><td>${esc(NOMBRE_ESTADO[h.hacia])}</td>
              <td>${esc(h.actor)}</td><td>${esc(h.motivo ?? '—')}</td></tr>`).join('')}</tbody>
          </table>
        </div>
      </section>
    </div>`;

  pagina.querySelectorAll('[data-accion]').forEach(b => b.addEventListener('click', () => acciones[Number(b.dataset.accion)][2]()));
}

if (permitido) {
  const codigo = parametro('codigo');
  if (codigo) detalle(codigo); else listado();
}
