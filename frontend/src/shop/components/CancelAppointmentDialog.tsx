import { Dialog } from '@base-ui/react/dialog';
import { AlertTriangle } from 'lucide-react';
import { useState } from 'react';

import type { Appointment } from '@/api/types';
import { Button } from '@/components/ui/button';
import { formInputClass as inputClass } from '@/lib/form-styles';

const MAX_MOTIVO = 500;

interface Props {
    /** La cita a cancelar, o null cuando el diálogo está cerrado. */
    appointment: Appointment | null;
    isPending: boolean;
    onConfirm: (reason: string) => void;
    onClose: () => void;
}

/** Nombre de la cita: los servicios reservados, o el del servicio base. */
const describe = (appt: Appointment) =>
    (appt.items ?? []).length > 0
        ? (appt.items ?? []).map((i) => i.nameAtBooking).join(' + ')
        : appt.service.name;

/**
 * Confirmación de cancelación, con el motivo.
 *
 * Reemplaza al `window.confirm`, que no dejaba ver qué cita se estaba
 * cancelando: con varias citas en pantalla, una confirmación sin datos es
 * fácil de aceptar sobre la equivocada.
 *
 * El motivo es opcional a propósito. Obligar a justificarse cuando alguien ya
 * decidió cancelar produce fricción, o texto de relleno que no informa más
 * que el silencio.
 */
export const CancelAppointmentDialog = ({
    appointment,
    isPending,
    onConfirm,
    onClose,
}: Props) => {
    // Quien lo usa le pasa `key={cita.id}`, así que este estado nace limpio
    // con cada cita: el motivo escrito para una no reaparece en la siguiente.
    const [reason, setReason] = useState('');

    return (
        <Dialog.Root
            open={Boolean(appointment)}
            onOpenChange={(next) => {
                if (!next && !isPending) onClose();
            }}
        >
            <Dialog.Portal>
                <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/40" />
                <Dialog.Popup className="fixed left-1/2 top-1/2 z-50 w-[min(28rem,92vw)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-brand/15 bg-background p-6 shadow-xl">
                    {appointment && (
                        <>
                            <div className="flex items-start gap-3">
                                <span
                                    aria-hidden
                                    className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive"
                                >
                                    <AlertTriangle className="h-5 w-5" />
                                </span>
                                <div className="min-w-0">
                                    <Dialog.Title className="font-display text-lg text-brand-dark">
                                        ¿Cancelar esta cita?
                                    </Dialog.Title>
                                    <Dialog.Description className="mt-1 text-sm text-muted-foreground">
                                        {describe(appointment)} ·{' '}
                                        {appointment.date} a las{' '}
                                        {appointment.startTime}
                                    </Dialog.Description>
                                </div>
                            </div>

                            <p className="mt-4 rounded-lg bg-destructive/5 px-3 py-2.5 text-sm text-destructive">
                                Esta acción no se puede deshacer. El horario
                                queda libre para otra clienta.
                            </p>

                            <div className="mt-5">
                                <label
                                    htmlFor="motivo-cancelacion"
                                    className="mb-1.5 block text-sm font-medium text-brand-dark"
                                >
                                    ¿Por qué la cancelas?{' '}
                                    <span className="font-normal text-muted-foreground">
                                        (opcional)
                                    </span>
                                </label>
                                <textarea
                                    id="motivo-cancelacion"
                                    rows={3}
                                    value={reason}
                                    maxLength={MAX_MOTIVO}
                                    onChange={(e) => setReason(e.target.value)}
                                    className={`${inputClass} resize-none`}
                                    placeholder="Nos ayuda a mejorar. Por ejemplo: me surgió un imprevisto."
                                />
                            </div>

                            <div className="mt-6 flex justify-end gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    disabled={isPending}
                                    onClick={onClose}
                                >
                                    Volver
                                </Button>
                                <Button
                                    type="button"
                                    disabled={isPending}
                                    onClick={() => onConfirm(reason)}
                                    className="bg-destructive text-white hover:bg-destructive/90"
                                >
                                    {isPending
                                        ? 'Cancelando…'
                                        : 'Sí, cancelar cita'}
                                </Button>
                            </div>
                        </>
                    )}
                </Dialog.Popup>
            </Dialog.Portal>
        </Dialog.Root>
    );
};
