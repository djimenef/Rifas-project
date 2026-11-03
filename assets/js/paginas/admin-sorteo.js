// Admin · Rifar (elegir ganador) (/admin/sorteo/?codigo=): lista congelada y huella · ejecutar · resultado.
// El sorteo (mezcla al azar y elección de una opción) lo hace AdminService.sortear (README §7.8).
// Aquí se puede comprobar la huella del CSV y repetir el cálculo con la semilla publicada.
import { listo } from '../layout.js';
import { adminService, rifasService } from '../services/index.js';
import { url, parametro } from '../lib/rutas.js';
import { esc } from '../lib/html.js';
import { opciones, fechaHora } from '../lib/formato.js';
import { sha256 } from '../lib/hash.js';
import { descargarTexto } from '../lib/descarga.js';
import { sortearOpciones } from '../domain/sorteo.js';
import { ESTADOS_CON_GANADOR } from '../domain/rifa.js';
import { NOMBRE_ESTADO } from '../components/badge.js';
import { cargarSeccion } from '../components/estados.js';
import { badgeAdmin, modalConfirmar } from '../components/admin-rifas.js';
import { mostrarToast } from '../components/toast.js';

const pagina = document.getElementById('pagina');
const { permitido } = await listo;

const fila = (dt, dd) => `<div><dt>${esc(dt)}</dt><dd>${dd}</dd></div>`;
const aviso = (tipo, icono, texto) => `<p class="aviso aviso-${tipo}" role="status"><span class="aviso-icono" aria-hidden="true">${icono}</span><span>${texto}</span></p>`;

function bloqueEjecutar(r) {
  const antes = r.fechaSorteo && new Date(r.fechaSorteo).getTime() > Date.now();
  return `
    <section class="card ancho" aria-labelledby="ejecutar-titulo">
      <h2 id="ejecutar-titulo">Rifa en vivo</h2>
      <ol class="sorteo-pasos">
        <li>Se toma la lista congelada de ${opciones(r.opcionesVendidas)} y su huella publicada.</li>
        <li>Se genera una semilla aleatoria.</li>
        <li>Con la semilla y la huella, las opciones se mezclan al azar y se elige una posición de la lista mezclada.</li>
        <li>Se publican la semilla, la opción ganadora, su posición y el apodo de quien ganó.</li>
      </ol>
      ${antes ? aviso('oro', '!', `En la Fase 0 puedes rifar antes de la fecha anunciada (<b>${esc(fechaHora(r.fechaSorteo))}</b>) para la demostración.`) : ''}
      <div class="admin-acciones"><button type="button" class="btn btn-primary" id="rifar">🎲 Rifar ahora</button></div>
    </section>`;
}

function bloqueResultado(r) {
  const s = r.sorteo ?? {};
  const verificable = s.posicion && s.semilla && r.hashLista;
  return `
    <section class="card ancho sorteo-resultado" aria-labelledby="resultado-titulo">
      <h2 id="resultado-titulo">Resultado</h2>
      <p class="sorteo-ganador"><span aria-hidden="true">🏆</span> <b>${esc(r.ganadorApodo ?? '—')}</b> · opción #${s.ticketGanador ?? '—'}</p>
      <dl class="datos">
        ${s.fecha ? fila('Se rifó el', esc(fechaHora(s.fecha))) : ''}
        ${s.semilla ? fila('Semilla aleatoria', `<span class="texto-mono">${esc(s.semilla)}</span>`) : ''}
        ${s.posicion ? fila('Posición en la lista mezclada', `${s.posicion.toLocaleString('es-PE')} de ${(s.totalOpciones ?? r.opcionesVendidas).toLocaleString('es-PE')}`) : ''}
        ${fila('Cuenta ganadora', r.ganadorUsuarioId ? 'Participante con cuenta' : 'Participante de ejemplo (sin cuenta en los datos)')}
      </dl>
      <div id="verificacion" aria-live="polite"></div>
      <div class="admin-acciones">
        ${verificable ? '<button type="button" class="btn btn-ghost" id="verificar">Repetir el cálculo y verificar</button>'
          : '<p class="admin-nota">Rifa de ejemplo anterior a la mezcla de opciones: no tiene posición registrada para repetir el cálculo.</p>'}
        <a class="btn btn-primary" href="${url('adminEntrega', { codigo: r.codigo })}">Registrar compra y entrega</a>
        <a class="btn btn-ghost" href="${url('rifa', { slug: r.slug })}#transparencia">Ver página pública ↗</a>
      </div>
    </section>`;
}

function dibujar(r, recargar) {
  document.title = `DaleChance · Rifar ${r.producto.nombre}`;
  const rifable = r.estado === 'PROGRAMADA';
  const realizada = ESTADOS_CON_GANADOR.includes(r.estado);
  pagina.innerHTML = `
    <a class="enlace admin-volver" href="${url('adminSorteos', { vista: realizada ? 'realizadas' : undefined })}">← Sorteos</a>
    <div class="admin-titulo">
      <div>
        <h1 class="pagina-titulo">${r.producto.emoji} ${esc(r.producto.nombre)}</h1>
        <p class="pagina-sub">${esc(r.codigo)} · ${esc(r.categoria)} · ${badgeAdmin(r)}</p>
      </div>
      <a class="btn btn-ghost" href="${url('adminRifas', { codigo: r.codigo })}">Ver detalle de la rifa</a>
    </div>
    ${!rifable && !realizada ? aviso('oro', '!', `Esta rifa está en <b>${esc(NOMBRE_ESTADO[r.estado])}</b>. Solo se rifan las rifas cerradas con fecha anunciada, después de aprobar su revisión.`) : ''}
    <div class="admin-detalle">
      ${r.hashLista ? `
      <section class="card" aria-labelledby="lista-titulo">
        <h2 id="lista-titulo">Lista congelada</h2>
        <p class="admin-nota">Una opción por cada Chance, con número y código, sin datos de quién es cada una.</p>
        <dl class="datos">
          ${fila('Opciones', opciones(r.opcionesVendidas))}
          ${fila('Personas', r.participantes.toLocaleString('es-PE'))}
          ${r.fechas?.cierre ? fila('Cerrada el', esc(fechaHora(r.fechas.cierre))) : ''}
          ${r.fechaSorteo ? fila('Fecha anunciada', esc(fechaHora(r.fechaSorteo))) : ''}
          ${fila('Huella (SHA-256)', `<span class="texto-mono">${esc(r.hashLista)}</span>`)}
        </dl>
        <div id="huella" aria-live="polite"></div>
        <div class="admin-acciones">
          <button type="button" class="btn btn-ghost btn-sm" id="descargar">Descargar lista (CSV)</button>
          <button type="button" class="btn btn-ghost btn-sm" id="comprobar">Comprobar huella</button>
        </div>
      </section>` : ''}
      ${rifable ? bloqueEjecutar(r) : ''}
      ${realizada ? bloqueResultado(r) : ''}
    </div>`;

  const lista = () => rifasService.listaOpciones(r.codigo);
  pagina.querySelector('#descargar')?.addEventListener('click', async () => {
    try { const l = await lista(); descargarTexto(l.nombreArchivo, l.csv); } catch (e) { mostrarToast(e.message, { tipo: 'error' }); }
  });
  pagina.querySelector('#comprobar')?.addEventListener('click', async () => {
    const zona = pagina.querySelector('#huella');
    try {
      const l = await lista();
      zona.innerHTML = sha256(l.csv) === r.hashLista
        ? aviso('ok', '✓', `La huella del CSV (${opciones(l.total)}) coincide con la publicada.`)
        : aviso('error', '!', 'La huella del CSV NO coincide con la publicada.');
    } catch (e) { zona.innerHTML = aviso('error', '!', esc(e.message)); }
  });
  pagina.querySelector('#rifar')?.addEventListener('click', () => modalConfirmar({
    titulo: 'Rifar ahora',
    texto: `Se elige al ganador de <b>${esc(r.producto.nombre)}</b> entre ${opciones(r.opcionesVendidas)}. El resultado se publica de inmediato y no se puede deshacer.`,
    textoBoton: 'Rifar ahora',
    accion: async () => {
      const hecha = await adminService.sortear(r.id);
      return `Ganó ${hecha.ganadorApodo} con la opción #${hecha.sorteo.ticketGanador}`;
    },
    alTerminar: recargar,
  }));
  pagina.querySelector('#verificar')?.addEventListener('click', () => {
    const s = r.sorteo;
    const calculo = sortearOpciones(s.totalOpciones ?? r.opcionesVendidas, s.semilla, r.hashLista);
    pagina.querySelector('#verificacion').innerHTML = calculo.opcion === s.ticketGanador && calculo.posicion === s.posicion
      ? aviso('ok', '✓', `Verificado: con la semilla y la huella, la posición ${calculo.posicion.toLocaleString('es-PE')} de la lista mezclada es la opción #${calculo.opcion}.`)
      : aviso('error', '!', `No coincide: el cálculo da la opción #${calculo.opcion} en la posición ${calculo.posicion}.`);
  });
}

if (permitido) {
  const codigo = parametro('codigo');
  const cargar = () => cargarSeccion(pagina, {
    textoCargando: 'Cargando rifa…',
    cargar: async () => {
      if (!codigo) return null;
      const r = (await adminService.listarRifas()).find(x => x.codigo === codigo.toUpperCase());
      return r ? adminService.obtenerRifa(r.id) : null;
    },
    esVacio: r => !r,
    vacio: codigo
      ? { icono: '🔍', titulo: 'No encontramos esa rifa', texto: `No hay ninguna rifa con el código ${codigo}.`, accion: { texto: 'Ver sorteos', href: url('adminSorteos') } }
      : { icono: '🎲', titulo: 'Elige una rifa para rifar', texto: 'Entra desde la lista de sorteos.', accion: { texto: 'Ver sorteos', href: url('adminSorteos') } },
    mostrar: r => dibujar(r, cargar),
  });
  cargar();
}
