import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import {
    CalendarCheck,
    CalendarClock,
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    Home,
    LayoutTemplate,
    LogOut,
    Scissors,
    User as UserIcon,
} from 'lucide-react';

import { useAuth } from '@/auth/context/use-auth';
import { CustomLogo } from '@/components/Custom/CustomLogo';

interface SidebarProps {
    isCollapsed: boolean;
    onToggle: () => void;
}

const menuItems = [
    { icon: Home, label: 'Dashboard', to: '/admin' },
    { icon: LayoutTemplate, label: 'Portada', to: '/admin/contenido' },
    { icon: CalendarCheck, label: 'Agendar', to: '/admin/agendar' },
    { icon: Scissors, label: 'Servicios', to: '/admin/products' },
    { icon: CalendarDays, label: 'Citas', to: '/admin/citas' },
    { icon: CalendarClock, label: 'Horario', to: '/admin/horario' },
];

/** Avatar del usuario en el sidebar: abre un menú con cuenta, inicio y logout. */
const UserMenu = ({ isCollapsed }: { isCollapsed: boolean }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;
        const onClickOutside = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', onClickOutside);
        return () => document.removeEventListener('mousedown', onClickOutside);
    }, [open]);

    if (!user) return null;

    const initials = user.fullName
        .split(' ')
        .map((w) => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

    const handleLogout = () => {
        setOpen(false);
        logout();
        navigate('/');
    };

    return (
        <div className="relative border-t border-border p-4" ref={ref}>
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                className="flex w-full items-center space-x-3 rounded-lg p-3 transition-colors hover:bg-muted"
            >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground">
                    {initials}
                </div>
                {!isCollapsed && (
                    <div className="min-w-0 flex-1 text-left">
                        <p className="truncate text-sm font-medium text-foreground">
                            {user.fullName}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                    </div>
                )}
            </button>

            {open && (
                <div className="absolute bottom-full left-4 right-4 z-20 mb-2 rounded-xl border border-border bg-card p-1.5 shadow-lg">
                    <Link
                        to="/perfil"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-muted"
                    >
                        <UserIcon size={16} />
                        Ver cuenta
                    </Link>
                    <Link
                        to="/"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-muted"
                    >
                        <Home size={16} />
                        Volver al inicio
                    </Link>
                    <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-destructive hover:bg-destructive/10"
                    >
                        <LogOut size={16} />
                        Cerrar sesión
                    </button>
                </div>
            )}
        </div>
    );
};

export const AdminSidebar: React.FC<SidebarProps> = ({
    isCollapsed,
    onToggle,
}) => {
    const { pathname } = useLocation();

    const isActiveRoute = (to: string) => {
        if (to === '/admin') return pathname === '/admin';
        return pathname.startsWith(to);
    };

    return (
        <div
            className={`flex flex-col border-r border-border bg-card transition-all duration-300 ease-in-out ${isCollapsed ? 'w-18' : 'w-64'
                }`}
        >
            <div className="flex h-18 items-center justify-between border-b border-border p-4">
                {!isCollapsed && <CustomLogo />}
                <button
                    onClick={onToggle}
                    className="rounded-lg p-2 transition-colors hover:bg-muted"
                >
                    {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                </button>
            </div>

            <nav className="flex-1 p-4">
                <ul className="space-y-2">
                    {menuItems.map(({ icon: Icon, label, to }) => (
                        <li key={to}>
                            <Link
                                to={to}
                                className={`group flex items-center space-x-3 rounded-lg px-3 py-2 transition-all duration-200 ${isActiveRoute(to)
                                    ? 'border-r-2 border-primary bg-primary/10 text-primary'
                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                    }`}
                            >
                                <Icon size={20} className="flex-shrink-0" />
                                {!isCollapsed && (
                                    <span className="font-medium">{label}</span>
                                )}
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>

            <UserMenu isCollapsed={isCollapsed} />
        </div>
    );
};
