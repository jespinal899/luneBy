import { useRef, useState, type KeyboardEvent } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router';
import { Calculator, Menu, Search } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { CustomLogo } from '@/components/Custom/CustomLogo';
import { UserMenu } from '@/auth/components/UserMenu';
import { useAuth } from '@/auth/context/use-auth';
import { useQuote } from '@/quote/use-quote';
import { formatLps } from '@/shop/lib/format';
import { MobileNav } from './MobileNav';

/**
 * El sitio público es una sola página: el header desplaza a las secciones
 * ancla del home. "Agendar" es la excepción: abre el flujo de reserva.
 */
export const navLinks = [
  { to: '/', label: 'Inicio' },
  { to: '/#servicios', label: 'Servicios' },
  { to: '/shop/agendar', label: 'Agendar' },
  { to: '/#nosotros', label: 'Nosotros' },
  { to: '/#contacto', label: 'Contacto' },
];

export const CustomHeader = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { pathname, hash } = useLocation();
  const { status } = useAuth();
  const quote = useQuote();
  const [menuOpen, setMenuOpen] = useState(false);

  // Marca activo el enlace del header (rutas normales y anclas del home).
  const isNavActive = (to: string) => {
    const anchor = to.split('#')[1];
    if (anchor) return pathname === '/' && hash === `#${anchor}`;
    if (to === '/') return pathname === '/' && !hash;
    return pathname === to || pathname.startsWith(`${to}/`);
  };

  // Si ya estás en el destino, vuelve a desplazar (Link no re-navega a la
  // misma URL, así que el scroll automático no se dispararía).
  const handleAnchorClick = (to: string) => {
    const anchor = to.split('#')[1];
    if (to === '/' && pathname === '/' && !hash) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (anchor && pathname === '/' && hash === `#${anchor}`) {
      document
        .getElementById(anchor)
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const inputRef = useRef<HTMLInputElement>(null);
  const query = searchParams.get('query') || '';

  const handleSearch = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') return;
    const value = inputRef.current?.value || '';
    const next = new URLSearchParams();
    if (value) next.set('query', value);
    setSearchParams(next);
  };

  const linkClass = (isActive: boolean) =>
    cn(
      'text-sm font-medium text-brand-dark/75 transition-colors hover:text-brand',
      isActive && 'text-brand underline underline-offset-[6px]',
    );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-brand/10 bg-cream/95 backdrop-blur">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo + navegación */}
          <div className="flex items-center gap-3 lg:gap-8">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Abrir menú"
              className="-ml-1 rounded-lg p-1.5 text-brand-dark transition-colors hover:bg-brand/5 lg:hidden"
            >
              <Menu className="h-6 w-6" />
            </button>

            <CustomLogo className="max-h-14" />

            <nav className="hidden items-center gap-6 lg:flex">
              {navLinks.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => handleAnchorClick(l.to)}
                  className={linkClass(isNavActive(l.to))}
                >
                  {l.label}
                </Link>
              ))}
              {status === 'authenticated' && (
                <Link
                  to="/mis-citas"
                  className={linkClass(isNavActive('/mis-citas'))}
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
                className="h-9 w-48 rounded-full border-brand/15 bg-white pl-9 xl:w-60"
              />
            </div>

            {/* Cotización */}
            <button
              type="button"
              onClick={quote.open}
              aria-label="Ver mi cotización"
              className="relative flex h-9 items-center gap-1.5 rounded-full border border-brand/25 px-3 text-sm text-brand-dark transition-colors hover:bg-brand/5"
            >
              <Calculator className="h-4 w-4" />
              <span className="hidden sm:inline">
                {quote.count > 0 ? formatLps(quote.total) : 'Cotizar'}
              </span>
              {quote.count > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold text-brand-foreground">
                  {quote.count}
                </span>
              )}
            </button>

            {status === 'authenticated' ? (
              <div className="hidden lg:block">
                <UserMenu />
              </div>
            ) : (
              <Button
                render={<Link to="/auth/login" />}
                variant="outline"
                size="sm"
                className="hidden h-9 rounded-full border-brand/25 px-5 text-brand-dark hover:bg-brand/5 lg:inline-flex"
              >
                Iniciar sesión
              </Button>
            )}
          </div>
        </div>
      </div>

      <MobileNav
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        links={navLinks}
      />
    </header>
  );
};

export default CustomHeader;
