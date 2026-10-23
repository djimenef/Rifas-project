// Cómo funciona (/como-funciona): explicación paso a paso. Contenido estático; solo ajusta los enlaces según la sesión.
import { listo } from '../layout.js';
import { url } from '../lib/rutas.js';

const { usuario } = await listo;

document.getElementById('cta-rifas').href = url('rifas');
const registro = document.getElementById('cta-registro');
if (usuario) {
  registro.textContent = usuario.rol === 'ADMIN' ? 'Ir al panel' : 'Recargar Chances';
  registro.href = usuario.rol === 'ADMIN' ? url('admin') : url('recargar');
} else {
  registro.href = url('registro');
}
