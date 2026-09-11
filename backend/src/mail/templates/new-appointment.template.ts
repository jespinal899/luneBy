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

/** Construye el asunto y el cuerpo HTML del correo de "nueva cita pendiente". */
export const buildNewAppointmentEmail = (
  appointment: Appointment,
  adminPanelUrl: string,
): { subject: string; html: string } => {
  const { user, date, startTime, items, priceAtBooking } = appointment;

  const subject = `Nueva cita pendiente · ${user.fullName} · ${formatDate(date)} ${startTime}`;

  const rows = items
    .map(
      (item) =>
        `<tr>
          <td style="padding:4px 0;">${item.nameAtBooking}</td>
          <td style="padding:4px 0;text-align:right;">${formatLps(item.priceAtBooking)}</td>
        </tr>`,
    )
    .join('');

  const html = `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
      <h2 style="color:#5b2a86;">Nueva cita por confirmar</h2>
      <p><strong>${user.fullName}</strong> agendó una cita para el
        <strong>${formatDate(date)}</strong> a las <strong>${startTime}</strong>.</p>

      <table style="width:100%;border-collapse:collapse;margin:16px 0;">
        ${rows}
        <tr style="border-top:1px solid #ddd;font-weight:bold;">
          <td style="padding:8px 0;">Total</td>
          <td style="padding:8px 0;text-align:right;">${formatLps(priceAtBooking ?? 0)}</td>
        </tr>
      </table>

      <p style="color:#555;font-size:14px;">
        Contacto: ${user.email}${user.phone ? ` · ${user.phone}` : ''}
      </p>

      <a href="${adminPanelUrl}"
         style="display:inline-block;margin-top:16px;padding:10px 20px;
                background:#5b2a86;color:#fff;text-decoration:none;
                border-radius:8px;">
        Ver y confirmar en el panel
      </a>
    </div>
  `;

  return { subject, html };
};
