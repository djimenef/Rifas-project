// Generadores de identificadores.

/** Sin caracteres confusos: ni 0/O ni 1/I/L (invariante 22). */
export const ALFABETO_CODIGO = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';

const aleatorio = n => {
  const bytes = new Uint8Array(n);
  crypto.getRandomValues(bytes);
  return bytes;
};

/** Código visible de rifa, p. ej. 'RF-7K3Q9XM2'. */
export function generarCodigoRifa() {
  return 'RF-' + [...aleatorio(8)].map(b => ALFABETO_CODIGO[b % ALFABETO_CODIGO.length]).join('');
}

/** ¿El código cumple el formato y no usa caracteres confusos? */
export const esCodigoRifaValido = codigo => new RegExp(`^RF-[${ALFABETO_CODIGO}]{8}$`).test(codigo ?? '');

/** Identificador interno con prefijo, p. ej. 'mov-k3f9a2'. */
export const nuevoId = prefijo => `${prefijo}-${[...aleatorio(6)].map(b => b.toString(36).padStart(2, '0')).join('').slice(0, 10)}`;

/** Clave de idempotencia: se genera al abrir la confirmación (README §7.10). */
export const nuevaClaveIdempotencia = () =>
  (crypto.randomUUID ? crypto.randomUUID() : [...aleatorio(16)].map(b => b.toString(16).padStart(2, '0')).join(''));

/** 'PlayStation 5 Slim' → 'playstation-5-slim' */
export const slugificar = texto => String(texto)
  .normalize('NFD').replace(/[̀-ͯ]/g, '')
  .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
  .slice(0, 60);
