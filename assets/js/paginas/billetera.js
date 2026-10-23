// Mi billetera (/billetera): saldo disponible, retenido y en qué rifas está retenido.
import { listo } from '../layout.js';
import { billeteraService } from '../services/index.js';
import { url } from '../lib/rutas.js';
import { esc } from '../lib/html.js';
import { puntos } from '../lib/formato.js';
import { cargarSeccion } from '../components/estados.js';

const { permitido } = await listo;

const seccion = document.getElementById('billetera');

if (permitido) {
  cargarSeccion(seccion, {
    textoCargando: 'Cargando tu billetera…',
    cargar: async () => {
      const [billetera, movimientos] = await Promise.all([billeteraService.obtener(), billeteraService.historial()]);
      return { ...billetera, sinMovimientos: movimientos.length === 0 };
    },
    esVacio: b => b.sinMovimientos,
    vacio: {
      icono: '👛', titulo: 'Aún no tienes Chances',
      texto: 'Recarga tus primeras Chances para participar. 1 Chance = S/ 1 = 1 opción de ganar.',
      accion: { texto: 'Recargar Chances', href: url('recargar') },
    },
    mostrar: b => {
      seccion.innerHTML = `
        <div class="saldos">
          <div class="card saldo-card saldo-disponible">
            <small>Disponible</small>
            <b>${puntos(b.disponible)}</b>
            <p>Libres para poner en cualquier rifa.</p>
          </div>
          <div class="card saldo-card">
            <small>Retenidas</small>
            <b>${puntos(b.retenido)}</b>
            <p>En rifas que se están armando. Solo se usan si la rifa se arma.</p>
          </div>
        </div>
        <div class="billetera-acciones">
          <a class="btn btn-primary" href="${url('recargar')}">Recargar</a>
          <a class="btn btn-ghost" href="${url('historial')}">Ver historial</a>
        </div>
        <section class="retenidas" aria-labelledby="retenidas-titulo">
          <h2 id="retenidas-titulo">¿Dónde están tus Chances retenidas?</h2>
          ${b.retenidoPorRifa.length ? `
          <p>Si una rifa no se arma, sus Chances vuelven completas a tu saldo disponible.</p>
          <ul class="lista-retenidas">
            ${b.retenidoPorRifa.map(r => `
            <li><a href="${url('rifa', { slug: r.slug })}">
              <span>${esc(r.nombre)}<small>ID: ${esc(r.codigo)}</small></span>
              <b>${puntos(r.puntos)}</b>
            </a></li>`).join('')}
          </ul>` : `<p>No tienes Chances retenidas ahora. <a class="enlace" href="${url('rifas')}">Ver rifas que se están armando</a></p>`}
        </section>`;
    },
  });
}
