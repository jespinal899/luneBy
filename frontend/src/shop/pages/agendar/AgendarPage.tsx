import { useEffect, useState } from 'react';
import { CalendarCheck, Check, Clock, Plus, X } from 'lucide-react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router';

import { apiErrorMessage } from '@/api/errors';
import { useAuth } from '@/auth/context/use-auth';
import { Button } from '@/components/ui/button';
import { formInputClass as inputClass } from '@/lib/form-styles';
import { toQuoteItem } from '@/quote/quote-context';
import { useQuote } from '@/quote/use-quote';
import {
    useAvailability,
    useCreateAppointment,
} from '@/shop/hooks/use-appointments';
import { useServices } from '@/shop/hooks/use-services';
import { formatDuration, formatLps } from '@/shop/lib/format';

/** Encabezado numerado de cada paso del formulario de reserva. */
const StepHeading = ({ number, title }: { number: number; title: string }) => (
    <div className="flex items-center gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-semibold text-brand-foreground">
            {number}
        </span>
        <h2 className="font-display text-xl text-brand-dark">{title}</h2>
    </div>
);

export const AgendarPage = () => {
    const [params] = useSearchParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { status } = useAuth();

    // El endpoint público ya devuelve solo los servicios disponibles.
    const { data: servicesData } = useServices({ limit: 100 });
    const services = servicesData?.products ?? [];

    const quote = useQuote();

    // Enlace /shop/agendar?serviceId=… (desde el detalle de un diseño) → lo
    // añade a la cotización.
    const preselectId = params.get('serviceId');
    const { add, isInQuote } = quote;
    useEffect(() => {
        if (!preselectId || !servicesData) return;
        const svc = servicesData.products.find((s) => s.id === preselectId);
        if (svc && !isInQuote(svc.id)) add(toQuoteItem(svc));
    }, [preselectId, servicesData, add, isInQuote]);

    const [date, setDate] = useState('');
    const [slot, setSlot] = useState('');
    const [notes, setNotes] = useState('');

    const today = new Date().toISOString().slice(0, 10);

    const primaryId = quote.items[0]?.serviceId;
    const extraMinutes = quote.items
        .slice(1)
        .reduce((sum, i) => sum + i.durationMin, 0);

    const {
        data: slots,
        isLoading: loadingSlots,
        isError: slotsError,
    } = useAvailability(date || undefined, primaryId, extraMinutes);

    const createAppt = useCreateAppointment();

    const canConfirm = Boolean(quote.count > 0 && date && slot);
    const loginFrom = `${location.pathname}${location.search}`;

    const handleConfirm = () => {
        createAppt.mutate(
            {
                serviceIds: quote.items.map((i) => i.serviceId),
                date,
                startTime: slot,
                notes: notes.trim() || undefined,
            },
            {
                onSuccess: () => {
                    quote.clear();
                    navigate('/mis-citas');
                },
            },
        );
    };

    return (
        <div className="container mx-auto px-4 py-14 lg:px-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">
                Reserva en línea
            </p>
            <h1 className="mt-3 font-display text-4xl leading-tight text-brand-dark sm:text-5xl">
                Agendar cita
            </h1>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground">
                Elige los servicios que quieres, revisa tu cotización y reserva
                una hora.
            </p>

            <div className="mt-14 grid gap-12 lg:grid-cols-3">
                {/* Formulario */}
                <div className="space-y-12 lg:col-span-2">
                    {/* 1 · Servicios */}
                    <section>
                        <StepHeading number={1} title="Elige tus servicios" />
                        <div className="mt-5 grid gap-3 sm:grid-cols-2">
                            {services.map((s) => {
                                const selected = quote.isInQuote(s.id);
                                return (
                                    <button
                                        key={s.id}
                                        type="button"
                                        onClick={() => {
                                            quote.toggle(toQuoteItem(s));
                                            setSlot('');
                                        }}
                                        className={`flex items-start justify-between gap-3 rounded-xl border p-4 text-left transition-all ${
                                            selected
                                                ? 'border-brand bg-brand/5 ring-1 ring-brand'
                                                : 'border-brand/15 hover:border-brand/40 hover:bg-brand/5'
                                        }`}
                                    >
                                        <span className="min-w-0">
                                            <span className="block font-medium text-brand-dark">
                                                {s.name}
                                            </span>
                                            <span className="mt-1 block text-sm text-muted-foreground">
                                                {formatLps(s.price)} ·{' '}
                                                {formatDuration(s.durationMin)}
                                            </span>
                                        </span>
                                        <span
                                            className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-colors ${
                                                selected
                                                    ? 'border-brand bg-brand text-brand-foreground'
                                                    : 'border-brand/30 text-brand/50'
                                            }`}
                                        >
                                            {selected ? (
                                                <Check className="h-4 w-4" />
                                            ) : (
                                                <Plus className="h-4 w-4" />
                                            )}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </section>

                    {/* 2 · Fecha y hora */}
                    <section>
                        <StepHeading number={2} title="Fecha y hora" />
                        <div className="mt-5 space-y-6">
                        <div className="max-w-xs">
                            <label className="mb-2 block text-sm font-medium text-brand-dark">
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
                            <label className="mb-2 block text-sm font-medium text-brand-dark">
                                Horarios disponibles
                            </label>
                            {quote.count === 0 || !date ? (
                                <p className="rounded-xl border border-dashed border-brand/20 px-4 py-6 text-center text-sm text-muted-foreground">
                                    Elige al menos un servicio y una fecha para ver
                                    los horarios.
                                </p>
                            ) : loadingSlots ? (
                                <p className="rounded-xl border border-dashed border-brand/20 px-4 py-6 text-center text-sm text-muted-foreground">
                                    Buscando horarios…
                                </p>
                            ) : slotsError ? (
                                <p className="text-sm text-destructive">
                                    No se pudieron cargar los horarios.
                                </p>
                            ) : (slots?.length ?? 0) === 0 ? (
                                <p className="rounded-xl border border-dashed border-brand/20 px-4 py-6 text-center text-sm text-muted-foreground">
                                    No hay horarios libres ese día. Prueba con otra
                                    fecha.
                                </p>
                            ) : (
                                <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                                    {slots?.map((s) => (
                                        <button
                                            key={s}
                                            type="button"
                                            onClick={() => setSlot(s)}
                                            className={`rounded-lg border py-2.5 text-sm font-medium transition-all ${
                                                slot === s
                                                    ? 'border-brand bg-brand text-brand-foreground'
                                                    : 'border-brand/15 text-brand-dark hover:border-brand/40 hover:bg-brand/5'
                                            }`}
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-brand-dark">
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
                    </section>
                </div>

                {/* Cotización */}
                <div className="h-fit rounded-2xl border border-brand/15 bg-cream p-7 lg:sticky lg:top-24">
                    <h2 className="font-display text-xl text-brand-dark">
                        Tu cotización
                    </h2>

                    {quote.count === 0 ? (
                        <p className="mt-4 text-sm text-muted-foreground">
                            Aún no has elegido servicios.
                        </p>
                    ) : (
                        <div className="mt-5 space-y-2 text-sm">
                            {quote.items.map((it) => (
                                <div
                                    key={it.serviceId}
                                    className="flex items-center justify-between gap-2"
                                >
                                    <span className="min-w-0 truncate">
                                        {it.name}
                                    </span>
                                    <span className="flex shrink-0 items-center gap-2">
                                        {formatLps(it.price)}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                quote.remove(it.serviceId);
                                                setSlot('');
                                            }}
                                            aria-label={`Quitar ${it.name}`}
                                            className="rounded p-0.5 text-muted-foreground hover:text-destructive"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </span>
                                </div>
                            ))}

                            <div className="mt-4 flex justify-between border-t border-brand/15 pt-4 text-lg font-semibold text-brand-dark">
                                <span>Total</span>
                                <span>{formatLps(quote.total)}</span>
                            </div>
                            <p className="flex items-center gap-1.5 text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                {formatDuration(quote.totalDuration)} aprox.
                            </p>
                            {date && <p className="text-muted-foreground">{date}</p>}
                            {slot && (
                                <p className="text-muted-foreground">
                                    Hora: {slot}
                                </p>
                            )}
                        </div>
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
