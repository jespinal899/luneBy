import { Menu } from '@base-ui/react/menu';
import {
  CalendarCheck,
  ChevronDown,
  LogOut,
  Sparkles,
  UserRound,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router';

import { cn } from '@/lib/utils';
import { initials } from '@/lib/initials';
import { useAuth } from '../context/use-auth';

const itemClass =
  'flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-brand-dark outline-none select-none data-[highlighted]:bg-brand/5';

/** Menú de cuenta estilo Office 365: avatar → nombre, correo, acciones. */
export const UserMenu = () => {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  return (
    <Menu.Root>
      <Menu.Trigger
        className="flex items-center gap-1.5 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
        aria-label="Menú de cuenta"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-sm font-semibold text-brand-foreground">
          {initials(user.fullName)}
        </span>
        <ChevronDown className="hidden h-4 w-4 text-brand-dark/50 sm:block" />
      </Menu.Trigger>

      <Menu.Portal>
        <Menu.Positioner sideOffset={8} align="end">
          <Menu.Popup className="z-50 w-64 rounded-xl border border-brand/15 bg-background p-1.5 shadow-lg shadow-brand/10 outline-none data-[ending-style]:opacity-0 data-[starting-style]:opacity-0">
            <div className="flex items-center gap-3 px-3 py-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-semibold text-brand-foreground">
                {initials(user.fullName)}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-brand-dark">
                  {user.fullName}
                </p>
                <p className="truncate text-xs text-brand-dark/55">
                  {user.email}
                </p>
              </div>
            </div>

            <Menu.Separator className="my-1 h-px bg-brand/10" />

            {isAdmin && (
              <Menu.Item
                className={cn(itemClass, 'font-medium text-brand')}
                render={<Link to="/admin" />}
              >
                <Sparkles className="h-4 w-4" />
                Panel de administración
              </Menu.Item>
            )}

            <Menu.Item className={itemClass} render={<Link to="/perfil" />}>
              <UserRound className="h-4 w-4" />
              Ver cuenta
            </Menu.Item>

            <Menu.Item className={itemClass} render={<Link to="/mis-citas" />}>
              <CalendarCheck className="h-4 w-4" />
              Mis citas
            </Menu.Item>

            <Menu.Separator className="my-1 h-px bg-brand/10" />

            <Menu.Item
              className={cn(itemClass, 'text-destructive')}
              onClick={() => {
                logout();
                navigate('/');
              }}
            >
              <LogOut className="h-4 w-4" />
              Cerrar sesión
            </Menu.Item>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
};
