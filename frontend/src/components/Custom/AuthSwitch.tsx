import type { ReactNode } from 'react';

import type { AuthStatus } from '@/auth/context/auth-context';

interface Props {
    status: AuthStatus;
    /** Placeholder mientras se revalida el token guardado. */
    checking: ReactNode;
    authenticated: ReactNode;
    anonymous: ReactNode;
}

/**
 * Elige qué mostrar según el estado de la sesión.
 *
 * El estado `checking` existe para que al recargar no aparezca "Iniciar
 * sesión" durante el instante en que todavía se revalida el token: quien ya
 * tiene sesión veía el botón y luego su avatar. Como ese parpadeo se arregló
 * una vez por pantalla, el orden de los casos vivía repetido en tres lugares
 * y podía divergir; acá está escrito una sola vez.
 */
export const AuthSwitch = ({
    status,
    checking,
    authenticated,
    anonymous,
}: Props) => {
    if (status === 'checking') return <>{checking}</>;
    if (status === 'authenticated') return <>{authenticated}</>;
    return <>{anonymous}</>;
};
