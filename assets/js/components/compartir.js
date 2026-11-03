import { url } from '../lib/rutas.js';
import { mostrarToast } from './toast.js';

// Compartir una rifa: copia su enlace público (/r/?slug=). Las Rifas Sugeridas solo se abren por este enlace.

/** Enlace completo de la rifa, listo para pegar en redes o mensajes. */
export const enlaceRifa = rifa => location.origin + url('rifa', { slug: rifa.slug });

/** Copia el enlace al portapapeles; si el navegador no lo permite, lo muestra para copiarlo a mano. */
export async function compartirRifa(rifa) {
  const enlace = enlaceRifa(rifa);
  try {
    await navigator.clipboard.writeText(enlace);
    mostrarToast('Enlace copiado. ¡Compártelo!');
  } catch {
    mostrarToast(`Copia este enlace: ${enlace}`, { duracion: 6000 });
  }
}
