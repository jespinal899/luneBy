import { useState } from 'react';
import { CalendarCheck, Clock } from 'lucide-react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router';

import { apiErrorMessage } from '@/api/errors';
import { useAuth } from '@/auth/context/use-auth';
import { Button } from '@/components/ui/button';
import {
    useAvailability,
    useCreateAppointment,
} from '@/shop/hooks/use-appointments';
import { useServices } from '@/shop/hooks/use-services';

const inputClass =
    'w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:border-transparent focus:ring-2 focus:ring-slate-900/20';

export const AgendarPage = () => {
    const [params] = useSearchParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { status } = useAuth();

    const { data: servicesData } = useServices({ limit: 100 });
    const services = (servicesData?.products ?? []).filter((s) => s.isActive);

    const [serviceId, setServiceId] = useState(params.get('serviceId') ?? '');
    const [date, setDate] = useState('');
    const [slot, setSlot] = useState('');
    const [notes, setNotes] = useState('');

    const today = new Date().toISOString().slice(0, 10);
    const selectedService = services.find((s) => s.id === serviceId);

    const {
        data: slots,
        isLoading: loadingSlots,
        isError: slotsError,
    } = useAvailability(date || undefined, serviceId || undefined);

    const createAppt = useCreateAppointment();

    const canConfirm = Boolean(serviceId && date && slot);
    const loginFrom = `${location.pathname}${location.search}`;

    const handleConfirm = () => {
        createAppt.mutate(
            { serviceId, date, startTime: slot, notes: notes.trim() || undefined },
            { onSuccess: () => navigate('/mis-citas') },
        );
    };

    return (
        <div className="container mx-auto px-4 py-12 lg:px-8">
            <h1 className="font-montserrat text-3xl tracking-tight">Agendar cita</h1>
            <p className="mt-2 text-muted-foreground">
                Elige tu servicio, el día y una hora disponible.
            </p>

            <div className="mt-10 grid gap-10 lg:grid-cols-3">
                {/* Formulario */}
                <div className="space-y-6 lg:col-span-2">
                    <div>
                        <label className="mb-2 block text-sm font-medium">Servicio</label>
                        <select
                            value={serviceId}
                            onChange={(e) => {
                                setServiceId(e.target.value);
                                setSlot('');
                            }}
                            className={inputClass}
                        >
                            <option value="">Selecciona un servicio…</option>
                            {services.map((s) => (
                                <option key={s.id} value={s.id}>
                                    {s.name} · ${s.price} · {s.durationMin} min
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium">Fecha</label>
                        <input
                            type="date"
                            min={today}
                            value={date}
                            onChange={(e) => {
                                setDate(e.target.value);
                                setSlot('');
                            }}
                            className={inputClass}
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium">
                            Horarios disponibles
                        </label>
                        {!serviceId || !date ? (
                            <p className="text-sm text-muted-foreground">
                                Elige un servicio y una fecha para ver los horarios.
                            </p>
                        ) : loadingSlots ? (
                            <p className="text-sm text-muted-foreground">
                                Buscando horarios…
                            </p>
                        ) : slotsError ? (
                            <p className="text-sm text-destructive">
                                No se pudieron cargar los horarios.
                            </p>
                        ) : (slots?.length ?? 0) === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                No hay horarios libres ese día. Prueba con otra fecha.
                            </p>
                        ) : (
                            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                                {slots?.map((s) => (
                                    <Button
                                        key={s}
                                        type="button"
                                        variant={slot === s ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setSlot(s)}
                                    >
                                        {s}
                                    </Button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium">
                            Notas (opcional)
                        </label>
                        <textarea
                            rows={3}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className={`${inputClass} resize-none`}
                            placeholder="Referencias de diseño, alergias, etc."
                        />
                    </div>
                </div>

                {/* Resumen */}
                <div className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="text-lg font-semibold">Resumen</h2>

                    {selectedService ? (
                        <div className="mt-4 space-y-2 text-sm">
                            <p className="font-medium">{selectedService.name}</p>
                            <p className="flex items-center gap-1.5 text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                {selectedService.durationMin} min · $
                                {selectedService.price}
                            </p>
                            {date && <p className="text-muted-foreground">{date}</p>}
                            {slot && (
                                <p className="text-muted-foreground">Hora: {slot}</p>
                            )}
                        </div>
                    ) : (
                        <p className="mt-4 text-sm text-muted-foreground">
                            Aún no has elegido un servicio.
                        </p>
                    )}

                    {createAppt.isError && (
                        <p className="mt-4 text-sm text-destructive">
                            {apiErrorMessage(
                                createAppt.error,
                                'No se pudo agendar la cita.',
                            )}
                        </p>
                    )}

                    <div className="mt-6">
                        {status === 'authenticated' ? (
                            <Button
                                className="w-full"
                                disabled={!canConfirm || createAppt.isPending}
                                onClick={handleConfirm}
                            >
                                <CalendarCheck className="h-4 w-4" />
                                {createAppt.isPending ? 'Agendando…' : 'Confirmar cita'}
                            </Button>
                        ) : (
                            <Button
                                className="w-full"
                                render={
                                    <Link
                                        to="/auth/login"
                                        state={{ from: loginFrom }}
                                    />
                                }
                            >
                                Inicia sesión para agendar
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
