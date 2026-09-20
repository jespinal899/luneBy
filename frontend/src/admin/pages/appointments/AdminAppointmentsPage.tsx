import { useState } from 'react';

import { AdminTitle } from '@/admin/components/AdminTitle';
import {
    useAdminAppointments,
    useUpdateAppointmentStatus,
} from '@/admin/hooks/use-admin-appointments';
import type { AppointmentStatus } from '@/api/types';
import { AsyncState } from '@/components/Custom/AsyncState';
import { Button } from '@/components/ui/button';
import { formatLps } from '@/shop/lib/format';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

const STATUS_LABEL: Record<AppointmentStatus, string> = {
    pending: 'Pendiente',
    confirmed: 'Confirmada',
    cancelled: 'Cancelada',
    done: 'Realizada',
};

const STATUS_STYLE: Record<AppointmentStatus, string> = {
    pending: 'bg-warning/10 text-warning',
    confirmed: 'bg-success/10 text-success',
    cancelled: 'bg-muted text-muted-foreground',
    done: 'bg-muted text-muted-foreground',
};

const inputClass = 'rounded-lg border border-input px-3 py-2 text-sm';

export const AdminAppointmentsPage = () => {
    const [date, setDate] = useState('');
    const [status, setStatus] = useState<AppointmentStatus | ''>('');

    const { data, isLoading, isError } = useAdminAppointments({
        date: date || undefined,
        status: status || undefined,
    });
    const updateStatus = useUpdateAppointmentStatus();

    const change = (id: string, next: AppointmentStatus) =>
        updateStatus.mutate({ id, status: next });

    return (
        <>
            <AdminTitle
                title="Agenda de citas"
                subtitle="Confirma, completa o cancela las citas de tus clientas."
            />

            <div className="mb-6 flex flex-wrap gap-3">
                <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className={inputClass}
                />
                <select
                    value={status}
                    onChange={(e) =>
                        setStatus(e.target.value as AppointmentStatus | '')
                    }
                    className={inputClass}
                >
                    <option value="">Todos los estados</option>
                    {Object.entries(STATUS_LABEL).map(([value, label]) => (
                        <option key={value} value={value}>
                            {label}
                        </option>
                    ))}
                </select>
                {(date || status) && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            setDate('');
                            setStatus('');
                        }}
                    >
                        Limpiar
                    </Button>
                )}
            </div>

            <AsyncState
                isLoading={isLoading}
                isError={isError}
                isEmpty={(data?.length ?? 0) === 0}
                loadingText="Cargando…"
                errorText="No se pudo cargar la agenda."
                emptyState={
                    <p className="py-16 text-center text-muted-foreground">
                        No hay citas con esos filtros.
                    </p>
                }
            >
                <Table className="border border-border bg-card shadow-xs">
                    <TableHeader>
                        <TableRow>
                            <TableHead>Fecha</TableHead>
                            <TableHead>Hora</TableHead>
                            <TableHead>Clienta</TableHead>
                            <TableHead>Servicio</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data?.map((appt) => (
                            <TableRow key={appt.id}>
                                <TableCell>{appt.date}</TableCell>
                                <TableCell>
                                    {appt.startTime}–{appt.endTime}
                                </TableCell>
                                <TableCell className="font-medium">
                                    {appt.user.fullName}
                                    <span className="block text-xs text-muted-foreground">
                                        {appt.user.phone ?? appt.user.email}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    {(appt.items ?? []).length > 0
                                        ? (appt.items ?? [])
                                              .map((i) => i.nameAtBooking)
                                              .join(' + ')
                                        : appt.service.name}
                                    {appt.priceAtBooking != null && (
                                        <span className="block text-xs font-medium text-muted-foreground">
                                            {formatLps(appt.priceAtBooking)}
                                        </span>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <span
                                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLE[appt.status]}`}
                                    >
                                        {STATUS_LABEL[appt.status]}
                                    </span>
                                    {/* El hueco en la agenda se explica solo
                                        si se sabe por qué se liberó. */}
                                    {appt.cancellationReason && (
                                        <span className="mt-1 block max-w-48 text-xs italic text-muted-foreground">
                                            “{appt.cancellationReason}”
                                        </span>
                                    )}
                                </TableCell>
                                <TableCell className="space-x-1 text-right">
                                    {appt.status === 'pending' && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            disabled={updateStatus.isPending}
                                            onClick={() => change(appt.id, 'confirmed')}
                                        >
                                            Confirmar
                                        </Button>
                                    )}
                                    {appt.status === 'confirmed' && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            disabled={updateStatus.isPending}
                                            onClick={() => change(appt.id, 'done')}
                                        >
                                            Realizada
                                        </Button>
                                    )}
                                    {(appt.status === 'pending' ||
                                        appt.status === 'confirmed') && (
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="text-destructive"
                                            disabled={updateStatus.isPending}
                                            onClick={() => change(appt.id, 'cancelled')}
                                        >
                                            Cancelar
                                        </Button>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </AsyncState>
        </>
    );
};
