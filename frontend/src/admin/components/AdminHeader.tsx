import { useEffect, useRef, useState } from 'react';
import { Bell, Search, Settings } from 'lucide-react';
import { Link } from 'react-router';

import {
    useAdminAppointments,
    useUpdateAppointmentStatus,
} from '@/admin/hooks/use-admin-appointments';

/** Desplegable de notificaciones: citas reales que esperan confirmación. */
const NotificationsBell = () => {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    const { data: pending } = useAdminAppointments({ status: 'pending' });
    const confirm = useUpdateAppointmentStatus();
    const count = pending?.length ?? 0;

    useEffect(() => {
        if (!open) return;
        const onClickOutside = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', onClickOutside);
        return () => document.removeEventListener('mousedown', onClickOutside);
    }, [open]);

    return (
        <div className="relative" ref={ref}>
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                className="relative p-2 text-muted-foreground hover:bg-muted rounded-lg transition-colors"
                aria-label="Citas pendientes de confirmar"
            >
                <Bell size={20} />
                {count > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground">
                        {count > 9 ? '9+' : count}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 z-20 mt-2 w-80 rounded-xl border border-border bg-card p-2 shadow-lg">
                    <p className="px-2 py-1.5 text-sm font-semibold text-foreground">
                        Citas por confirmar
                    </p>

                    {count === 0 ? (
                        <p className="px-2 py-4 text-center text-sm text-muted-foreground">
                            No hay citas pendientes.
                        </p>
                    ) : (
                        <ul className="max-h-80 space-y-1 overflow-y-auto">
                            {pending!.map((appt) => (
                                <li
                                    key={appt.id}
                                    className="rounded-lg px-2 py-2 text-sm hover:bg-muted"
                                >
                                    <p className="font-medium text-foreground">
                                        {appt.user.fullName}
                                    </p>
                                    <p className="text-muted-foreground">
                                        {appt.service.name} · {appt.date}{' '}
                                        {appt.startTime}
                                    </p>
                                    <button
                                        type="button"
                                        disabled={confirm.isPending}
                                        onClick={() =>
                                            confirm.mutate({ id: appt.id, status: 'confirmed' })
                                        }
                                        className="mt-1 text-xs font-medium text-success hover:underline disabled:opacity-50"
                                    >
                                        Confirmar
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}

                    <Link
                        to="/admin/citas"
                        onClick={() => setOpen(false)}
                        className="mt-1 block rounded-lg px-2 py-1.5 text-center text-sm font-medium text-brand hover:bg-muted"
                    >
                        Ver toda la agenda
                    </Link>
                </div>
            )}
        </div>
    );
};

export const AdminHeader = () => {
    return (
        <header className="bg-card border-b border-border px-6 py-4 h-18">
            <div className="flex items-center justify-between">
                {/* Search */}
                <div className="flex-1 max-w-md">
                    <div className="relative">
                        <Search
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                            size={20}
                        />
                        <input
                            type="text"
                            placeholder="Buscar..."
                            className="w-full pl-10 pr-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-4">
                    <NotificationsBell />

                    <Link
                        to="/admin/horario"
                        className="p-2 text-muted-foreground hover:bg-muted rounded-lg transition-colors"
                        aria-label="Configuración de horario"
                        title="Configuración de horario"
                    >
                        <Settings size={20} />
                    </Link>
                </div>
            </div>
        </header>
    );
};
