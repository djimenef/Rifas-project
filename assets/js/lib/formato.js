// Formato de montos, puntos y fechas para Perú.

const ZONA = 'America/Lima';
const numero = new Intl.NumberFormat('es-PE', { maximumFractionDigits: 0 });
const decimales = new Intl.NumberFormat('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** soles(2200) → 'S/ 2,200' · soles(5, true) → 'S/ 5.00' */
export const soles = (monto, conDecimales = false) => 'S/ ' + (conDecimales ? decimales : numero).format(monto);

/** puntos(1) → '1 punto' · puntos(10) → '10 puntos' */
export const puntos = n => `${numero.format(n)} ${Math.abs(n) === 1 ? 'punto' : 'puntos'}`;

/** opciones(1) → '1 opción' · opciones(5) → '5 opciones' */
export const opciones = n => `${numero.format(n)} ${Math.abs(n) === 1 ? 'opción' : 'opciones'}`;

/** '5 nov, 8:30 p. m.' */
export const fechaHora = iso => new Intl.DateTimeFormat('es-PE', {
  timeZone: ZONA, day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit',
}).format(new Date(iso)).replace('.', '');

/** '5 de noviembre de 2026' */
export const fechaLarga = iso => new Intl.DateTimeFormat('es-PE', { timeZone: ZONA, dateStyle: 'long' }).format(new Date(iso));

/** 'quedan 4 d' · 'quedan 6 h' · 'quedan 20 min' · 'vencido' */
export function tiempoRestante(iso, ahora = Date.now()) {
  const ms = new Date(iso).getTime() - ahora;
  if (ms <= 0) return 'vencido';
  const min = Math.floor(ms / 60000);
  if (min < 60) return `quedan ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 48) return `quedan ${h} h`;
  return `quedan ${Math.floor(h / 24)} d`;
}
