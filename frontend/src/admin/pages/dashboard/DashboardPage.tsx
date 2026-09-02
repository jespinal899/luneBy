import {
    CalendarCheck,
    Clock,
    Users,
    Wallet,
    ArrowUpRight,
    ArrowDownRight,
    MoreHorizontal,
    Scissors,
    Sparkles,
    Star,
} from 'lucide-react';
import { AdminTitle } from '@/admin/components/AdminTitle';

const kpis = [
    {
        title: 'Citas de hoy',
        value: '18',
        delta: '+3',
        trend: 'up' as const,
        hint: 'vs. ayer',
        icon: CalendarCheck,
    },
    {
        title: 'Ingresos del mes',
        value: '$6.480',
        delta: '+14,2%',
        trend: 'up' as const,
        hint: 'vs. mes anterior',
        icon: Wallet,
    },
    {
        title: 'Clientas activas',
        value: '312',
        delta: '+21',
        trend: 'up' as const,
        hint: 'últimos 30 días',
        icon: Users,
    },
    {
        title: 'Tasa de ausencias',
        value: '4,7%',
        delta: '-1,3%',
        trend: 'down' as const,
        hint: 'vs. mes anterior',
        icon: Clock,
    },
];

const weekBookings = [
    { day: 'Lun', value: 12 },
    { day: 'Mar', value: 17 },
    { day: 'Mié', value: 15 },
    { day: 'Jue', value: 21 },
    { day: 'Vie', value: 26 },
    { day: 'Sáb', value: 29 },
    { day: 'Dom', value: 6 },
];

const schedule = [
    { time: '09:00', client: 'Valentina Ríos', service: 'Corte + Brushing', staff: 'Kelin', status: 'Confirmada' },
    { time: '10:30', client: 'Camila Duarte', service: 'Balayage', staff: 'Andrea', status: 'Confirmada' },
    { time: '12:00', client: 'Sofía Meléndez', service: 'Manicura semipermanente', staff: 'Rocío', status: 'En espera' },
    { time: '14:00', client: 'Lucía Fernández', service: 'Tratamiento de keratina', staff: 'Kelin', status: 'Confirmada' },
    { time: '16:30', client: 'Martina Ojeda', service: 'Maquillaje social', staff: 'Andrea', status: 'Pendiente pago' },
];

const topServices = [
    { name: 'Balayage', bookings: 48, revenue: '$2.160' },
    { name: 'Corte + Brushing', bookings: 71, revenue: '$1.420' },
    { name: 'Manicura semipermanente', bookings: 63, revenue: '$945' },
    { name: 'Tratamiento de keratina', bookings: 22, revenue: '$1.320' },
];

const staff = [
    { name: 'Kelin Domínguez', role: 'Estilista senior', load: 92, rating: 4.9 },
    { name: 'Andrea Sosa', role: 'Colorista', load: 78, rating: 4.8 },
    { name: 'Rocío Vega', role: 'Manicurista', load: 64, rating: 4.7 },
];

const statusStyle: Record<string, string> = {
    Confirmada: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    'En espera': 'bg-amber-50 text-amber-700 ring-amber-600/20',
    'Pendiente pago': 'bg-rose-50 text-rose-700 ring-rose-600/20',
};

export const DashboardPage = () => {
    const maxWeek = Math.max(...weekBookings.map((d) => d.value));

    return (
        <div className="space-y-8">
            <AdminTitle
                title="Panel general"
                subtitle="Resumen de la agenda y el rendimiento del salón."
            />

            {/* KPIs */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {kpis.map(({ title, value, delta, trend, hint, icon: Icon }) => (
                    <div
                        key={title}
                        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                    >
                        <div className="flex items-center justify-between">
                            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
                                <Icon size={18} />
                            </span>
                            <span
                                className={`inline-flex items-center gap-1 text-xs font-semibold ${
                                    trend === 'up' ? 'text-emerald-600' : 'text-rose-600'
                                }`}
                            >
                                {trend === 'up' ? (
                                    <ArrowUpRight size={14} />
                                ) : (
                                    <ArrowDownRight size={14} />
                                )}
                                {delta}
                            </span>
                        </div>
                        <p className="mt-4 text-sm font-medium text-slate-500">{title}</p>
                        <p className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
                            {value}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">{hint}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Reservas de la semana */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-base font-semibold text-slate-900">
                                Reservas de la semana
                            </h3>
                            <p className="text-sm text-slate-500">
                                126 citas agendadas · promedio de 18 por día
                            </p>
                        </div>
                        <button className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
                            <MoreHorizontal size={18} />
                        </button>
                    </div>

                    <div className="mt-8 flex h-52 items-end gap-3">
                        {weekBookings.map(({ day, value }) => (
                            <div key={day} className="flex flex-1 flex-col items-center gap-2">
                                <span className="text-xs font-medium text-slate-500">
                                    {value}
                                </span>
                                <div
                                    className="w-full rounded-t-lg bg-slate-900 transition-all hover:bg-slate-700"
                                    style={{ height: `${(value / maxWeek) * 100}%` }}
                                />
                                <span className="text-xs text-slate-400">{day}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Equipo */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h3 className="text-base font-semibold text-slate-900">
                        Rendimiento del equipo
                    </h3>
                    <p className="text-sm text-slate-500">Ocupación de agenda hoy</p>

                    <div className="mt-6 space-y-5">
                        {staff.map(({ name, role, load, rating }) => (
                            <div key={name}>
                                <div className="flex items-center justify-between text-sm">
                                    <div>
                                        <p className="font-medium text-slate-900">{name}</p>
                                        <p className="text-xs text-slate-400">{role}</p>
                                    </div>
                                    <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500">
                                        <Star size={12} className="fill-amber-400 text-amber-400" />
                                        {rating}
                                    </span>
                                </div>
                                <div className="mt-2 h-2 rounded-full bg-slate-100">
                                    <div
                                        className="h-2 rounded-full bg-slate-900"
                                        style={{ width: `${load}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Agenda de hoy */}
                <div className="rounded-2xl border border-slate-200 bg-white shadow-sm lg:col-span-2">
                    <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                        <h3 className="text-base font-semibold text-slate-900">
                            Agenda de hoy
                        </h3>
                        <span className="text-sm text-slate-400">martes, 1 de septiembre</span>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {schedule.map((appt) => (
                            <div
                                key={appt.time}
                                className="flex items-center gap-4 px-6 py-4"
                            >
                                <div className="w-14 text-sm font-semibold text-slate-900">
                                    {appt.time}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-slate-900">
                                        {appt.client}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        {appt.service} · {appt.staff}
                                    </p>
                                </div>
                                <span
                                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${
                                        statusStyle[appt.status] ??
                                        'bg-slate-50 text-slate-600 ring-slate-500/20'
                                    }`}
                                >
                                    {appt.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Servicios top */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center gap-2">
                        <Sparkles size={18} className="text-slate-900" />
                        <h3 className="text-base font-semibold text-slate-900">
                            Servicios más solicitados
                        </h3>
                    </div>
                    <p className="text-sm text-slate-500">Este mes</p>

                    <div className="mt-5 space-y-4">
                        {topServices.map((s) => (
                            <div
                                key={s.name}
                                className="flex items-center justify-between"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                                        <Scissors size={16} />
                                    </span>
                                    <div>
                                        <p className="text-sm font-medium text-slate-900">
                                            {s.name}
                                        </p>
                                        <p className="text-xs text-slate-400">
                                            {s.bookings} reservas
                                        </p>
                                    </div>
                                </div>
                                <span className="text-sm font-semibold text-slate-900">
                                    {s.revenue}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
