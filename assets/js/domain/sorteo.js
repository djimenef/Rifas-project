import { sha256 } from '../lib/hash.js';

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
