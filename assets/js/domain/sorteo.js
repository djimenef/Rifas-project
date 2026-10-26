import { sha256 } from '../lib/hash.js';
import { ALFABETO_CODIGO } from '../lib/ids.js';

// Opciones: cada Chance que entra en una Rifa Confirmada se convierte en una opción con
//  - un número correlativo dentro de la rifa (1, 2, 3…) y
//  - un código alfanumérico (p. ej. "K7Q2-M9XD") que solo conoce su dueño.
// La lista pública (CSV) tiene número y código, sin datos de quién es cada opción: nadie sabe qué opciones
// tienen los demás, pero cada persona ve sus códigos en "Mis tickets" y puede comprobar que están en la lista.

/** Código alfanumérico de una opción. La sal es secreta y propia de cada rifa: el código no se puede adivinar. */
export function codigoOpcion(sal, numero) {
  const h = sha256(`${sal}:${numero}`);
  const c = Array.from({ length: 8 }, (_, i) => ALFABETO_CODIGO[parseInt(h.slice(i * 4, i * 4 + 4), 16) % ALFABETO_CODIGO.length]).join('');
  return `${c.slice(0, 4)}-${c.slice(4)}`;
}

/** Lista pública de opciones en CSV: "opcion,codigo", una línea por opción. Su SHA-256 es la huella publicada. */
export function listaOpcionesCsv(total, sal) {
  const lineas = ['opcion,codigo'];
  for (let n = 1; n <= total; n++) lineas.push(`${n},${codigoOpcion(sal, n)}`);
  return lineas.join('\n') + '\n';
}

/** Lee el CSV publicado y devuelve los códigos que aparecen en él. */
export const codigosDeLista = csv => new Set(csv.trim().split('\n').slice(1).map(l => l.split(',')[1]));

// Sorteo: el acto técnico de elegir al ganador de una rifa (README §7.8).
// Cada Chance puesta es una opción numerada: 10 Chances = 10 opciones. Antes de elegir, la lista de opciones
// se mezcla al azar ("se chocolatea") para que las opciones de una misma persona no queden juntas, y luego se
// elige una posición de la lista mezclada.
// Todo sale de la semilla aleatoria y de la huella de la lista publicada antes de rifar: con esos dos datos,
// cualquiera puede repetir la mezcla y la elección y obtener el mismo ganador.

/** Número aleatorio reproducible para un paso: SHA-256(semilla:huella:paso), primeros 48 bits. */
const azar = (semilla, huella, paso) => parseInt(sha256(`${semilla}:${huella}:${paso}`).slice(0, 12), 16);

/**
 * Mezcla las opciones 1..total (Fisher–Yates) y elige una.
 * @param {number} total opciones de la rifa
 * @param {string} semilla semilla aleatoria del sorteo
 * @param {string} huella huella (SHA-256) de la lista publicada
 * @returns {{ mezcla: number[], posicion: number, opcion: number }} posición desde 1 en la lista mezclada
 */
export function sortearOpciones(total, semilla, huella) {
  const mezcla = Array.from({ length: total }, (_, i) => i + 1);
  for (let i = total - 1; i > 0; i--) {
    const j = azar(semilla, huella, i) % (i + 1);
    [mezcla[i], mezcla[j]] = [mezcla[j], mezcla[i]];
  }
  const indice = azar(semilla, huella, 'ganador') % total;
  return { mezcla, posicion: indice + 1, opcion: mezcla[indice] };
}
