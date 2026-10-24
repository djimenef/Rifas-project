// Descarga un texto como archivo, sin servidor: se arma en el navegador.

/** @param {string} nombre nombre del archivo · @param {string} texto contenido · @param {string} [tipo] tipo MIME */
export function descargarTexto(nombre, texto, tipo = 'text/csv;charset=utf-8') {
  const enlace = document.createElement('a');
  enlace.href = URL.createObjectURL(new Blob([texto], { type: tipo }));
  enlace.download = nombre;
  document.body.append(enlace);
  enlace.click();
  enlace.remove();
  setTimeout(() => URL.revokeObjectURL(enlace.href), 1000);
}
