/**
 * Datos del estudio en un solo sitio (los usan el footer y la página de
 * contacto). Actualízalos aquí cuando tengas la info definitiva.
 *
 * El horario de atención NO vive aquí: es dinámico y lo define el admin en
 * /admin/horario. Se consulta con `useSalonSchedule` + `formatScheduleLines`.
 */
export const salon = {
  name: 'Luné by Kelin',
  tagline: 'Estudio profesional de uñas',
  address: 'Choloma, Cortés, Honduras',
  phone: '+504 2525-2525',
  /** Solo dígitos, con código de país — para el enlace wa.me. */
  whatsapp: '50425252525',
  email: 'hola@lunebykelin.com',
  instagram: 'lune.bykelin',
} as const;

export const whatsappLink = (message?: string) =>
  `https://wa.me/${salon.whatsapp}${
    message ? `?text=${encodeURIComponent(message)}` : ''
  }`;
