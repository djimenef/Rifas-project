// Mis tickets en una rifa (/mis-rifas/tickets?codigo=): las opciones del participante, cada una con su número y
// su código alfanumérico, y la verificación contra la lista pública de opciones (README §7.8).
// La verificación se hace en el navegador a propósito: el participante comprueba la lista sin confiar en el servidor.
import { listo } from '../layout.js';
import { rifasService } from '../services/index.js';
import { url, parametro } from '../lib/rutas.js';
import { esc } from '../lib/html.js';
import { puntos, opciones } from '../lib/formato.js';
import { sha256 } from '../lib/hash.js';
import { descargarTexto } from '../lib/descarga.js';
import { codigosDeLista } from '../domain/sorteo.js';
import { badgeRifa } from '../components/tarjeta-rifa.js';
import { cargarSeccion } from '../components/estados.js';
import { mostrarToast } from '../components/toast.js';

const seccion = document.getElementById('mis-tickets');
document.getElementById('volver').href = url('misRifas');

const { permitido } = await listo;

function opcionesHtml(lista) {
  return `
    <ul class="tickets-lista" aria-label="Tus opciones">
      ${lista.map(o => `<li><span class="tickets-numero">#${o.numero}</span><span class="texto-mono">${esc(o.codigo)}</span></li>`).join('')}
    </ul>`;
}

function verificacionHtml(datos) {
  if (!datos.opciones.length) return '';
  if (!datos.listaDisponible) {
    return `
      <p class="aviso"><span class="aviso-icono" aria-hidden="true">🔒</span>
        <span>Cuando la rifa pase a <b>Rifa Cerrada</b> publicaremos la lista de todas las opciones (número y código, sin nombres) para que compruebes que las tuyas están ahí.</span></p>`;
  }
  const archivo = `opciones-${datos.rifa.codigo}.csv`;
  return `
    <section class="card tickets-verificar" aria-labelledby="verificar-titulo">
      <h2 id="verificar-titulo">Verifica tus opciones en la lista pública</h2>
      <p>La lista tiene el número y el código de <b>todas</b> las opciones de la rifa, sin datos de quién es cada una: nadie sabe qué opciones tienen los demás.</p>
      <div class="tickets-acciones">
        <button type="button" class="btn btn-primary btn-sm" data-verificar>Verificar mis opciones</button>
        <button type="button" class="btn btn-ghost btn-sm" data-descargar>Descargar lista (CSV)</button>
      </div>
      <div id="resultado" role="status" aria-live="polite"></div>
      <details class="tickets-ayuda">
        <summary>¿Cómo lo verifico por mi cuenta?</summary>
        <ol>
          <li>Descarga la lista y ábrela (Excel o el bloc de notas). Busca tus códigos con Ctrl+F.</li>
          <li>Calcula la huella del archivo y compárala con la huella publicada en la rifa:
            <br>Windows: <span class="texto-mono">certutil -hashfile ${esc(archivo)} SHA256</span>
            <br>Mac o Linux: <span class="texto-mono">shasum -a 256 ${esc(archivo)}</span></li>
          <li>Si la huella coincide, la lista es la misma que se publicó antes de rifar y nadie la cambió.</li>
        </ol>
      </details>
    </section>`;
}

async function verificar(datos) {
  const resultado = document.getElementById('resultado');
  resultado.innerHTML = '<p class="aviso">Revisando la lista…</p>';
  try {
    const lista = await rifasService.listaOpciones(datos.rifa.codigo);
    const huellaOk = sha256(lista.csv) === lista.huella;
    const codigos = codigosDeLista(lista.csv);
    const faltan = datos.opciones.filter(o => !codigos.has(o.codigo));
    const ok = huellaOk && !faltan.length;
    resultado.innerHTML = `
      <p class="aviso ${ok ? 'aviso-ok' : 'aviso-error'}"><span class="aviso-icono" aria-hidden="true">${ok ? '✅' : '⚠️'}</span><span>
        ${huellaOk ? `La huella de la lista coincide con la publicada (${opciones(lista.total)} en total).` : 'La huella de la lista <b>no</b> coincide con la publicada.'}
        ${faltan.length ? `No encontramos ${opciones(faltan.length)} tuyas: ${faltan.map(o => esc(o.codigo)).join(', ')}. Escríbenos.` : `Tus ${opciones(datos.opciones.length)} están en la lista.`}
      </span></p>`;
  } catch (e) {
    resultado.innerHTML = `<p class="aviso aviso-error">${esc(e.message)}</p>`;
  }
}

async function descargar(datos) {
  try {
    const lista = await rifasService.listaOpciones(datos.rifa.codigo);
    descargarTexto(lista.nombreArchivo, lista.csv);
  } catch (e) {
    mostrarToast(e.message, { tipo: 'error' });
  }
}

function mostrar(datos) {
  const { rifa, retenido } = datos;
  seccion.innerHTML = `
    <article class="card tickets-rifa">
      <div class="tickets-cabecera">
        <h2><a class="enlace" href="${url('rifa', { slug: rifa.slug })}">${esc(rifa.producto.nombre)}</a></h2>
        ${badgeRifa(rifa)}
      </div>
      <p class="tickets-id">ID de la rifa: <span class="texto-mono">${esc(rifa.codigo)}</span></p>
      ${retenido ? `<p class="aviso aviso-oro"><span class="aviso-icono" aria-hidden="true">🔒</span><span>Tienes ${puntos(retenido)} retenidas. Cuando la rifa se confirme, cada una se convierte en una opción con su número y su código.</span></p>` : ''}
      ${datos.opciones.length
        ? `<h3 class="tickets-subtitulo">Tus opciones: ${opciones(datos.opciones.length)}</h3>${opcionesHtml(datos.opciones)}`
        : (retenido ? '' : '<p class="tickets-vacio">Todavía no tienes opciones en esta rifa.</p>')}
    </article>
    ${verificacionHtml(datos)}`;
  seccion.querySelector('[data-verificar]')?.addEventListener('click', () => verificar(datos));
  seccion.querySelector('[data-descargar]')?.addEventListener('click', () => descargar(datos));
}

if (permitido) {
  cargarSeccion(seccion, {
    textoCargando: 'Cargando tus tickets…',
    cargar: () => rifasService.misTickets(parametro('codigo')),
    esVacio: () => false,
    mostrar,
  });
}
