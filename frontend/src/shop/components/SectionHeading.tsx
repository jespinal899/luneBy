import { cn } from '@/lib/utils';

interface Props {
    /** Etiqueta corta encima del título (ej. "Nosotros"). */
    eyebrow?: string;
    title: string;
    subtitle?: string;
    align?: 'left' | 'center';
    className?: string;
}

/**
 * Encabezado de sección. Existe para que todas las secciones del sitio
 * compartan el mismo ritmo y jerarquía: antes cada una definía sus propios
 * tamaños y márgenes y se notaba la inconsistencia al hacer scroll.
 */
export const SectionHeading = ({
    eyebrow,
    title,
    subtitle,
    align = 'left',
    className,
}: Props) => (
    <div
        className={cn(
            'max-w-2xl',
            align === 'center' && 'mx-auto text-center',
            className,
        )}
    >
        {eyebrow && (
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">
                {eyebrow}
            </p>
        )}
        <h2
            className={cn(
                'font-display text-3xl leading-tight text-brand-dark sm:text-4xl',
                eyebrow && 'mt-3',
            )}
        >
            {title}
        </h2>
        {subtitle && (
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                {subtitle}
            </p>
        )}
    </div>
);
