import { useMemo, useState } from 'react';
import { CalendarCheck, Clock, Minus, Plus } from 'lucide-react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router';

import { apiErrorMessage } from '@/api/errors';
import { useAuth } from '@/auth/context/use-auth';
import { Button } from '@/components/ui/button';
import {
    useAvailability,
    useCreateAppointment,
} from '@/shop/hooks/use-appointments';
import { useServices } from '@/shop/hooks/use-services';
import { formatDuration, formatLps } from '@/shop/lib/format';

const inputClass =
    'w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:border-transparent focus:ring-2 focus:ring-slate-900/20';

export const AgendarPage = () => {
    const [params] = useSearchParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { status } = useAuth();

    const { data: baseData } = useServices({ limit: 100, kind: 'base' });
    const { data: styleData } = useServices({ limit: 100, kind: 'estilo' });
    const bases = (baseData?.products ?? []).filter((s) => s.isActive);
    const styles = (styleData?.products ?? []).filter((s) => s.isActive);

    const [serviceId, setServiceId] = useState(params.get('serviceId') ?? '');
    /** id de estilo -> cantidad (>= 1). */
    const [styleQty, setStyleQty] = useState<Record<string, number>>({});
    const [date, setDate] = useState('');
    const [slot, setSlot] = useState('');
    const [notes, setNotes] = useState('');

    const today = new Date().toISOString().slice(0, 10);
    const base = bases.find((s) => s.id === serviceId);

    const chosenStyles = useMemo(
        () =>
            styles
                .map((s) => ({ service: s, qty: styleQty[s.id] ?? 0 }))
                .filter((x) => x.qty > 0),
        [styles, styleQty],
    );

    const extraMinutes = chosenStyles.reduce(
        (sum, x) => sum + x.service.durationMin * x.qty,
        0,
    );
    const stylesTotal = chosenStyles.reduce(
        (sum, x) => sum + x.service.price * x.qty,
        0,
    );
    const totalPrice = (base?.price ?? 0) + stylesTotal;
    const totalDuration = (base?.durationMin ?? 0) + extraMinutes;

    const {
        data: slots,
        isLoading: loadingSlots,
        isError: slotsError,
    } = useAvailability(
        date || undefined,
        serviceId || undefined,
        extraMinutes,
    );

    const createAppt = useCreateAppointment();

    const canConfirm = Boolean(serviceId && date && slot);
    const loginFrom = `${location.pathname}${location.search}`;

    const setQty = (id: string, next: number) =>
        setStyleQty((prev) => {
            const value = Math.max(0, Math.min(20, next));
            const copy = { ...prev };
            if (value === 0) delete copy[id];
            else copy[id] = value;
            return copy;
        });

    const handleConfirm = () => {
        createAppt.mutate(
            {
                serviceId,
                date,
                startTime: slot,
                items: chosenStyles.map((x) => ({
                    serviceId: x.service.id,
                    quantity: x.qty,
                })),
                notes: notes.trim() || undefined,
            },
            { onSuccess: () => navigate('/mis-citas') },
        );
    };

    return (
        <div className="container mx-auto px-4 py-12 lg:px-8">
            <h1 className="font-montserrat text-3xl tracking-tight">Agendar cita</h1>
            <p className="mt-2 text-muted-foreground">
                Elige tu servicio base, súmale los estilos que quieras y reserva
                una hora.
            </p>

            <div className="mt-10 grid gap-10 lg:grid-cols-3">
                {/* Formulario */}
                <div className="space-y-8 lg:col-span-2">
                    {/* 1 · Servicio base */}
                    <section>
                        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                            1 · Servicio base
                        </h2>
                        <div className="grid gap-3 sm:grid-cols-2">
                            {bases.map((s) => (
                                <button
                                    key={s.id}
                                    type="button"
                                    onClick={() => {
                                        setServiceId(s.id);
                                        setSlot('');
                                    }}
                                    className={`rounded-xl border p-4 text-left transition-colors ${
                                        serviceId === s.id
                                            ? 'border-brand bg-brand/5 ring-1 ring-brand'
                                            : 'border-slate-200 hover:border-slate-300'
                                    }`}
                                >
                                    <p className="font-medium">{s.name}</p>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        {formatLps(s.price)} ·{' '}
                                        {formatDuration(s.durationMin)}
                                    </p>
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* 2 · Estilos */}
                    <section>
                        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                            2 · Estilos (opcional)
                        </h2>
                        <div className="divide-y divide-slate-100 rounded-xl border border-slate-200">
                            {styles.map((s) => {
                                const qty = styleQty[s.id] ?? 0;
                                return (
                                    <div
                                        key={s.id}
                                        className="flex items-center justify-between gap-3 p-3.5"
                                    >
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-medium">
                                                {s.name}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                +{formatLps(s.price)} ·{' '}
                                                {formatDuration(s.durationMin)}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="icon-sm"
                                                disabled={qty === 0}
                                                onClick={() => setQty(s.id, qty - 1)}
                                                aria-label={`Quitar ${s.name}`}
                                            >
                                                <Minus />
                                            </Button>
                                            <span className="w-5 text-center text-sm tabular-nums">
                                                {qty}
                                            </span>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="icon-sm"
                                                onClick={() => setQty(s.id, qty + 1)}
                                                aria-label={`Agregar ${s.name}`}
                                            >
                                                <Plus />
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                            {styles.length === 0 && (
                                <p className="p-3.5 text-sm text-muted-foreground">
                                    No hay estilos disponibles por ahora.
                                </p>
                            )}
                        </div>
                    </section>

                    {/* 3 · Fecha y hora */}
                    <section className="space-y-4">
                        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                            3 · Fecha y hora
                        </h2>
                        <div>
                            <label className="mb-2 block text-sm font-medium">
                                Fecha
                            </label>
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
                                    Elige un servicio base y una fecha para ver los
                                    horarios.
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
                                    No hay horarios libres ese día. Prueba con otra
                                    fecha.
                                </p>
                            ) : (
                                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                                    {slots?.map((s) => (
                                        <Button
                                            key={s}
                                            type="button"
                                            variant={
                                                slot === s ? 'default' : 'outline'
                                            }
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
                    </section>
                </div>

                {/* Cotización */}
                <div className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-24">
                    <h2 className="text-lg font-semibold">Tu cotización</h2>

                    {base ? (
                        <div className="mt-4 space-y-2 text-sm">
                            <div className="flex justify-between gap-2">
                                <span className="font-medium">{base.name}</span>
                                <span>{formatLps(base.price)}</span>
                            </div>
                            {chosenStyles.map((x) => (
                                <div
                                    key={x.service.id}
                                    className="flex justify-between gap-2 text-muted-foreground"
                                >
                                    <span>
                                        {x.service.name}
                                        {x.qty > 1 && ` ×${x.qty}`}
                                    </span>
                                    <span>
                                        {formatLps(x.service.price * x.qty)}
                                    </span>
                                </div>
                            ))}

                            <div className="mt-3 flex justify-between border-t border-slate-200 pt-3 text-base font-semibold">
                                <span>Total</span>
                                <span>{formatLps(totalPrice)}</span>
                            </div>
                            <p className="flex items-center gap-1.5 text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                {formatDuration(totalDuration)} aprox.
                            </p>
                            {date && <p className="text-muted-foreground">{date}</p>}
                            {slot && (
                                <p className="text-muted-foreground">
                                    Hora: {slot}
                                </p>
                            )}
                        </div>
                    ) : (
                        <p className="mt-4 text-sm text-muted-foreground">
                            Aún no has elegido un servicio base.
                        </p>
                    )}

                    <p className="mt-3 text-xs text-muted-foreground">
                        El precio es una estimación; puede ajustarse en el salón
                        según el largo y el estado de tus uñas.
                    </p>

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
                                {createAppt.isPending
                                    ? 'Agendando…'
                                    : 'Agendar con esta cotización'}
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
