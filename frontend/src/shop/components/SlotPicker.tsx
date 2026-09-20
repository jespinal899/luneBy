import type { ReactNode } from 'react';

/** Caja punteada de los avisos del bloque de horarios. */
const SlotNotice = ({ children }: { children: ReactNode }) => (
    <p className="rounded-xl border border-dashed border-brand/20 px-4 py-6 text-center text-sm text-muted-foreground">
        {children}
    </p>
);

interface Props {
    /** Todavía falta elegir servicio o fecha: no hay nada que consultar. */
    needsChoice: boolean;
    isLoading: boolean;
    isError: boolean;
    slots: string[] | undefined;
    selected: string;
    onSelect: (slot: string) => void;
}

/**
 * Los cinco estados del selector de horarios. Con retornos tempranos el orden
 * se lee de corrido: primero lo que falta elegir, después la consulta y solo
 * al final los horarios. "No hay horarios ese día" no es lo mismo que "no se
 * pudieron cargar", y antes eso vivía en una cadena de ternarios anidados.
 */
export const SlotPicker = ({
    needsChoice,
    isLoading,
    isError,
    slots,
    selected,
    onSelect,
}: Props) => {
    if (needsChoice) {
        return (
            <SlotNotice>
                Elige al menos un servicio y una fecha para ver los horarios.
            </SlotNotice>
        );
    }

    if (isLoading) return <SlotNotice>Buscando horarios…</SlotNotice>;

    if (isError) {
        return (
            <p className="text-sm text-destructive">
                No se pudieron cargar los horarios.
            </p>
        );
    }

    if ((slots?.length ?? 0) === 0) {
        return (
            <SlotNotice>
                No hay horarios libres ese día. Prueba con otra fecha.
            </SlotNotice>
        );
    }

    return (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
            {slots?.map((s) => (
                <button
                    key={s}
                    type="button"
                    onClick={() => onSelect(s)}
                    className={`rounded-lg border py-2.5 text-sm font-medium transition-all ${
                        selected === s
                            ? 'border-brand bg-brand text-brand-foreground'
                            : 'border-brand/15 text-brand-dark hover:border-brand/40 hover:bg-brand/5'
                    }`}
                >
                    {s}
                </button>
            ))}
        </div>
    );
};
