// Admin · Usuarios (/admin/usuarios): listado con filtros por rol y estado y búsqueda · detalle (?id=) con
// billetera y movimientos · ajuste de saldo con motivo (queda en el historial del participante).
import { listo } from '../layout.js';
import { adminService } from '../services/index.js';
import { url, parametro } from '../lib/rutas.js';
import { esc } from '../lib/html.js';
import { puntos, fechaHora, fechaLarga } from '../lib/formato.js';
import { cargarSeccion } from '../components/estados.js';
import { modalAccion } from '../components/admin-rifas.js';
import { ETIQUETA_MOVIMIENTO } from '../domain/billetera.js';

const pagina = document.getElementById('pagina');
const { permitido } = await listo;

const ROL = { PARTICIPANTE: 'Participante', ADMIN: 'Administrador' };
const ESTADO = { ACTIVO: 'Activo', PENDIENTE_VERIFICACION: 'Sin verificar', BLOQUEADO: 'Bloqueado' };
const normalizar = s => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const fila = (dt, dd) => `<div><dt>${esc(dt)}</dt><dd>${dd}</dd></div>`;
const conSigno = n => (n > 0 ? '+' : n < 0 ? '−' : '') + Math.abs(n).toLocaleString('es-PE');

// ---------- Listado ----------

function filaUsuario(u) {
  return `
    <tr>
      <td><div class="tabla-rifa"><span aria-hidden="true">👤</span>
        <div><a href="${url('adminUsuarios', { id: u.id })}">${esc(u.apodo)}</a><small>${esc(u.nombres)} ${esc(u.apellidos)}</small></div></div></td>
      <td>${esc(u.correo)}</td>
      <td>${esc(ROL[u.rol])}${u.creadorVerificado ? ' ⭐' : ''}</td>
      <td><span class="badge">${esc(ESTADO[u.estado] ?? u.estado)}</span></td>
      <td class="num">${u.rol === 'ADMIN' ? '—' : u.disponible.toLocaleString('es-PE')}</td>
      <td class="num">${u.rol === 'ADMIN' ? '—' : u.retenido.toLocaleString('es-PE')}</td>
      <td><div class="tabla-acciones"><a class="btn btn-ghost btn-sm" href="${url('adminUsuarios', { id: u.id })}">Ver detalle</a></div></td>
    </tr>`;
}

function listado() {
  pagina.innerHTML = `
    <div class="admin-titulo">
      <div>
        <h1 class="pagina-titulo">Usuarios</h1>
        <p class="pagina-sub">Participantes y administradores, con sus Chances disponibles y retenidas.</p>
      </div>
    </div>
    <form class="filtros" id="filtros" role="search" aria-label="Filtrar usuarios">
      <label>Buscar<input type="search" id="busqueda" placeholder="Apodo, nombre o correo" autocomplete="off"></label>
      <label>Rol<select id="rol"><option value="">Todos los roles</option>${Object.entries(ROL).map(([k, v]) => `<option value="${k}">${v}</option>`).join('')}</select></label>
      <label>Estado<select id="estado"><option value="">Todos los estados</option>${Object.entries(ESTADO).map(([k, v]) => `<option value="${k}">${v}</option>`).join('')}</select></label>
    </form>
    <div id="tabla"></div>`;

  const busqueda = pagina.querySelector('#busqueda');
  const rol = pagina.querySelector('#rol');
  const estado = pagina.querySelector('#estado');
  const tabla = pagina.querySelector('#tabla');
  busqueda.value = parametro('q') ?? '';
  rol.value = ROL[parametro('rol')] ? parametro('rol') : '';
  estado.value = ESTADO[parametro('estado')] ? parametro('estado') : '';

  const cargar = () => {
    const query = new URLSearchParams(Object.entries({ q: busqueda.value.trim(), rol: rol.value, estado: estado.value }).filter(([, v]) => v));
    history.replaceState(null, '', location.pathname + (query.size ? '?' + query : ''));
    cargarSeccion(tabla, {
      textoCargando: 'Cargando usuarios…',
      cargar: async () => {
        const q = normalizar(busqueda.value.trim());
        return (await adminService.listarUsuarios())
          .filter(u => (!rol.value || u.rol === rol.value) && (!estado.value || u.estado === estado.value))
          .filter(u => !q || [u.apodo, `${u.nombres} ${u.apellidos}`, u.correo].some(t => normalizar(t).includes(q)));
      },
      vacio: { icono: '👥', titulo: 'No hay usuarios con esos filtros', texto: 'Prueba con otro rol, estado o búsqueda.' },
      mostrar: usuarios => {
        tabla.innerHTML = `
          <div class="tabla-scroll">
            <table class="tabla">
              <caption>${usuarios.length} ${usuarios.length === 1 ? 'usuario' : 'usuarios'}</caption>
              <thead><tr>
                <th scope="col">Usuario</th><th scope="col">Correo</th><th scope="col">Rol</th><th scope="col">Estado</th>
                <th scope="col" class="num">Disponibles</th><th scope="col" class="num">Retenidas</th><th scope="col"><span class="sr-solo">Acciones</span></th>
              </tr></thead>
              <tbody>${usuarios.map(filaUsuario).join('')}</tbody>
            </table>
          </div>`;
      },
    });
  };

  let espera;
  busqueda.addEventListener('input', () => { clearTimeout(espera); espera = setTimeout(cargar, 300); });
  rol.addEventListener('change', cargar);
  estado.addEventListener('change', cargar);
  pagina.querySelector('#filtros').addEventListener('submit', e => { e.preventDefault(); cargar(); });
  cargar();
}

// ---------- Detalle ----------

function modalAjuste(u, alTerminar) {
  modalAccion({
    titulo: 'Ajustar saldo',
    contenido: `
      <p class="modal-texto">Corrige las Chances disponibles de <b>${esc(u.apodo)}</b>. Queda como un movimiento de tipo <b>Ajuste</b> en su historial, con el motivo. No se puede deshacer: para revertirlo, haz otro ajuste.</p>
      <fieldset class="ajuste-tipo">
        <legend>Tipo de ajuste</legend>
        <label class="check"><input type="radio" name="signo" value="1" checked> Sumar Chances</label>
        <label class="check"><input type="radio" name="signo" value="-1"> Restar Chances</label>
      </fieldset>
      <label>Cantidad de Chances<input type="text" class="campo-numero" name="cantidad" inputmode="numeric" required></label>
      <label>Motivo (lo verá el participante)<textarea name="motivo" required maxlength="300" placeholder="Ej.: recarga aprobada por el banco que no se acreditó."></textarea></label>`,
    textoBoton: 'Registrar ajuste',
    enviar: async dialog => {
      const signo = Number(dialog.querySelector('[name="signo"]:checked').value);
      const texto = dialog.querySelector('[name="cantidad"]').value.trim();
      const cantidad = /^\d+$/.test(texto) ? signo * Number(texto) : NaN;
      const m = await adminService.ajustarSaldo(u.id, cantidad, dialog.querySelector('[name="motivo"]').value);
      return `Ajuste registrado (${m.numeroOperacion}): ${conSigno(m.deltaDisponible)} Chances.`;
    },
    alTerminar,
  });
}

function dibujarDetalle({ usuario: u, billetera: b, movimientos, rifas }, recargar) {
  document.title = `DaleChance · ${u.apodo} · Admin`;
  const participante = u.rol === 'PARTICIPANTE';
  pagina.innerHTML = `
    <a class="enlace admin-volver" href="${url('adminUsuarios')}">← Todos los usuarios</a>
    <div class="admin-titulo">
      <div>
        <h1 class="pagina-titulo">👤 ${esc(u.apodo)}</h1>
        <p class="pagina-sub">${esc(ROL[u.rol])}${u.creadorVerificado ? ' · Creador verificado ⭐' : ''} · <span class="badge">${esc(ESTADO[u.estado] ?? u.estado)}</span></p>
      </div>
      ${participante ? '<button type="button" class="btn btn-primary" id="ajustar">Ajustar saldo</button>' : ''}
    </div>
    <div class="admin-detalle">
      <section class="card" aria-labelledby="datos-titulo">
        <h2 id="datos-titulo">Datos</h2>
        <dl class="datos">
          ${fila('Nombres', esc(u.nombres))}
          ${fila('Apellidos', esc(u.apellidos))}
          ${fila('DNI', `<span class="texto-mono">${esc(u.dniEnmascarado)}</span>`)}
          ${fila('Fecha de nacimiento', esc(fechaLarga(u.fechaNacimiento + 'T12:00:00')))}
          ${fila('Correo', esc(u.correo))}
          ${fila('Celular', esc(u.celular))}
        </dl>
      </section>
      ${participante ? `
      <section class="card" aria-labelledby="billetera-titulo">
        <h2 id="billetera-titulo">Billetera</h2>
        <dl class="datos">
          ${fila('Disponibles', puntos(b.disponible))}
          ${fila('Retenidas', puntos(b.retenido))}
          ${fila('Movimientos', movimientos.length.toLocaleString('es-PE'))}
        </dl>
        <p class="admin-nota">El saldo siempre es la suma de los movimientos. Para corregirlo, registra un ajuste con motivo.</p>
      </section>
      <section class="card ancho" aria-labelledby="movimientos-titulo">
        <h2 id="movimientos-titulo">Movimientos</h2>
        ${movimientos.length ? `
        <div class="tabla-scroll">
          <table class="tabla">
            <thead><tr>
              <th scope="col">Fecha</th><th scope="col">Operación</th><th scope="col">Tipo</th><th scope="col">Rifa o motivo</th>
              <th scope="col" class="num">Disponible</th><th scope="col" class="num">Retenido</th>
            </tr></thead>
            <tbody>${movimientos.map(m => `
              <tr><td>${esc(fechaHora(m.fecha))}</td><td class="texto-mono">${esc(m.numeroOperacion)}</td><td>${esc(ETIQUETA_MOVIMIENTO[m.tipo] ?? m.tipo)}</td>
              <td>${rifas[m.rifaId] ? `<a class="enlace" href="${url('adminRifas', { codigo: rifas[m.rifaId].codigo })}">${esc(rifas[m.rifaId].producto.nombre)}</a>` : ''}${m.motivo ? `${rifas[m.rifaId] ? ' · ' : ''}${esc(m.motivo)}` : ''}${!rifas[m.rifaId] && !m.motivo ? '—' : ''}</td><td class="num">${conSigno(m.deltaDisponible)}</td><td class="num">${conSigno(m.deltaRetenido)}</td></tr>`).join('')}
            </tbody>
          </table>
        </div>` : '<p class="admin-nota">Todavía no tiene movimientos.</p>'}
      </section>` : `
      <section class="card" aria-labelledby="admin-titulo">
        <h2 id="admin-titulo">Cuenta de administración</h2>
        <p class="admin-nota">Los administradores no tienen billetera ni participan en las rifas.</p>
      </section>`}
    </div>`;
  pagina.querySelector('#ajustar')?.addEventListener('click', () => modalAjuste(u, recargar));
}

function detalle(id) {
  const cargar = () => cargarSeccion(pagina, {
    textoCargando: 'Cargando usuario…',
    cargar: async () => {
      const [datos, rifas] = await Promise.all([
        adminService.obtenerUsuario(id).catch(e => { if (e.codigo === 'NO_ENCONTRADA') return null; throw e; }),
        adminService.listarRifas(),
      ]);
      return datos && { ...datos, rifas: Object.fromEntries(rifas.map(r => [r.id, r])) };
    },
    esVacio: d => !d,
    vacio: { icono: '🔍', titulo: 'No encontramos ese usuario', texto: 'Puede que el enlace esté incompleto.', accion: { texto: 'Ver todos los usuarios', href: url('adminUsuarios') } },
    mostrar: d => dibujarDetalle(d, cargar),
  });
  cargar();
}

if (permitido) {
  const id = parametro('id');
  if (id) detalle(id); else listado();
}
