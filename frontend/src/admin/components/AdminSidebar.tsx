import { Link, useLocation } from 'react-router';
import {
    LayoutDashboard,
    CalendarDays,
    Users,
    Scissors,
    UserCog,
    FileBarChart,
    Bell,
    Settings,
    LifeBuoy,
    ChevronLeft,
    ChevronRight,
    LogOut,
} from 'lucide-react';
import { CustomLogo } from '@/components/Custom/CustomLogo';

interface SidebarProps {
    isCollapsed: boolean;
    onToggle: () => void;
}

const sections = [
    {
        title: 'General',
        items: [
            { icon: LayoutDashboard, label: 'Panel', to: '/admin' },
            { icon: CalendarDays, label: 'Agenda', to: '/admin/agenda' },
            { icon: Users, label: 'Clientas', to: '/admin/clientas' },
        ],
    },
    {
        title: 'Gestión',
        items: [
            { icon: Scissors, label: 'Servicios', to: '/admin/products' },
            { icon: UserCog, label: 'Personal', to: '/admin/personal' },
            { icon: FileBarChart, label: 'Reportes', to: '/admin/reportes' },
        ],
    },
    {
        title: 'Cuenta',
        items: [
            { icon: Bell, label: 'Notificaciones', to: '/admin/notificaciones' },
            { icon: Settings, label: 'Ajustes', to: '/admin/ajustes' },
            { icon: LifeBuoy, label: 'Ayuda', to: '/admin/ayuda' },
        ],
    },
];

export const AdminSidebar: React.FC<SidebarProps> = ({
    isCollapsed,
    onToggle,
}) => {
    const { pathname } = useLocation();

    const isActiveRoute = (to: string) => {
        if (to === '/admin') return pathname === '/admin';
        return pathname === to || pathname.startsWith(`${to}/`);
    };

    return (
        <div
            className={`flex flex-col border-r border-slate-200 bg-white transition-all duration-300 ease-in-out ${
                isCollapsed ? 'w-20' : 'w-64'
            }`}
        >
            {/* Header */}
            <div className="flex h-18 items-center justify-between border-b border-slate-200 px-4">
                {!isCollapsed && <CustomLogo />}
                <button
                    onClick={onToggle}
                    className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
                >
                    {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
                {sections.map((section) => (
                    <div key={section.title}>
                        {!isCollapsed && (
                            <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                                {section.title}
                            </p>
                        )}
                        <ul className="space-y-1">
                            {section.items.map((item) => {
                                const Icon = item.icon;
                                const active = isActiveRoute(item.to);
                                return (
                                    <li key={item.label}>
                                        <Link
                                            to={item.to}
                                            title={isCollapsed ? item.label : undefined}
                                            className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                                                isCollapsed ? 'justify-center' : ''
                                            } ${
                                                active
                                                    ? 'bg-slate-900 text-white'
                                                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                            }`}
                                        >
                                            <Icon size={18} className="shrink-0" />
                                            {!isCollapsed && (
                                                <span className="font-medium">{item.label}</span>
                                            )}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                ))}
            </nav>

            {/* User Profile */}
            <div className="border-t border-slate-200 p-3">
                <div
                    className={`flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-slate-100 ${
                        isCollapsed ? 'justify-center' : ''
                    }`}
                >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
                        KD
                    </div>
                    {!isCollapsed && (
                        <>
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-slate-900">
                                    Kelin Domínguez
                                </p>
                                <p className="truncate text-xs text-slate-400">
                                    admin@lunebykelin.com
                                </p>
                            </div>
                            <button
                                className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-900"
                                title="Cerrar sesión"
                            >
                                <LogOut size={16} />
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
