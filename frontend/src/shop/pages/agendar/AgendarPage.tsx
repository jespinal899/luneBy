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

export const AgendarPage = () => {
    const [params] = useSearchParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { status } = useAuth();

    const { data: servicesData } = useServices({ limit: 100 });
    const services = (servicesData?.products ?? []).filter(
        (s) => s.isActive && s.isBookable,
    );

    const quote = useQuote();

    // Enlace antiguo /shop/agendar?serviceId=… → lo añade a la cotización.
    const preselectId = params.get('serviceId');
    const { add, isInQuote } = quote;
    useEffect(() => {
        if (!preselectId || !servicesData) return;
        const svc = servicesData.products.find((s) => s.id === preselectId);
        if (svc && svc.isActive && svc.isBookable && !isInQuote(svc.id))
            add(toQuoteItem(svc));
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
        <div className="container mx-auto px-4 py-12 lg:px-8">
            <h1 className="font-montserrat text-3xl tracking-tight">Agendar cita</h1>
            <p className="mt-2 text-muted-foreground">
                Elige los servicios que quieres, revisa tu cotización y reserva
                una hora.
            </p>

            <div className="mt-10 grid gap-10 lg:grid-cols-3">
                {/* Formulario */}
                <div className="space-y-8 lg:col-span-2">
                    {/* 1 · Servicios */}
                    <section>
                        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                            1 · Servicios
                        </h2>
                        <div className="grid gap-3 sm:grid-cols-2">
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
                                        className={`flex items-start justify-between gap-3 rounded-xl border p-4 text-left transition-colors ${
                                            selected
                                                ? 'border-brand bg-brand/5 ring-1 ring-brand'
                                                : 'border-slate-200 hover:border-slate-300'
                                        }`}
                                    >
                                        <span className="min-w-0">
                                            <span className="block font-medium">
                                                {s.name}
                                            </span>
                                            <span className="mt-1 block text-sm text-muted-foreground">
                                                {formatLps(s.price)} ·{' '}
                                                {formatDuration(s.durationMin)}
                                            </span>
                                        </span>
                                        <span
                                            className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
                                                selected
                                                    ? 'border-brand bg-brand text-brand-foreground'
                                                    : 'border-slate-300 text-slate-400'
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
                    <section className="space-y-4">
                        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                            2 · Fecha y hora
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
                            {quote.count === 0 || !date ? (
                                <p className="text-sm text-muted-foreground">
                                    Elige al menos un servicio y una fecha para ver
                                    los horarios.
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

                    {quote.count === 0 ? (
                        <p className="mt-4 text-sm text-muted-foreground">
                            Aún no has elegido servicios.
                        </p>
                    ) : (
                        <div className="mt-4 space-y-2 text-sm">
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

                            <div className="mt-3 flex justify-between border-t border-slate-200 pt-3 text-base font-semibold">
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
