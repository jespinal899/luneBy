import {
    CalendarCheck,
    Clock,
    Scissors,
    Sparkles,
    Users,
    Wallet,
} from 'lucide-react';
import { Link } from 'react-router';

import { AdminTitle } from '@/admin/components/AdminTitle';
import { useAdminAppointments } from '@/admin/hooks/use-admin-appointments';
import { computeDashboard } from '@/admin/lib/dashboard-stats';
import { formatLps } from '@/shop/lib/format';
import type { AppointmentStatus } from '@/api/types';
import { Button } from '@/components/ui/button';

const STATUS_STYLE: Record<AppointmentStatus, string> = {
    pending: 'bg-warning/10 text-warning ring-warning/20',
    confirmed: 'bg-success/10 text-success ring-success/20',
    cancelled: 'bg-muted text-muted-foreground ring-ring/20',
    done: 'bg-muted text-muted-foreground ring-ring/20',
};
const STATUS_LABEL: Record<AppointmentStatus, string> = {
    pending: 'Pendiente',
    confirmed: 'Confirmada',
    cancelled: 'Cancelada',
    done: 'Realizada',
};

export const DashboardPage = () => {
    const { data, isLoading, isError } = useAdminAppointments();

    if (isLoading) {
        return <p className="py-16 text-center text-muted-foreground">Cargando panel…</p>;
    }
    if (isError) {
        return (
            <p className="py-16 text-center text-destructive">
                No se pudo cargar el panel.
            </p>
        );
    }

    const { kpis, weekBookings, todaySchedule, topServices } = computeDashboard(
        data ?? [],
    );

    const kpiCards = [
        {
            title: 'Citas de hoy',
            value: String(kpis.citasHoy),
            hint: 'sin contar canceladas',
            icon: CalendarCheck,
        },
        {
            title: 'Citas próximos 7 días',
            value: String(kpis.citasSemana),
            hint: 'incluye hoy',
            icon: Clock,
        },
        {
            title: 'Ingresos estimados del mes',
            value: formatLps(kpis.ingresosMes),
            hint: 'citas confirmadas o realizadas',
            icon: Wallet,
        },
        {
            title: 'Clientas con cita',
            value: String(kpis.clientas),
            hint: 'clientas distintas',
            icon: Users,
        },
    ];

    const maxWeek = Math.max(1, ...weekBookings.map((d) => d.value));

    return (
        <div className="space-y-8">
            <AdminTitle
                title="Panel general"
                subtitle="Resumen de la agenda a partir de las citas reales."
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {kpiCards.map(({ title, value, hint, icon: Icon }) => (
                    <div
                        key={title}
                        className="rounded-2xl border border-border bg-card p-5 shadow-sm"
                    >
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                            <Icon size={18} />
                        </span>
                        <p className="mt-4 text-sm font-medium text-muted-foreground">{title}</p>
                        <p className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
                            {value}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Reservas de la semana */}
                <div className="rounded-2xl border border-border bg-card p-6 shadow-sm lg:col-span-2">
                    <h3 className="text-base font-semibold text-foreground">
                        Reservas de los próximos 7 días
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        {kpis.citasSemana} citas agendadas
                    </p>

                    <div className="mt-8 flex h-52 items-end gap-3">
                        {weekBookings.map(({ day, date, value }) => (
                            <div
                                key={date}
                                className="flex flex-1 flex-col items-center gap-2"
                            >
                                <span className="text-xs font-medium text-muted-foreground">
                                    {value}
                                </span>
                                <div
                                    className="w-full rounded-t-lg bg-primary transition-all"
                                    style={{ height: `${(value / maxWeek) * 100}%` }}
                                />
                                <span className="text-xs text-muted-foreground">{day}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Servicios más solicitados */}
                <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                    <div className="flex items-center gap-2">
                        <Sparkles size={18} className="text-foreground" />
                        <h3 className="text-base font-semibold text-foreground">
                            Servicios más solicitados
                        </h3>
                    </div>

                    {topServices.length === 0 ? (
                        <p className="mt-4 text-sm text-muted-foreground">Todavía sin citas.</p>
                    ) : (
                        <div className="mt-5 space-y-4">
                            {topServices.map((s) => (
                                <div
                                    key={s.name}
                                    className="flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                                            <Scissors size={16} />
                                        </span>
                                        <div>
                                            <p className="text-sm font-medium text-foreground">
                                                {s.name}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {s.count} reservas
                                            </p>
                                        </div>
                                    </div>
                                    <span className="text-sm font-semibold text-foreground">
                                        {formatLps(s.revenue)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Agenda de hoy */}
            <div className="rounded-2xl border border-border bg-card shadow-sm">
                <div className="flex items-center justify-between border-b border-border px-6 py-4">
                    <h3 className="text-base font-semibold text-foreground">
                        Agenda de hoy
                    </h3>
                    <Button variant="ghost" size="sm" render={<Link to="/admin/citas" />}>
                        Ver toda la agenda
                    </Button>
                </div>

                {todaySchedule.length === 0 ? (
                    <p className="px-6 py-10 text-center text-sm text-muted-foreground">
                        No hay citas para hoy.
                    </p>
                ) : (
                    <div className="divide-y divide-border">
                        {todaySchedule.map((appt) => (
                            <div
                                key={appt.id}
                                className="flex items-center gap-4 px-6 py-4"
                            >
                                <div className="w-14 text-sm font-semibold text-foreground">
                                    {appt.startTime}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-foreground">
                                        {appt.user.fullName}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {appt.service.name}
                                    </p>
                                </div>
                                <span
                                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${STATUS_STYLE[appt.status]}`}
                                >
                                    {STATUS_LABEL[appt.status]}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
