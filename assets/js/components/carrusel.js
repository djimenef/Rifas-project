// Carrusel reutilizable: avance automático en un solo sentido, flechas, puntos, teclado (← →) y deslizar.
// Se pausa al pasar el mouse, al recibir foco o con la pestaña oculta, y no avanza solo si el sistema
// pide "reducir movimiento".
//
// Estructura esperada:
//   <section aria-roledescription="carrusel" aria-label="…">
//     <div class="carrusel-ventana"><div class="carrusel-pista"> diapositivas </div></div>
//     <div class="carrusel-controles" hidden>
//       <button class="carrusel-flecha" data-direccion="-1">‹</button>
//       <div class="carrusel-puntos"></div>
//       <button class="carrusel-flecha" data-direccion="1">›</button>
//     </div>
//   </section>

/**
 * @param {HTMLElement} raiz
 * @param {{ intervalo?: number, nombre?: (i: number, total: number) => string }} [opciones]
 */
export function montarCarrusel(raiz, { intervalo = 6000, nombre = (i, total) => `Ir a la ${i + 1} de ${total}` } = {}) {
  const pista = raiz.querySelector('.carrusel-pista');
  const diapositivas = [...pista.children];
  const controles = raiz.querySelector('.carrusel-controles');
  const total = diapositivas.length;
  if (total < 2) { controles.hidden = true; return; }

  const zonaPuntos = controles.querySelector('.carrusel-puntos');
  zonaPuntos.innerHTML = diapositivas.map((_, i) =>
    `<button type="button" class="carrusel-punto" aria-label="${nombre(i, total)}"></button>`).join('');
  const puntos = [...zonaPuntos.children];
  controles.hidden = false;

  const reducirMovimiento = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let actual = 0, temporizador = null;
  const pausas = new Set();

  function ir(i) {
    actual = (i + total) % total;
    pista.style.transform = `translateX(${-100 * actual}%)`;
    diapositivas.forEach((d, n) => {
      const visible = n === actual;
      d.setAttribute('aria-hidden', String(!visible));
      d.tabIndex = visible ? 0 : -1;
    });
    puntos.forEach((p, n) => p.setAttribute('aria-current', String(n === actual)));
  }

  function programar() {
    clearInterval(temporizador);
    if (!reducirMovimiento && pausas.size === 0) temporizador = setInterval(() => ir(actual + 1), intervalo);
  }
  const pausar = (motivo, si) => { si ? pausas.add(motivo) : pausas.delete(motivo); programar(); };
  const moverManual = i => { ir(i); programar(); };

  controles.querySelectorAll('[data-direccion]').forEach(b =>
    b.addEventListener('click', () => moverManual(actual + Number(b.dataset.direccion))));
  puntos.forEach((p, n) => p.addEventListener('click', () => moverManual(n)));

  raiz.addEventListener('mouseenter', () => pausar('mouse', true));
  raiz.addEventListener('mouseleave', () => pausar('mouse', false));
  raiz.addEventListener('focusin', () => pausar('foco', true));
  raiz.addEventListener('focusout', e => { if (!raiz.contains(e.relatedTarget)) pausar('foco', false); });
  document.addEventListener('visibilitychange', () => pausar('pestaña', document.hidden));
  raiz.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') { e.preventDefault(); moverManual(actual + 1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); moverManual(actual - 1); }
  });

  // Deslizar con el dedo o arrastrar con el mouse. Si hubo arrastre, se cancela el clic del enlace.
  let inicioX = null, huboArrastre = false;
  diapositivas.forEach(d => d.setAttribute('draggable', 'false'));
  pista.addEventListener('pointerdown', e => { inicioX = e.clientX; huboArrastre = false; });
  pista.addEventListener('pointerup', e => {
    if (inicioX === null) return;
    const dx = e.clientX - inicioX;
    inicioX = null;
    if (Math.abs(dx) > 40) { huboArrastre = true; moverManual(actual + (dx < 0 ? 1 : -1)); }
  });
  pista.addEventListener('click', e => { if (huboArrastre) { e.preventDefault(); huboArrastre = false; } }, true);

  ir(0);
  programar();
}
