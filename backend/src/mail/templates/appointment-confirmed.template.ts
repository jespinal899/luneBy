import { Appointment } from '../../appointments/entities';

const DAY_NAMES = [
  'domingo',
  'lunes',
  'martes',
  'miércoles',
  'jueves',
  'viernes',
  'sábado',
];

const formatDate = (isoDate: string): string => {
  const d = new Date(`${isoDate}T00:00:00`);
  return `${DAY_NAMES[d.getDay()]} ${d.getDate()} de ${d.toLocaleDateString('es-HN', { month: 'long' })}`;
};

const formatLps = (amount: number): string =>
  `L. ${Math.round(amount).toLocaleString('es-HN')}`;

/** Primer nombre, que es como se saluda a alguien de verdad. */
const firstName = (fullName: string): string =>
  fullName.trim().split(/\s+/)[0] || fullName;

/**
 * Correo para la clienta cuando la administradora acepta su cita.
 *
 * Es la primera confirmación real que recibe: al reservar la cita queda
 * pendiente y solo la administradora sabe si el horario aguanta. Por eso
 * este correo repite la fecha, la hora y lo reservado — es lo que la clienta
 * va a buscar después para acordarse.
 */
export const buildAppointmentConfirmedEmail = (
  appointment: Appointment,
): { subject: string; html: string } => {
  const { user, date, startTime, items, priceAtBooking, service } = appointment;

  const subject = `¡Tu cita quedó confirmada! · ${formatDate(date)} a las ${startTime}`;

  // Las citas viejas pueden no tener líneas: ahí se cae al servicio base.
  const lines = items?.length
    ? items.map((i) => i.nameAtBooking)
    : [service?.name].filter(Boolean);

  const rows = lines
    .map((name) => `<tr><td style="padding:4px 0;">${name}</td></tr>`)
    .join('');

  const total =
    priceAtBooking != null
      ? `<p style="margin:0;color:#555;font-size:14px;">Total: <strong>${formatLps(priceAtBooking)}</strong></p>`
      : '';

  const html = `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
      <h2 style="color:#5b2a86;">¡Bienvenida, ${firstName(user.fullName)}!</h2>

      <p>Tu cita quedó <strong>confirmada</strong>. Te esperamos con muchas
        ganas el <strong>${formatDate(date)}</strong> a las
        <strong>${startTime}</strong>.</p>

      <table style="width:100%;border-collapse:collapse;margin:16px 0;">
        ${rows}
      </table>

      ${total}

      <p style="color:#555;font-size:14px;margin-top:16px;">
        Si te surge algo y no puedes venir, cancélala desde "Mis citas" para
        que podamos liberar el horario.
      </p>

      <p style="color:#5b2a86;margin-top:24px;">¡Nos vemos pronto!</p>
    </div>
  `;

  return { subject, html };
};
