import { useMemo, useState } from 'react';
import { CalendarOff, Check, ChevronLeft, ChevronRight } from 'lucide-react';

import { AdminTitle } from '@/admin/components/AdminTitle';
import {
  useAddTimeOff,
  useRemoveTimeOff,
  useSchedule,
  useReplaceSchedule,
  useTimeOff,
} from '@/admin/hooks/use-schedule';
import type { ScheduleDay } from '@/admin/api/schedule.actions';
import { apiErrorMessage } from '@/api/errors';
import { Button } from '@/components/ui/button';

const DAY_NAMES = [
  'Domingo',
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
];
const DAY_SHORT = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];

const INTERVAL_OPTIONS = [
  { value: 15, label: 'Cada 15 min' },
  { value: 30, label: 'Cada 30 min' },
  { value: 60, label: 'Cada hora en punto' },
  { value: 90, label: 'Cada 1h 30min' },
  { value: 120, label: 'Cada 2 horas' },
];

const iso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}`;

const formatLongDate = (dateStr: string) =>
  new Date(`${dateStr}T00:00:00`).toLocaleDateString('es-HN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

// ── Horario semanal ────────────────────────────────────────────────
const WeeklySchedule = () => {
  const { data } = useSchedule();
  const save = useReplaceSchedule();

  // `draft` es null mientras no se edita: se muestra el horario del servidor.
  // Al guardar con éxito se vuelve a poner en null para re-sincronizar.
  const [draft, setDraft] = useState<ScheduleDay[] | null>(null);
  const days = draft ?? data ?? [];

  const set = (weekday: number, patch: Partial<ScheduleDay>) =>
    setDraft(
      days.map((d) => (d.weekday === weekday ? { ...d, ...patch } : d)),
    );

  const guardar = () =>
    save.mutate(days, { onSuccess: () => setDraft(null) });

  if (days.length === 0) return null;

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-gray-900">Horario semanal</h2>
      <p className="mt-1 text-sm text-gray-500">
        Marca los días que atiendes, el rango de horas y cada cuánto empieza
        un turno (ej. cada hora en punto: 6:00 pm, 7:00 pm, 8:00 pm…). Las
        clientas solo verán esas horas exactas como disponibles.
      </p>

      <div className="mt-5 space-y-2">
        {days.map((d) => (
          <div
            key={d.weekday}
            className="flex flex-wrap items-center gap-3 rounded-lg border border-gray-100 px-3 py-2.5"
          >
            <label className="flex w-32 items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                checked={d.isActive}
                onChange={(e) => set(d.weekday, { isActive: e.target.checked })}
                className="h-4 w-4 accent-brand"
              />
              {DAY_NAMES[d.weekday]}
            </label>

            <div className="flex items-center gap-2 text-sm">
              <input
                type="time"
                value={d.startTime}
                disabled={!d.isActive}
                onChange={(e) => set(d.weekday, { startTime: e.target.value })}
                className="rounded-md border border-gray-300 px-2 py-1 disabled:opacity-40"
              />
              <span className="text-gray-400">a</span>
              <input
                type="time"
                value={d.endTime}
                disabled={!d.isActive}
                onChange={(e) => set(d.weekday, { endTime: e.target.value })}
                className="rounded-md border border-gray-300 px-2 py-1 disabled:opacity-40"
              />
            </div>

            <select
              value={d.slotIntervalMin}
              disabled={!d.isActive}
              onChange={(e) =>
                set(d.weekday, { slotIntervalMin: Number(e.target.value) })
              }
              className="rounded-md border border-gray-300 px-2 py-1 text-sm disabled:opacity-40"
            >
              {INTERVAL_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            {!d.isActive && (
              <span className="text-xs text-gray-400">Cerrado</span>
            )}
          </div>
        ))}
      </div>

      {save.isError && (
        <p className="mt-3 text-sm text-red-600">
          {apiErrorMessage(save.error, 'No se pudo guardar el horario.')}
        </p>
      )}
      {save.isSuccess && (
        <p className="mt-3 flex items-center gap-1.5 text-sm text-emerald-600">
          <Check className="h-4 w-4" /> Horario guardado
        </p>
      )}

      <Button className="mt-4" disabled={save.isPending} onClick={guardar}>
        {save.isPending ? 'Guardando…' : 'Guardar horario'}
      </Button>
    </section>
  );
};

// ── Días cerrados ──────────────────────────────────────────────────
const ClosedDays = () => {
  const { data: closed = [] } = useTimeOff();
  const add = useAddTimeOff();
  const remove = useRemoveTimeOff();

  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const closedByDate = useMemo(
    () => new Map(closed.map((c) => [c.date, c.id])),
    [closed],
  );
  const todayIso = iso(new Date());

  const cells = useMemo(() => {
    const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const daysInMonth = new Date(
      cursor.getFullYear(),
      cursor.getMonth() + 1,
      0,
    ).getDate();
    const out: (string | null)[] = Array.from(
      { length: first.getDay() },
      () => null,
    );
    for (let day = 1; day <= daysInMonth; day++) {
      out.push(iso(new Date(cursor.getFullYear(), cursor.getMonth(), day)));
    }
    return out;
  }, [cursor]);

  const toggle = (dateStr: string) => {
    const existingId = closedByDate.get(dateStr);
    if (existingId) remove.mutate(existingId);
    else add.mutate({ date: dateStr });
  };

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-gray-900">Días cerrados</h2>
      <p className="mt-1 text-sm text-gray-500">
        Toca un día para cerrarlo (vacaciones, feriados). Ese día no se podrá
        reservar.
      </p>

      <div className="mt-5 max-w-sm">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() =>
              setCursor(
                new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1),
              )
            }
            className="rounded-md p-1.5 hover:bg-gray-100"
            aria-label="Mes anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm font-medium capitalize">
            {cursor.toLocaleDateString('es-HN', {
              month: 'long',
              year: 'numeric',
            })}
          </span>
          <button
            type="button"
            onClick={() =>
              setCursor(
                new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1),
              )
            }
            className="rounded-md p-1.5 hover:bg-gray-100"
            aria-label="Mes siguiente"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-3 grid grid-cols-7 gap-1 text-center text-xs text-gray-400">
          {DAY_SHORT.map((d, i) => (
            <span key={i}>{d}</span>
          ))}
        </div>
        <div className="mt-1 grid grid-cols-7 gap-1">
          {cells.map((dateStr, i) => {
            if (!dateStr) return <span key={i} />;
            const isPast = dateStr < todayIso;
            const isClosed = closedByDate.has(dateStr);
            return (
              <button
                key={dateStr}
                type="button"
                disabled={isPast}
                onClick={() => toggle(dateStr)}
                className={[
                  'aspect-square rounded-md text-sm transition-colors',
                  isPast && 'cursor-not-allowed text-gray-300',
                  !isPast && !isClosed && 'hover:bg-gray-100',
                  isClosed && 'bg-red-100 font-semibold text-red-700',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {Number(dateStr.slice(-2))}
              </button>
            );
          })}
        </div>
      </div>

      {closed.length > 0 && (
        <ul className="mt-6 space-y-1.5 text-sm">
          {closed.map((c) => (
            <li
              key={c.id}
              className="flex items-center justify-between rounded-lg bg-red-50 px-3 py-2"
            >
              <span className="flex items-center gap-2 capitalize text-red-800">
                <CalendarOff className="h-4 w-4" />
                {formatLongDate(c.date)}
              </span>
              <button
                type="button"
                onClick={() => remove.mutate(c.id)}
                className="text-xs font-medium text-red-600 hover:underline"
              >
                Reabrir
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export const HorarioPage = () => (
  <>
    <AdminTitle
      title="Horario de atención"
      subtitle="Define tus días y horas de trabajo, y marca los días que estarás cerrado."
    />
    <div className="grid gap-6 lg:grid-cols-2">
      <WeeklySchedule />
      <ClosedDays />
    </div>
  </>
);
