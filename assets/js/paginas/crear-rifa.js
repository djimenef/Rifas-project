// Proponer rifa (/crear-rifa), Fase 2: pegar link → leer título, imagen y precio → completar → enviado.
// - Link de tienda confiable y legible: la propuesta nace como Rifa Sugerida (CAPTANDO) con las Chances del autor.
// - Link sospechoso (acortado, tienda desconocida, sin datos): aviso "Link en revisión"; nace en Validando producto
//   (REVISION_LINK) y no recibe Chances hasta que el equipo lo valide o lo reemplace.
// Las reglas (cuenta verificada, límite de propuestas, rango de precio, mínimo del autor) las aplica RifasService.
import { listo } from '../layout.js';
import { rifasService, billeteraService } from '../services/index.js';
import { url, rutaActual } from '../lib/rutas.js';
import { esc } from '../lib/html.js';
import { soles, puntos } from '../lib/formato.js';
import { cargarSeccion } from '../components/estados.js';
import { mostrarError, mostrarErrores, limpiarErrores, limpiarAlEscribir } from '../components/formulario.js';
import { badgeRifa } from '../components/tarjeta-rifa.js';
import { enlaceRifa, compartirRifa } from '../components/compartir.js';
import { actualizarSaldo } from '../components/header.js';

const contenido = document.getElementById('contenido');
const { permitido, usuario } = await listo;

/** Errores del servicio que corresponden a un campo del formulario. */
function errorDeCampo(e) {
  switch (e.codigo) {
    case 'LINK_INVALIDO': return ['link', 'Pega un link válido que empiece con https://'];
    case 'CATEGORIA_INVALIDA': return ['categoriaId', e.message];
    case 'PRECIO_FUERA_DE_RANGO': return ['precioTienda', `El precio debe estar entre ${soles(e.datos.min)} y ${soles(e.datos.max)}.`];
    case 'BAJO_MINIMO': return ['puntosAutor', e.message];
    case 'SALDO_INSUFICIENTE': return ['puntosAutor', `No tienes Chances suficientes: tienes ${puntos(e.datos?.disponible ?? 0)} disponibles.`];
    default: return null;
  }
}

/** Resultado de leer el link: lo que se pudo tomar de la tienda, o el aviso de revisión. */
function lectura(l) {
  if (l.motivoRevision) {
    return `
      <div class="aviso aviso-oro" role="status">
        <span class="aviso-icono" aria-hidden="true">🔎</span>
        <div>
          <p><b>Link en revisión.</b> ${esc(l.motivoRevision)}</p>
          <p>Puedes enviar tu propuesta igual: quedará en <b>Validando producto</b> y no recibirá Chances hasta que el equipo valide el link o lo reemplace por uno equivalente de una tienda confiable.</p>
        </div>
      </div>`;
  }
  return `
    <div class="card proponer-leido" role="status">
      <span class="proponer-imagen" aria-hidden="true">${l.emoji}</span>
      <div>
        <p class="proponer-leido-titulo">Leímos esto del link <span class="proponer-ok">✓ Tienda confiable</span></p>
        <p class="proponer-leido-nombre">${esc(l.nombre ?? 'Sin título legible')}</p>
        <p class="proponer-leido-precio">${l.precio != null ? `Precio referencial: ${soles(l.precio)}` : 'No pudimos leer el precio: indícalo abajo.'}</p>
      </div>
    </div>`;
}

function formulario(categorias, disponible) {
  contenido.innerHTML = `
    <form id="form" class="proponer-form" novalidate>
      <fieldset class="card">
        <legend>1. Link del producto</legend>
        <div class="proponer-link">
          <label>Link del producto en la tienda
            <input type="url" name="link" inputmode="url" autocomplete="off" required placeholder="https://www.falabella.com.pe/producto/…">
          </label>
          <button type="button" class="btn btn-ghost" id="leer">Leer link</button>
        </div>
        <p class="field-hint">Usa el link de una tienda conocida. Los links acortados (bit.ly y similares) o de tiendas que no conocemos pasan a revisión.</p>
        <div id="lectura" aria-live="polite"></div>
      </fieldset>

      <div id="resto" hidden>
        <fieldset class="card">
          <legend>2. Datos del producto</legend>
          <label>Nombre del producto<input type="text" name="nombre" maxlength="120" required>
            <span class="field-hint">Es el título que verá la gente. Corrígelo si el link trae texto de más.</span></label>
          <div class="two">
            <label>Precio según la tienda (S/)<input type="text" name="precioTienda" inputmode="decimal" required placeholder="0"></label>
            <label>Categoría
              <select name="categoriaId" required>
                <option value="">Elige una categoría</option>
                ${categorias.map(c => `<option value="${esc(c.id)}">${c.icono} ${esc(c.nombre)}</option>`).join('')}
              </select>
            </label>
          </div>
        </fieldset>

        <fieldset class="card" id="campo-chances">
          <legend>3. Tus Chances</legend>
          <p class="proponer-nota">Para arrancar tu Rifa Sugerida pones Chances propias. Quedan retenidas como las de cualquier participante: si la rifa se arma, son tus opciones de ganar; si no, vuelven completas a tu billetera.</p>
          <label>¿Cuántas Chances quieres poner?<input type="text" name="puntosAutor" inputmode="numeric" value="1" required>
            <span class="field-hint">Tienes ${puntos(disponible)} disponibles. Hay un mínimo según el precio del producto.</span></label>
          <a class="enlace" href="${url('recargar', { volver: rutaActual() })}">Recargar Chances</a>
        </fieldset>

        <p class="form-error" id="form-error" role="alert" hidden></p>
        <button class="btn btn-primary" type="submit" id="enviar">Enviar propuesta</button>
      </div>
    </form>`;

  const form = contenido.querySelector('#form');
  const resto = form.querySelector('#resto');
  const campoChances = form.querySelector('#campo-chances');
  const zonaLectura = form.querySelector('#lectura');
  const botonLeer = form.querySelector('#leer');
  const enviar = form.querySelector('#enviar');
  const errorGeneral = form.querySelector('#form-error');
  let leido = null;   // { link, resultado } del último link leído
  limpiarAlEscribir(form);

  // Si cambia el link, hay que volver a leerlo.
  form.elements.link.addEventListener('input', () => {
    if (leido && form.elements.link.value.trim() !== leido.link) { leido = null; resto.hidden = true; zonaLectura.innerHTML = ''; }
  });

  async function leer() {
    const link = form.elements.link.value.trim();
    limpiarErrores(form);
    if (!link) { mostrarError(form, 'link', 'Pega el link del producto.'); form.elements.link.focus(); return; }
    botonLeer.disabled = true;
    botonLeer.textContent = 'Leyendo…';
    try {
      const resultado = await rifasService.leerLink(link);
      leido = { link, resultado };
      zonaLectura.innerHTML = lectura(resultado);
      form.elements.nombre.value = resultado.nombre ?? '';
      form.elements.precioTienda.value = resultado.precio ?? '';
      const revision = !!resultado.motivoRevision;
      campoChances.hidden = revision;           // en revisión no recibe Chances
      enviar.textContent = revision ? 'Enviar a revisión' : 'Enviar propuesta';
      resto.hidden = false;
      (resultado.nombre ? form.elements.categoriaId : form.elements.nombre).focus();
    } catch (e) {
      const campo = errorDeCampo(e);
      if (campo) mostrarError(form, ...campo); else mostrarError(form, 'link', e.message);
      form.elements.link.focus();
    } finally {
      botonLeer.disabled = false;
      botonLeer.textContent = 'Leer link';
    }
  }

  botonLeer.addEventListener('click', leer);
  form.elements.link.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); leer(); } });

  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (!leido) { leer(); return; }
    limpiarErrores(form);
    errorGeneral.hidden = true;
    const precio = form.elements.precioTienda.value.replace(',', '.').trim();
    const datos = {
      link: leido.link,
      nombre: form.elements.nombre.value.trim(),
      precioTienda: precio === '' ? NaN : Number(precio),
      categoriaId: form.elements.categoriaId.value,
      emoji: leido.resultado.emoji,
      puntosAutor: Number(form.elements.puntosAutor.value),
    };
    const textoBoton = enviar.textContent;
    enviar.disabled = true;
    enviar.textContent = 'Enviando…';
    try {
      enviado(await rifasService.proponer(datos));
      actualizarSaldo();   // las Chances del autor quedaron retenidas
    } catch (error) {
      enviar.disabled = false;
      enviar.textContent = textoBoton;
      const campo = errorDeCampo(error);
      if (campo) { mostrarErrores(form, { [campo[0]]: campo[1] }); return; }
      if (mostrarErrores(form, error.campos)) return;
      errorGeneral.innerHTML = error.codigo === 'LIMITE_PROPUESTAS'
        ? `Ya tienes ${error.datos.limite} propuestas activas, el máximo permitido. Espera a que alguna se resuelva. <a class="enlace" href="${url('misPropuestas')}">Ver mis propuestas</a>`
        : esc(error.message);
      errorGeneral.hidden = false;
    }
  });
}

function enviado(rifa) {
  document.querySelector('.proponer-pasos')?.remove();
  const sugerida = rifa.estado === 'CAPTANDO';
  contenido.innerHTML = `
    <div class="card proponer-enviado" role="status">
      <span class="estado-icono" aria-hidden="true">${sugerida ? '💡' : '🔎'}</span>
      <h2>${sugerida ? '¡Tu Rifa Sugerida está lista!' : 'Recibimos tu propuesta'}</h2>
      <p>${rifa.producto.emoji} <b>${esc(rifa.producto.nombre)}</b> ${badgeRifa(rifa)}</p>
      ${sugerida
        ? `<p>Comparte este enlace con tu comunidad. Solo se entra por aquí: todavía no aparece en el portal.</p>
           <p class="proponer-enlace texto-mono">${esc(enlaceRifa(rifa))}</p>
           <div class="proponer-acciones">
             <button type="button" class="btn btn-primary" id="copiar">Copiar enlace</button>
             <a class="btn btn-ghost" href="${url('misPropuestas')}">Ver mis propuestas</a>
           </div>`
        : `<p>El equipo validará el link del producto. Mientras tanto tu propuesta no recibe Chances; te avisaremos cuando pase a <b>Rifa Sugerida</b> para que la compartas.</p>
           <div class="proponer-acciones"><a class="btn btn-primary" href="${url('misPropuestas')}">Ver mis propuestas</a></div>`}
      <p class="proponer-id">ID: ${esc(rifa.codigo)}</p>
    </div>`;
  contenido.querySelector('#copiar')?.addEventListener('click', () => compartirRifa(rifa));
  contenido.querySelector('.btn').focus();
}

if (permitido) {
  if (usuario.estado === 'PENDIENTE_VERIFICACION') {
    contenido.innerHTML = `
      <div class="aviso aviso-oro" role="status">
        <span class="aviso-icono" aria-hidden="true">!</span>
        <p>Para proponer una rifa primero verifica tu cuenta. <a class="enlace" href="${url('verificar', { volver: rutaActual() })}">Verificar ahora</a></p>
      </div>`;
  } else {
    cargarSeccion(contenido, {
      textoCargando: 'Preparando el formulario…',
      cargar: async () => {
        const [categorias, billetera] = await Promise.all([rifasService.listarCategorias(), billeteraService.obtener()]);
        return { categorias, disponible: billetera.disponible };
      },
      esVacio: () => false,
      mostrar: ({ categorias, disponible }) => formulario(categorias, disponible),
    });
  }
}
