import { useRef, type KeyboardEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { Dialog } from '@base-ui/react/dialog';
import { LogOut, Search, Sparkles, X } from 'lucide-react';

import { useAuth } from '@/auth/context/use-auth';
import { CustomLogo } from '@/components/Custom/CustomLogo';
import { Button } from '@/components/ui/button';

interface NavLink {
  to: string;
  label: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  links: NavLink[];
}

/** Menú de navegación para móvil (drawer desde la izquierda). */
export const MobileNav = ({ open, onClose, links }: Props) => {
  const navigate = useNavigate();
  const { status, user, isAdmin, logout } = useAuth();
  const searchRef = useRef<HTMLInputElement>(null);

  const handleSearch = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') return;
    const value = searchRef.current?.value.trim() ?? '';
    onClose();
    navigate(value ? `/shop?query=${encodeURIComponent(value)}` : '/shop');
  };

  const handleLogout = () => {
    logout();
    onClose();
    navigate('/');
  };

  const itemClass =
    'block rounded-lg px-3 py-3 text-base font-medium text-brand-dark transition-colors hover:bg-brand/5';

  return (
    <Dialog.Root open={open} onOpenChange={(next) => !next && onClose()}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/30 transition-opacity duration-200 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 md:hidden" />
        <Dialog.Popup className="fixed inset-y-0 left-0 z-50 flex w-72 max-w-[82vw] flex-col bg-cream shadow-2xl transition-transform duration-300 ease-out data-[ending-style]:-translate-x-full data-[starting-style]:-translate-x-full md:hidden">
          <div className="flex items-center justify-between border-b border-brand/10 px-4 py-3">
            <CustomLogo className="max-h-11" />
            <Dialog.Close
              aria-label="Cerrar menú"
              className="rounded-full p-1.5 text-brand-dark/60 transition-colors hover:bg-brand/5 hover:text-brand-dark"
            >
              <X className="h-5 w-5" />
            </Dialog.Close>
          </div>

          <div className="border-b border-brand/10 p-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-dark/40" />
              <input
                ref={searchRef}
                type="search"
                placeholder="Buscar servicios..."
                onKeyDown={handleSearch}
                className="h-10 w-full rounded-full border border-brand/15 bg-white pl-9 pr-3 text-sm outline-none focus:border-brand/40"
              />
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto p-3">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={onClose}
                className={itemClass}
              >
                {l.label}
              </Link>
            ))}
            {status === 'authenticated' && (
              <Link to="/mis-citas" onClick={onClose} className={itemClass}>
                Mis citas
              </Link>
            )}
          </nav>

          <div className="border-t border-brand/10 p-4">
            {status === 'authenticated' ? (
              <div className="space-y-3">
                {user?.fullName && (
                  <p className="px-1 text-sm text-brand-dark/60">
                    {user.fullName}
                  </p>
                )}
                {isAdmin && (
                  <Button
                    render={<Link to="/admin" onClick={onClose} />}
                    className="w-full gap-1.5 rounded-full bg-brand text-brand-foreground hover:bg-brand-dark"
                  >
                    <Sparkles className="h-4 w-4" />
                    Panel de administración
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  className="w-full gap-1.5 rounded-full border-brand/25 text-brand-dark hover:bg-brand/5"
                >
                  <LogOut className="h-4 w-4" />
                  Cerrar sesión
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <Button
                  render={<Link to="/auth/login" onClick={onClose} />}
                  className="w-full rounded-full bg-brand text-brand-foreground hover:bg-brand-dark"
                >
                  Iniciar sesión
                </Button>
                <Button
                  variant="outline"
                  render={<Link to="/auth/register" onClick={onClose} />}
                  className="w-full rounded-full border-brand/25 text-brand-dark hover:bg-brand/5"
                >
                  Crear cuenta
                </Button>
              </div>
            )}
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
