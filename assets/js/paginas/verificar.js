// Verificar cuenta (/verificar): ingresar el código · código incorrecto · reenviar.
// Llega desde el registro con ?volver=; al verificar sigue a `volver` o a /rifas.
import { listo } from '../layout.js';
import { authService } from '../services/index.js';
import { url, destinoVolver } from '../lib/rutas.js';
import { esc } from '../lib/html.js';
import { mostrarToast } from '../components/toast.js';

const ESPERA_REENVIO = 30;   // segundos entre reenvíos

const tarjeta = document.getElementById('tarjeta');
const form = document.getElementById('form');
const codigo = document.getElementById('codigo');
const enviar = document.getElementById('enviar');
const reenviar = document.getElementById('reenviar');
const ayuda = document.getElementById('codigo-ayuda');
const textoAyuda = ayuda.textContent;

const { permitido, usuario } = await listo;

function mostrarListo(titulo, texto) {
  const destino = destinoVolver(usuario?.rol === 'ADMIN' ? url('admin') : url('rifas'));
  tarjeta.innerHTML = `
    <div class="verificar-listo" role="status">
      <span class="estado-icono" aria-hidden="true">✓</span>
      <h2>${esc(titulo)}</h2>
      <p>${esc(texto)}</p>
      <a class="btn btn-primary" href="${esc(destino)}">Continuar</a>
    </div>`;
  tarjeta.querySelector('a').focus();
}

function mostrarError(texto) {
  ayuda.textContent = texto;
  ayuda.className = 'field-error';
  codigo.setAttribute('aria-invalid', 'true');
}

function limpiarError() {
  ayuda.textContent = textoAyuda;
  ayuda.className = 'field-hint';
  codigo.removeAttribute('aria-invalid');
}

if (permitido) {
  if (usuario.estado !== 'PENDIENTE_VERIFICACION') {
    document.getElementById('sub').textContent = 'No hay nada pendiente.';
    mostrarListo('Tu cuenta ya está verificada', 'Ya puedes recargar Chances y participar en las rifas.');
  } else {
    codigo.focus();
    codigo.addEventListener('input', () => {
      codigo.value = codigo.value.replace(/\D/g, '').slice(0, 6);
      limpiarError();
    });

    form.addEventListener('submit', async e => {
      e.preventDefault();
      if (!/^[0-9]{6}$/.test(codigo.value)) return mostrarError('Ingresa los 6 dígitos del código.');
      enviar.disabled = true;
      enviar.textContent = 'Verificando…';
      try {
        await authService.verificarCodigo(codigo.value);
        document.getElementById('sub').textContent = '¡Gracias! Confirmamos tu correo y tu celular.';
        mostrarListo('¡Cuenta verificada!', 'Ya puedes recargar Chances y participar en las rifas.');
      } catch (error) {
        enviar.disabled = false;
        enviar.textContent = 'Verificar';
        mostrarError(error.message);
        codigo.select();
      }
    });

    reenviar.addEventListener('click', async () => {
      reenviar.disabled = true;
      try {
        const { enviadoA } = await authService.reenviarCodigo();
        mostrarToast(`Enviamos un código nuevo a ${enviadoA}`);
        let s = ESPERA_REENVIO;
        const tick = () => {
          reenviar.textContent = s > 0 ? `Reenviar código (${s} s)` : 'Reenviar código';
          if (s-- <= 0) { reenviar.disabled = false; clearInterval(t); }
        };
        const t = setInterval(tick, 1000);
        tick();
      } catch (error) {
        reenviar.disabled = false;
        mostrarToast(error.message, { tipo: 'error' });
      }
    });
  }
}
