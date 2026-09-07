import { useRef, type KeyboardEvent } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router';
import { LogOut, Search, Sparkles } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { CustomLogo } from '@/components/Custom/CustomLogo';
import { useAuth } from '@/auth/context/use-auth';

const navLinks = [
  { to: '/', label: 'Inicio', match: (shop?: string) => !shop },
  { to: '/shop/servicios', label: 'Servicios', match: (s?: string) => s === 'servicios' },
  { to: '/shop/agendar', label: 'Agendar', match: (s?: string) => s === 'agendar' },
  { to: '/shop/contacto', label: 'Contacto', match: (s?: string) => s === 'contacto' },
];

export const CustomHeader = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { shop } = useParams();
  const navigate = useNavigate();
  const { status, user, isAdmin, logout } = useAuth();

  const inputRef = useRef<HTMLInputElement>(null);
  const query = searchParams.get('query') || '';

  const handleSearch = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') return;
    const value = inputRef.current?.value || '';
    const next = new URLSearchParams();
    if (value) next.set('query', value);
    setSearchParams(next);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const linkClass = (active: boolean) =>
    cn(
      'text-sm font-medium text-brand-dark/75 transition-colors hover:text-brand',
      active && 'text-brand underline decoration-gold decoration-2 underline-offset-[6px]',
    );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-brand/10 bg-[#FBF6EC]/95 backdrop-blur">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-6">
          {/* Logo + navegación */}
          <div className="flex items-center gap-8">
            <CustomLogo className="max-h-14" />

            <nav className="hidden items-center gap-7 md:flex">
              {navLinks.map((l) => (
                <Link key={l.to} to={l.to} className={linkClass(l.match(shop))}>
                  {l.label}
                </Link>
              ))}
              {status === 'authenticated' && (
                <Link
                  to="/mis-citas"
                  className={linkClass(shop === 'mis-citas')}
                >
                  Mis citas
                </Link>
              )}
            </nav>
          </div>

          {/* Búsqueda + sesión */}
          <div className="flex items-center gap-3">
            <div className="relative hidden lg:block">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-dark/40" />
              <Input
                ref={inputRef}
                placeholder="Buscar servicios..."
                defaultValue={query}
                onKeyDown={handleSearch}
                className="h-9 w-56 rounded-full border-brand/15 bg-white pl-9 xl:w-64"
              />
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="rounded-full lg:hidden"
            >
              <Search className="h-5 w-5" />
            </Button>

            {status === 'authenticated' ? (
              <div className="flex items-center gap-2">
                <span className="hidden text-sm font-medium text-brand-dark/70 xl:inline">
                  {user?.fullName}
                </span>
                {isAdmin && (
                  <Button
                    render={<Link to="/admin" />}
                    size="sm"
                    className="h-9 gap-1.5 rounded-full bg-brand px-4 text-brand-foreground hover:bg-brand-dark"
                  >
                    <Sparkles className="h-4 w-4" />
                    Admin
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="h-9 gap-1.5 rounded-full border-brand/25 px-4 text-brand-dark hover:bg-brand/5"
                >
                  <LogOut className="h-4 w-4" />
                  Salir
                </Button>
              </div>
            ) : (
              <Button
                render={<Link to="/auth/login" />}
                variant="outline"
                size="sm"
                className="h-9 rounded-full border-brand/25 px-5 text-brand-dark hover:bg-brand/5"
              >
                Login
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default CustomHeader;
