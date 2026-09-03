import { Link, useLocation } from 'react-router';
import {
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    Home,
    Scissors,
} from 'lucide-react';

import { useAuth } from '@/auth/context/use-auth';
import { CustomLogo } from '@/components/Custom/CustomLogo';

interface SidebarProps {
    isCollapsed: boolean;
    onToggle: () => void;
}

const menuItems = [
    { icon: Home, label: 'Dashboard', to: '/admin' },
    { icon: Scissors, label: 'Servicios', to: '/admin/products' },
    { icon: CalendarDays, label: 'Citas', to: '/admin/citas' },
];

export const AdminSidebar: React.FC<SidebarProps> = ({
    isCollapsed,
    onToggle,
}) => {
    const { pathname } = useLocation();
    const { user } = useAuth();

    const isActiveRoute = (to: string) => {
        if (to === '/admin') return pathname === '/admin';
        return pathname.startsWith(to);
    };

    const initials = (user?.fullName ?? '?')
        .split(' ')
        .map((w) => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

    return (
        <div
            className={`flex flex-col border-r border-gray-200 bg-white transition-all duration-300 ease-in-out ${
                isCollapsed ? 'w-18' : 'w-64'
            }`}
        >
            <div className="flex h-18 items-center justify-between border-b border-gray-200 p-4">
                {!isCollapsed && <CustomLogo />}
                <button
                    onClick={onToggle}
                    className="rounded-lg p-2 transition-colors hover:bg-gray-100"
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
                                className={`group flex items-center space-x-3 rounded-lg px-3 py-2 transition-all duration-200 ${
                                    isActiveRoute(to)
                                        ? 'border-r-2 border-blue-600 bg-blue-50 text-blue-600'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
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

            {!isCollapsed && user && (
                <div className="border-t border-gray-200 p-4">
                    <div className="flex items-center space-x-3 rounded-lg p-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br from-blue-500 to-purple-600 font-semibold text-white">
                            {initials}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-gray-900">
                                {user.fullName}
                            </p>
                            <p className="truncate text-xs text-gray-500">{user.email}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
