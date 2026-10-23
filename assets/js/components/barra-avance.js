// Barra de avance de una rifa: 0–100 %, de rojo a verde.
// Solo muestra el porcentaje; nunca montos, meta ni Chances reunidas.

/**
 * @param {number} porcentaje 0 a 100
 * @returns {string} HTML de la barra
 */
export function barraAvance(porcentaje) {
  const p = Math.max(0, Math.min(100, Math.round(Number(porcentaje) || 0)));
  return `
    <div class="barra" role="progressbar" aria-label="Avance de la rifa" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${p}">
      <div class="barra-pista"><span class="barra-resto" style="--avance: ${p}%"></span></div>
      <span class="barra-valor">${p} %</span>
    </div>`;
}
