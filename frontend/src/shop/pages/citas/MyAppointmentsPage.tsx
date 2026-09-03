import { Link } from 'react-router';

import type { AppointmentStatus } from '@/api/types';
import { Button } from '@/components/ui/button';
import { useCancelAppointment, useMyAppointments } from '@/shop/hooks/use-appointments';

const STATUS: Record<AppointmentStatus, { label: string; className: string }> = {
    pending: { label: 'Pendiente', className: 'bg-amber-50 text-amber-700' },
    confirmed: { label: 'Confirmada', className: 'bg-emerald-50 text-emerald-700' },
    cancelled: { label: 'Cancelada', className: 'bg-slate-100 text-slate-500' },
    done: { label: 'Realizada', className: 'bg-slate-100 text-slate-600' },
};

export const MyAppointmentsPage = () => {
    const { data, isLoading, isError } = useMyAppointments();
    const cancel = useCancelAppointment();

    return (
        <div className="container mx-auto px-4 py-12 lg:px-8">
            <div className="flex items-center justify-between">
                <h1 className="font-montserrat text-3xl tracking-tight">Mis citas</h1>
                <Button variant="outline" render={<Link to="/shop/agendar" />}>
                    Agendar otra
                </Button>
            </div>

            {isLoading ? (
                <p className="py-16 text-center text-muted-foreground">Cargando…</p>
            ) : isError ? (
                <p className="py-16 text-center text-destructive">
                    No se pudieron cargar tus citas.
                </p>
            ) : (data?.length ?? 0) === 0 ? (
                <div className="py-16 text-center">
                    <p className="text-muted-foreground">Aún no tienes citas.</p>
                    <Button className="mt-4" render={<Link to="/shop/agendar" />}>
                        Agendar mi primera cita
                    </Button>
                </div>
            ) : (
                <ul className="mt-8 space-y-4">
                    {data?.map((appt) => {
                        const canCancel =
                            appt.status === 'pending' || appt.status === 'confirmed';
                        return (
                            <li
                                key={appt.id}
                                className="flex flex-wrap items-center gap-4 rounded-xl border border-slate-200 bg-white p-5"
                            >
                                <div className="flex-1">
                                    <p className="font-medium">{appt.service.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {appt.date} · {appt.startTime}–{appt.endTime}
                                    </p>
                                </div>

                                <span
                                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS[appt.status].className}`}
                                >
                                    {STATUS[appt.status].label}
                                </span>

                                {canCancel && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={cancel.isPending}
                                        onClick={() => {
                                            if (window.confirm('¿Cancelar esta cita?')) {
                                                cancel.mutate(appt.id);
                                            }
                                        }}
                                    >
                                        Cancelar
                                    </Button>
                                )}
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
};
