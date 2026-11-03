// Admin · Compra y entrega (/admin/entrega/?codigo=): registrar compra (datos y comprobante) · envío · entrega
// con DNI verificado y evidencia (README §7.12). La compra se hace fuera de la plataforma: aquí solo se registra.
// Las reglas (datos obligatorios, DNI verificado, orden de los pasos) las aplica AdminService.
// Fase 0: los archivos no se suben; se guarda su nombre.
import { listo } from '../layout.js';
import { adminService } from '../services/index.js';
import { url, parametro } from '../lib/rutas.js';
import { esc } from '../lib/html.js';
import { soles, fechaHora, fechaLarga } from '../lib/formato.js';
import { NOMBRE_ESTADO } from '../components/badge.js';
import { cargarSeccion } from '../components/estados.js';
import { badgeAdmin } from '../components/admin-rifas.js';
import { mostrarErrores, limpiarErrores, limpiarAlEscribir } from '../components/formulario.js';
import { mostrarToast } from '../components/toast.js';
import { ESTADOS_CON_GANADOR } from '../domain/rifa.js';

const pagina = document.getElementById('pagina');
const { permitido } = await listo;

const fila = (dt, dd) => `<div><dt>${esc(dt)}</dt><dd>${dd}</dd></div>`;
const hoy = () => new Date().toLocaleDateString('en-CA');      // AAAA-MM-DD en hora local
/** Fecha de un <input type="date"> a ISO, al mediodía local (así no cambia de día por la zona horaria). */
const fechaIso = valor => (valor ? new Date(`${valor}T12:00:00`).toISOString() : '');
const archivo = input => input.files?.[0]?.name ?? '';
const registradoPor = r => `<p class="admin-nota">Registrado por ${esc(r.registradoPor)} · ${esc(fechaHora(r.registradoEl))}</p>`;

const PASOS = [
  { id: 'compra', texto: 'Compra', estado: 'SORTEADA', registrado: 'Registrada', despuesDe: 'después de elegir al ganador' },
  { id: 'envio', texto: 'Envío', estado: 'COMPRANDO', registrado: 'Registrado', despuesDe: 'después de la compra' },
  { id: 'entrega', texto: 'Entrega', estado: 'EN_CAMINO', registrado: 'Registrada', despuesDe: 'después del envío' },
];

// ---------- Datos registrados ----------

function datosCompra(c) {
  return `
    <dl class="datos">
      ${fila('Fecha de compra', esc(fechaLarga(c.fecha)))}
      ${fila('Tienda', esc(c.tienda))}
      ${fila('Producto comprado', esc(c.productoComprado) + (c.esEquivalente ? ' <span class="badge">Equivalente</span>' : ''))}
      ${c.esEquivalente ? fila('Justificación', esc(c.justificacion)) : ''}
      ${fila('Monto pagado', soles(c.montoPagado, true))}
      ${fila('Boleta o factura', esc(c.numeroComprobante))}
      ${fila('Comprobante', `<span class="texto-mono">📎 ${esc(c.archivoComprobante)}</span>`)}
      ${fila('A nombre de', `${esc(c.aNombreDe.nombres)} ${esc(c.aNombreDe.apellidos)} · DNI ${esc(c.aNombreDe.dni)}`)}
    </dl>
    ${registradoPor(c)}`;
}

function datosEnvio(e) {
  return `
    <dl class="datos">
      ${fila('Modalidad', e.modalidad === 'RECOJO' ? 'Recojo en tienda' : 'Courier')}
      ${e.courier ? fila('Courier', esc(e.courier)) : ''}
      ${e.codigoSeguimiento ? fila('Código de seguimiento', `<span class="texto-mono">${esc(e.codigoSeguimiento)}</span>`) : ''}
      ${fila('Fecha estimada', esc(fechaLarga(e.fechaEstimada)))}
    </dl>
    ${registradoPor(e)}`;
}

function datosEntrega(e) {
  return `
    <dl class="datos">
      ${fila('Fecha de entrega', esc(fechaLarga(e.fecha)))}
      ${fila('Recibió', esc(e.recibidoPor))}
      ${fila('DNI físico verificado', 'Sí ✓')}
      ${fila('Evidencia', `<span class="texto-mono">📎 ${esc(e.archivoEvidencia)}</span>`)}
      ${e.observaciones ? fila('Observaciones', esc(e.observaciones)) : ''}
    </dl>
    ${registradoPor(e)}`;
}

// ---------- Formularios ----------

function formCompra(r, titular) {
  return `
    <form class="entrega-form" data-paso="compra" novalidate>
      <div class="two">
        <label>Fecha de compra<input type="date" name="fecha" value="${hoy()}" max="${hoy()}" required></label>
        <label>Tienda<input type="text" name="tienda" required placeholder="Ej.: Falabella"></label>
      </div>
      <label>Producto comprado<input type="text" name="productoComprado" value="${esc(r.producto.nombre)}">
        <span class="field-hint">Por defecto, el de la rifa.</span></label>
      <label class="check"><input type="checkbox" name="esEquivalente"> Es un producto equivalente (el original cambió o ya no existe)</label>
      <label data-solo-equivalente hidden>Justificación<textarea name="justificacion" maxlength="500" placeholder="Por qué es de igual o mayor valor."></textarea></label>
      <div class="two">
        <label>Monto pagado (S/)<input type="text" name="montoPagado" inputmode="decimal" required placeholder="0.00"></label>
        <label>N.° de boleta o factura<input type="text" name="numeroComprobante" required placeholder="B001-000123"></label>
      </div>
      <label>Foto o PDF del comprobante<input type="file" name="archivoComprobante" accept="image/*,application/pdf" required></label>
      <fieldset class="entrega-titular">
        <legend>A nombre de</legend>
        ${titular ? `
        <p>${esc(titular.nombres)} ${esc(titular.apellidos)} · DNI <span class="texto-mono">${esc(titular.dniEnmascarado)}</span></p>
        <p class="field-hint">Sale de la cuenta ganadora (${esc(r.ganadorApodo)}); no se escribe a mano.</p>` : `
        <p class="field-hint">El ganador de esta rifa de ejemplo no tiene cuenta en los datos: ingresa sus datos tal como figuran en su DNI.</p>
        <div class="tres">
          <label>Nombres<input type="text" name="aNombreDe.nombres" required></label>
          <label>Apellidos<input type="text" name="aNombreDe.apellidos" required></label>
          <label>DNI<input type="text" name="aNombreDe.dni" inputmode="numeric" maxlength="8" required></label>
        </div>`}
      </fieldset>
      <p class="form-error" role="alert" hidden></p>
      <button class="btn btn-primary" type="submit">Registrar compra</button>
    </form>`;
}

function formEnvio() {
  return `
    <form class="entrega-form" data-paso="envio" novalidate>
      <fieldset class="entrega-opciones">
        <legend>Modalidad</legend>
        <label class="check"><input type="radio" name="modalidad" value="RECOJO" checked> Recojo en tienda</label>
        <label class="check"><input type="radio" name="modalidad" value="COURIER"> Courier</label>
      </fieldset>
      <div class="two" data-solo-courier hidden>
        <label>Courier<input type="text" name="courier" placeholder="Ej.: Olva Courier"></label>
        <label>Código de seguimiento<input type="text" name="codigoSeguimiento"></label>
      </div>
      <label>Fecha estimada<input type="date" name="fechaEstimada" min="${hoy()}" required></label>
      <p class="form-error" role="alert" hidden></p>
      <button class="btn btn-primary" type="submit">Registrar envío</button>
    </form>`;
}

function formEntrega(r, titular) {
  return `
    <form class="entrega-form" data-paso="entrega" novalidate>
      <div class="two">
        <label>Fecha de entrega<input type="date" name="fecha" value="${hoy()}" max="${hoy()}" required></label>
        <label>Recibió<input type="text" name="recibidoPor" required value="${esc(titular ? `${titular.nombres} ${titular.apellidos}` : '')}"></label>
      </div>
      <div class="aviso aviso-oro" role="note">
        <span class="aviso-icono" aria-hidden="true">🪪</span>
        <p>El premio se entrega <b>solo al titular del DNI</b> de la cuenta ganadora${r.registros.compra ? ` (${esc(r.registros.compra.aNombreDe.nombres)} ${esc(r.registros.compra.aNombreDe.apellidos)})` : ''}. Pide el DNI físico y compáralo.</p>
      </div>
      <label class="check"><input type="checkbox" name="dniVerificado" required> Verifiqué el DNI físico: coincide con el titular</label>
      <label>Foto o acta de entrega<input type="file" name="archivoEvidencia" accept="image/*,application/pdf" required></label>
      <label>Observaciones (opcional)<textarea name="observaciones" maxlength="500"></textarea></label>
      <p class="form-error" role="alert" hidden></p>
      <button class="btn btn-primary" type="submit">Registrar entrega</button>
    </form>`;
}

/** Datos que se envían al servicio, por paso. */
const LEER = {
  compra: f => ({
    fecha: fechaIso(f.elements.fecha.value), tienda: f.elements.tienda.value, productoComprado: f.elements.productoComprado.value,
    esEquivalente: f.elements.esEquivalente.checked, justificacion: f.elements.justificacion.value,
    montoPagado: f.elements.montoPagado.value.trim() === '' ? NaN : Number(f.elements.montoPagado.value.replace(',', '.')),
    numeroComprobante: f.elements.numeroComprobante.value, archivoComprobante: archivo(f.elements.archivoComprobante),
    ...(f.elements['aNombreDe.dni'] ? { aNombreDe: {
      nombres: f.elements['aNombreDe.nombres'].value, apellidos: f.elements['aNombreDe.apellidos'].value, dni: f.elements['aNombreDe.dni'].value,
    } } : {}),
  }),
  envio: f => ({
    modalidad: f.elements.modalidad.value, courier: f.elements.courier.value,
    codigoSeguimiento: f.elements.codigoSeguimiento.value, fechaEstimada: fechaIso(f.elements.fechaEstimada.value),
  }),
  entrega: f => ({
    fecha: fechaIso(f.elements.fecha.value), recibidoPor: f.elements.recibidoPor.value, dniVerificado: f.elements.dniVerificado.checked,
    archivoEvidencia: archivo(f.elements.archivoEvidencia), observaciones: f.elements.observaciones.value,
  }),
};
const REGISTRAR = { compra: 'registrarCompra', envio: 'registrarEnvio', entrega: 'registrarEntrega' };
const LISTO = { compra: 'Compra registrada: el premio está en compra.', envio: 'Envío registrado: el premio está en camino.', entrega: '¡Premio entregado!' };

function activarForm(form, r, recargar) {
  const paso = form.dataset.paso;
  const boton = form.querySelector('[type="submit"]');
  const errorGeneral = form.querySelector('.form-error');
  limpiarAlEscribir(form);
  form.elements.esEquivalente?.addEventListener('change', e => { form.querySelector('[data-solo-equivalente]').hidden = !e.target.checked; });
  form.querySelectorAll('[name="modalidad"]').forEach(radio => radio.addEventListener('change', () => {
    form.querySelector('[data-solo-courier]').hidden = form.elements.modalidad.value !== 'COURIER';
  }));
  form.addEventListener('submit', async e => {
    e.preventDefault();
    limpiarErrores(form);
    errorGeneral.hidden = true;
    boton.disabled = true;
    try {
      await adminService[REGISTRAR[paso]](r.id, LEER[paso](form));
      mostrarToast(LISTO[paso]);
      recargar();
    } catch (error) {
      boton.disabled = false;
      // El error del titular viene como `aNombreDe`: se muestra junto a su DNI.
      const campos = { ...error.campos };
      if (campos.aNombreDe) { campos['aNombreDe.dni'] = campos.aNombreDe; delete campos.aNombreDe; }
      if (!mostrarErrores(form, campos)) {
        errorGeneral.textContent = error.message;
        errorGeneral.hidden = false;
      }
    }
  });
}

// ---------- Pantalla ----------

function dibujar({ r, titular }, recargar) {
  document.title = `DaleChance · Compra y entrega · ${r.producto.nombre}`;
  const registros = r.registros ?? {};
  const contenido = {
    compra: registros.compra ? datosCompra(registros.compra) : formCompra(r, titular),
    envio: registros.envio ? datosEnvio(registros.envio) : formEnvio(),
    entrega: registros.entrega ? datosEntrega(registros.entrega) : formEntrega(r, titular),
  };
  const estadoPaso = p => (registros[p.id] ? 'hecho' : r.estado === p.estado ? 'actual' : 'pendiente');

  pagina.innerHTML = `
    <a class="enlace admin-volver" href="${url('adminEntregas')}">← Compras y entregas</a>
    <div class="admin-titulo">
      <div>
        <h1 class="pagina-titulo">${r.producto.emoji} ${esc(r.producto.nombre)}</h1>
        <p class="pagina-sub">${esc(r.codigo)} · Ganador: <b>${esc(r.ganadorApodo ?? '—')}</b> (opción #${r.sorteo?.ticketGanador ?? '—'}) · ${badgeAdmin(r)}</p>
      </div>
      <a class="btn btn-ghost" href="${url('adminRifas', { codigo: r.codigo })}">Ver detalle de la rifa</a>
    </div>
    ${ESTADOS_CON_GANADOR.includes(r.estado) ? '' : `
    <p class="aviso aviso-oro" role="status"><span class="aviso-icono" aria-hidden="true">!</span><span>Esta rifa está en <b>${esc(NOMBRE_ESTADO[r.estado])}</b>: todavía no tiene ganador. Primero hay que rifarla.</span></p>`}
    <ol class="entrega-pasos" aria-label="Pasos del premio">
      ${PASOS.map((p, i) => `<li data-estado="${estadoPaso(p)}"${estadoPaso(p) === 'actual' ? ' aria-current="step"' : ''}><span aria-hidden="true">${registros[p.id] ? '✓' : i + 1}</span>${p.texto}</li>`).join('')}
    </ol>
    <p class="admin-nota entrega-nota">Solo el equipo ve estos registros (comprobante, monto, datos del ganador, evidencia). El público ve el estado y la fecha de cada paso.</p>
    <div class="entrega-registros">
      ${PASOS.map(p => {
        const estado = estadoPaso(p);
        return `
      <section class="card" data-estado="${estado}" aria-labelledby="paso-${p.id}">
        <h2 id="paso-${p.id}">${p.texto} ${estado === 'hecho' ? `<span class="badge">${p.registrado}</span>` : ''}</h2>
        ${estado === 'pendiente' ? `<p class="admin-nota">Se registra ${p.despuesDe}.</p>` : contenido[p.id]}
      </section>`;
      }).join('')}
    </div>
    <p class="admin-nota">Fase 0: los archivos no se suben; se guarda su nombre.</p>`;

  pagina.querySelectorAll('.entrega-form').forEach(f => {
    const seccion = f.closest('section');
    if (seccion.dataset.estado === 'actual') activarForm(f, r, recargar);
  });
}

if (permitido) {
  const codigo = parametro('codigo');
  const cargar = () => cargarSeccion(pagina, {
    textoCargando: 'Cargando el premio…',
    cargar: async () => {
      if (!codigo) return null;
      const encontrada = (await adminService.listarRifas()).find(x => x.codigo === codigo.toUpperCase());
      if (!encontrada) return null;
      const r = await adminService.obtenerRifa(encontrada.id);
      const titular = r.ganadorUsuarioId ? (await adminService.obtenerUsuario(r.ganadorUsuarioId)).usuario : null;
      return { r, titular };
    },
    esVacio: d => !d,
    vacio: codigo
      ? { icono: '🔍', titulo: 'No encontramos esa rifa', texto: `No hay ninguna rifa con el código ${codigo}.`, accion: { texto: 'Ver compras y entregas', href: url('adminEntregas') } }
      : { icono: '📦', titulo: 'Elige un premio', texto: 'Entra desde la lista de compras y entregas.', accion: { texto: 'Ver compras y entregas', href: url('adminEntregas') } },
    mostrar: d => dibujar(d, cargar),
  });
  cargar();
}
