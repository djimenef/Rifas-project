// Perfil (/perfil): datos de la cuenta (DNI enmascarado) · editar apodo.
// Los datos personales no se editan aquí: vienen del registro y se validan con el DNI.
import { listo } from '../layout.js';
import { authService } from '../services/index.js';
import { url, rutaActual } from '../lib/rutas.js';
import { esc } from '../lib/html.js';
import { fechaLarga } from '../lib/formato.js';
import { cargarSeccion } from '../components/estados.js';
import { mostrarErrores, limpiarErrores, limpiarAlEscribir } from '../components/formulario.js';
import { mostrarToast } from '../components/toast.js';

const seccion = document.getElementById('perfil');
const { permitido } = await listo;

const fila = (dt, dd) => `<div><dt>${esc(dt)}</dt><dd>${dd}</dd></div>`;

function dibujar(u) {
  const pendiente = u.estado === 'PENDIENTE_VERIFICACION';
  seccion.innerHTML = `
    ${pendiente ? `
    <div class="aviso aviso-oro" role="note">
      <span class="aviso-icono" aria-hidden="true">!</span>
      <p>Tu cuenta todavía no está verificada. <a class="enlace" href="${url('verificar', { volver: rutaActual() })}">Verificar ahora</a></p>
    </div>` : ''}
    <section class="card" aria-labelledby="apodo-titulo">
      <h2 id="apodo-titulo">Tu apodo</h2>
      <p class="perfil-nota">Es tu nombre público: con él apareces si ganas una rifa.</p>
      <form id="form-apodo" class="perfil-apodo" novalidate>
        <label>Apodo<input type="text" name="apodo" value="${esc(u.apodo)}" maxlength="20" autocomplete="nickname" required aria-describedby="apodo-ayuda">
          <span class="field-hint" id="apodo-ayuda">De 3 a 20 caracteres: letras, números, punto o guion bajo.</span>
        </label>
        <button class="btn btn-primary" type="submit">Guardar apodo</button>
      </form>
    </section>

    <section class="card" aria-labelledby="datos-titulo">
      <h2 id="datos-titulo">Datos personales</h2>
      <dl class="datos">
        ${fila('Nombres', esc(u.nombres))}
        ${fila('Apellidos', esc(u.apellidos))}
        ${fila('DNI', `<span class="texto-mono">${esc(u.dniEnmascarado)}</span>`)}
        ${fila('Fecha de nacimiento', esc(fechaLarga(u.fechaNacimiento + 'T12:00:00')))}
        ${fila('Correo', esc(u.correo))}
        ${fila('Celular', esc(u.celular))}
        ${fila('Cuenta', pendiente ? 'Pendiente de verificación' : 'Verificada ✓')}
        ${u.creadorVerificado ? fila('Insignia', 'Creador verificado ⭐') : ''}
      </dl>
      <p class="perfil-nota">Tus nombres, apellidos y DNI no se pueden cambiar: el premio se compra a nombre del titular del DNI. Si hay un error, escríbenos desde el <a class="enlace" href="${url('reclamaciones')}">Libro de Reclamaciones</a>.</p>
    </section>

    <section class="card" aria-labelledby="seguridad-titulo">
      <h2 id="seguridad-titulo">Seguridad</h2>
      <p class="perfil-nota">Para cambiar tu contraseña, te enviamos un enlace a tu correo.</p>
      <div><button type="button" class="btn btn-ghost" id="cambiar-contrasena">Cambiar contraseña</button></div>
    </section>`;

  const form = seccion.querySelector('#form-apodo');
  const boton = form.querySelector('[type="submit"]');
  limpiarAlEscribir(form);
  form.addEventListener('submit', async e => {
    e.preventDefault();
    limpiarErrores(form);
    boton.disabled = true;
    boton.textContent = 'Guardando…';
    try {
      const actualizado = await authService.cambiarApodo(form.elements.apodo.value);
      form.elements.apodo.value = actualizado.apodo;
      document.querySelectorAll('.usuario-apodo').forEach(el => { el.textContent = actualizado.apodo; });
      document.getElementById('usuario-btn')?.setAttribute('aria-label', `Menú de ${actualizado.apodo}`);
      mostrarToast(`Listo: ahora eres ${actualizado.apodo}`);
    } catch (error) {
      if (!mostrarErrores(form, error.campos)) mostrarToast(error.message, { tipo: 'error' });
    } finally {
      boton.disabled = false;
      boton.textContent = 'Guardar apodo';
    }
  });

  const cambiar = seccion.querySelector('#cambiar-contrasena');
  cambiar.addEventListener('click', async () => {
    cambiar.disabled = true;
    try {
      await authService.solicitarRecuperacion(u.correo);
      mostrarToast(`Te enviamos un enlace a ${u.correo}`);
    } catch (error) {
      mostrarToast(error.message, { tipo: 'error' });
    } finally {
      cambiar.disabled = false;
    }
  });
}

if (permitido) {
  cargarSeccion(seccion, {
    textoCargando: 'Cargando tu perfil…',
    cargar: async () => (await authService.sesionActual())?.usuario ?? null,
    esVacio: u => !u,
    vacio: { icono: '👤', titulo: 'No encontramos tu cuenta', texto: 'Vuelve a iniciar sesión.', accion: { texto: 'Iniciar sesión', href: url('login') } },
    mostrar: dibujar,
  });
}
