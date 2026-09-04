import type { Appointment } from '@/api/types';

const pad = (n: number) => String(n).padStart(2, '0');
const localISO = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export interface DashboardStats {
  kpis: {
    citasHoy: number;
    citasSemana: number;
    ingresosMes: number;
    clientas: number;
  };
  weekBookings: { day: string; date: string; value: number }[];
  todaySchedule: Appointment[];
  topServices: { name: string; count: number; revenue: number }[];
}

/** Lo que se cobró por una cita: el precio congelado al reservar, o el actual
 *  del servicio si la cita es anterior a que se guardara ese dato. */
const chargedPrice = (a: Appointment) => a.priceAtBooking ?? a.service.price;

/** Deriva las métricas del panel a partir de la agenda completa. */
export const computeDashboard = (appointments: Appointment[]): DashboardStats => {
  const today = localISO(new Date());
  const month = today.slice(0, 7);
  const active = appointments.filter((a) => a.status !== 'cancelled');

  const weekBookings: DashboardStats['weekBookings'] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const iso = localISO(d);
    weekBookings.push({
      day: DAY_NAMES[d.getDay()],
      date: iso,
      value: active.filter((a) => a.date === iso).length,
    });
  }

  const ingresosMes = appointments
    .filter(
      (a) =>
        a.date.startsWith(month) &&
        (a.status === 'confirmed' || a.status === 'done'),
    )
    .reduce((sum, a) => sum + chargedPrice(a), 0);

  const byService = new Map<string, { count: number; revenue: number }>();
  for (const a of active) {
    const cur = byService.get(a.service.name) ?? { count: 0, revenue: 0 };
    cur.count += 1;
    cur.revenue += chargedPrice(a);
    byService.set(a.service.name, cur);
  }

  return {
    kpis: {
      citasHoy: active.filter((a) => a.date === today).length,
      citasSemana: weekBookings.reduce((sum, d) => sum + d.value, 0),
      ingresosMes,
      clientas: new Set(active.map((a) => a.user.id)).size,
    },
    weekBookings,
    todaySchedule: active
      .filter((a) => a.date === today)
      .sort((a, b) => a.startTime.localeCompare(b.startTime)),
    topServices: [...byService.entries()]
      .map(([name, v]) => ({ name, ...v }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5),
  };
};
