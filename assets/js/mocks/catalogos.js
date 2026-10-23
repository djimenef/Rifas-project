// Datos falsos: catálogos (categorías, paquetes de recarga, tiendas confiables) y apodos de relleno.

export const categoriasMock = [
  { id: 'cat-zapatillas', nombre: 'Zapatillas', icono: '👟', orden: 1, activa: true },
  { id: 'cat-ropa', nombre: 'Ropa', icono: '👕', orden: 2, activa: true },
  { id: 'cat-relojes', nombre: 'Relojes', icono: '⌚', orden: 3, activa: true },
  { id: 'cat-consolas', nombre: 'Consolas', icono: '🎮', orden: 4, activa: true },
  { id: 'cat-tvs', nombre: 'TVs', icono: '📺', orden: 5, activa: true },
  { id: 'cat-celulares', nombre: 'Celulares', icono: '📱', orden: 6, activa: true },
];

export const paquetesRecargaMock = [
  { id: 'p5', precio: 5, puntos: 5, activo: true },
  { id: 'p10', precio: 10, puntos: 10, activo: true },
  { id: 'p15', precio: 15, puntos: 15, activo: true },
  { id: 'p20', precio: 20, puntos: 20, activo: true },
];

/** Tiendas confiables (las mantienen los admins). Lista de ejemplo. */
export const tiendasConfiablesMock = [
  { dominio: 'falabella.com.pe', nombre: 'Falabella', activa: true },
  { dominio: 'ripley.com.pe', nombre: 'Ripley', activa: true },
  { dominio: 'plazavea.com.pe', nombre: 'Plaza Vea', activa: true },
  { dominio: 'oechsle.pe', nombre: 'Oechsle', activa: true },
  { dominio: 'hiraoka.com.pe', nombre: 'Hiraoka', activa: true },
  { dominio: 'coolbox.pe', nombre: 'Coolbox', activa: true },
  { dominio: 'tienda-ejemplo.pe', nombre: 'Tienda de ejemplo', activa: true },
];

/** Dominios de acortadores: un link así siempre pasa a revisión (README §7.11). */
export const acortadoresMock = ['bit.ly', 'tinyurl.com', 'cutt.ly', 'shorturl.at', 't.co', 'goo.gl'];

/** Productos que la "lectura simulada" del link reconoce (en la Fase 1 se leerá la página real). */
export const productosLeiblesMock = {
  'https://www.falabella.com.pe/producto/audifonos-inalambricos-anc': { nombre: 'Audífonos inalámbricos con cancelación de ruido', precio: 499, emoji: '🎧' },
  'https://www.ripley.com.pe/producto/casaca-impermeable-outdoor': { nombre: 'Casaca impermeable outdoor', precio: 329, emoji: '🧥' },
  'https://www.coolbox.pe/producto/consola-portatil-retro': { nombre: 'Consola portátil retro', precio: 259, emoji: '🎮' },
};

/** Apodos para los participantes de relleno que aparecen en la lista de tickets de cada sorteo. */
export const apodosRellenoMock = [
  'ale_pe', 'andre.v', 'brenda_l', 'cami.r', 'cesar88', 'dani_q', 'eli.m', 'fer_lima', 'gabo_23', 'hector_p',
  'isa.c', 'jose_mx', 'karla.v', 'kevin_s', 'lu_garcia', 'manu.r', 'mari_t', 'nico_p', 'pao.h', 'pepe_r',
  'raul.c', 'rosa_m', 'santi.g', 'sofi_23', 'tato_v', 'vale.r', 'wendy_c', 'xime.p', 'yeni_s', 'zoe.l',
  'chalo_77', 'pochita', 'migue.a', 'flaca_r', 'gordo_t', 'cholo.p', 'nena_s', 'brayan_c', 'juli.v', 'piero_m',
];
