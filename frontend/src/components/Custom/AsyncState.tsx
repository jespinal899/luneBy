import type { ReactNode } from 'react';

interface Props {
    isLoading: boolean;
    isError: boolean;
    /** Se consultó bien y no hay nada que mostrar. */
    isEmpty?: boolean;
    loadingText: string;
    errorText: string;
    /** Qué decir cuando no hay nada. Omitirlo saltea ese estado. */
    emptyState?: ReactNode;
    children: ReactNode;
}

/**
 * Los cuatro estados de una consulta —cargando, error, vacío y con datos— que
 * cinco pantallas resolvían cada una con su propia cadena de ternarios
 * anidados, idéntica salvo por los textos.
 *
 * Con retornos tempranos el orden queda explícito: mientras carga no se sabe
 * aún si está vacío, y un error no es lo mismo que no tener nada.
 */
export const AsyncState = ({
    isLoading,
    isError,
    isEmpty = false,
    loadingText,
    errorText,
    emptyState,
    children,
}: Props) => {
    if (isLoading) {
        return (
            <p className="py-16 text-center text-muted-foreground">
                {loadingText}
            </p>
        );
    }

    if (isError) {
        return <p className="py-16 text-center text-destructive">{errorText}</p>;
    }

    if (isEmpty && emptyState) {
        return <>{emptyState}</>;
    }

    return <>{children}</>;
};
