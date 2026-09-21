import { Link } from 'react-router';
import {
  ArrowRight,
  CalendarCheck,
  Clock,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ProductsGrid } from '@/shop/components/ProductsGrid';
import { ProductsGridSkeleton } from '@/shop/components/ProductsGridSkeleton';
import { SectionHeading } from '@/shop/components/SectionHeading';
import { ContactoSection } from '@/shop/components/sections/ContactoSection';
import { NosotrosSection } from '@/shop/components/sections/NosotrosSection';
import { useCatalog } from '@/shop/hooks/use-catalog';
import { useHero } from '@/shop/hooks/use-hero';

const steps = [
  {
    icon: Sparkles,
    title: 'Elige tu estilo',
    text: 'Explora el catálogo de manicura, acrílico y nail art de autor.',
  },
  {
    icon: Clock,
    title: 'Cotiza al instante',
    text: 'Mira el precio y la duración estimada antes de reservar.',
  },
  {
    icon: CalendarCheck,
    title: 'Agenda tu cita',
    text: 'Escoge día y hora disponibles y recibe tu confirmación.',
  },
];

export const HomePage = () => {
  const { data, isLoading } = useCatalog({ limit: 6, sort: 'recent' });
  // La portada la edita la administradora desde el panel; si la API no
  // responde, el hook devuelve el texto y la foto con los que salió el sitio.
  const { hero, image: heroImage, shape, isUnknown } = useHero();
  // El endpoint público ya devuelve solo las entradas visibles.
  const items = data?.products ?? [];

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-brand/10 bg-cream">
        {/* Destello cálido detrás del texto: da profundidad sin cargar la
            portada con otro bloque de contenido. */}
        <div
          aria-hidden
          className="pointer-events-none absolute -left-40 -top-40 h-[32rem] w-[32rem] rounded-full bg-gold/40 blur-3xl"
        />
        <div className="relative container mx-auto grid items-center gap-12 px-4 py-20 lg:grid-cols-[1.05fr_1fr] lg:gap-20 lg:px-8 lg:py-28">
          <div>
            {/*
              Mientras no se sabe qué portada va, se reserva el espacio en vez
              de pintar el texto de respaldo: mostrarlo y reemplazarlo al
              instante se veía como un parpadeo al recargar. Solo pasa la
              primera vez; después el navegador ya tiene la última guardada.
            */}
            {isUnknown ? (
              <div aria-hidden className="animate-pulse">
                <div className="h-4 w-48 rounded bg-brand/10" />
                <div className="mt-5 h-12 w-full rounded bg-brand/10 sm:h-16" />
                <div className="mt-3 h-12 w-3/4 rounded bg-brand/10 sm:h-16" />
                <div className="mt-6 h-16 max-w-lg rounded bg-brand/10" />
              </div>
            ) : (
              <>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">
                  {hero.eyebrow}
                </p>

                <h1 className="mt-5 font-display text-[3rem] leading-[1.03] tracking-tight text-balance text-brand-dark sm:text-[4.25rem]">
                  {hero.title}
                </h1>

                <p className="mt-6 max-w-md text-lg leading-relaxed text-muted-foreground">
                  {hero.subtitle}
                </p>
              </>
            )}

            <div className="mt-9 flex flex-wrap gap-3">
              <Button
                size="lg"
                render={<Link to="/shop/agendar" />}
                className="h-12 bg-brand px-7 text-base text-brand-foreground hover:bg-brand-dark"
              >
                Agendar mi cita
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                render={<Link to="/shop" />}
                className="h-12 border-brand/25 bg-transparent px-7 text-base text-brand-dark hover:bg-brand/5"
              >
                Ver servicios
              </Button>
            </div>

            <dl className="mt-12 flex flex-wrap gap-x-10 gap-y-6 border-t border-brand/15 pt-8">
              <div className="border-l-2 border-gold pl-4">
                <dt className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                  Atención
                </dt>
                <dd className="mt-1.5 font-display text-xl text-brand-dark">
                  Una clienta a la vez
                </dd>
              </div>
              <div className="border-l-2 border-gold pl-4">
                <dt className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                  Reservas
                </dt>
                <dd className="mt-1.5 font-display text-xl text-brand-dark">
                  En línea, 24/7
                </dd>
              </div>
            </dl>
          </div>

          <div className="relative mx-auto w-full max-w-lg">
            {isUnknown ? (
              <div
                aria-hidden
                className={`${shape.className} w-full animate-pulse rounded-3xl bg-brand/10`}
              />
            ) : (
              <>
                <img
                  src={heroImage}
                  alt="Trabajo de uñas de Luné by Kelin"
                  fetchPriority="high"
                  decoding="async"
                  className={`${shape.className} w-full rounded-3xl object-cover shadow-xl shadow-brand/15 ring-1 ring-brand/10`}
                />
                {/* Rompe el rectángulo de la foto y adelanta el dato que más
                    preguntan antes de escribir. */}
                <div className="absolute -bottom-5 -left-3 hidden rounded-2xl border border-brand/10 bg-background px-5 py-4 shadow-lg shadow-brand/10 sm:block">
                  <p className="font-display text-2xl leading-none text-brand-dark">
                    Sin esperas
                  </p>
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    Elige tu hora y queda reservada
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Cómo funciona */}
      <section className="border-b border-brand/10 bg-background py-20 lg:py-28">
        <div className="container mx-auto px-4 lg:px-8">
          <SectionHeading
            align="center"
            eyebrow="Cómo funciona"
            title="Reservar es muy simple"
            subtitle="En tres pasos tienes tu cita confirmada."
          />

          {/* Tres pasos en orden, no tres tarjetas sueltas: el hilo que los
              une dice que se recorren de izquierda a derecha, y por eso la
              numeración aquí sí informa. */}
          <ol className="relative mt-16 grid gap-12 md:grid-cols-3 md:gap-8">
            <div
              aria-hidden
              className="absolute left-0 right-0 top-6 hidden border-t border-dashed border-brand/25 md:block"
            />
            {steps.map((step, i) => (
              <li key={step.title} className="relative">
                <div className="flex items-center gap-4 md:block">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gold text-brand-dark ring-8 ring-background">
                    <step.icon className="h-5 w-5" />
                  </span>
                  <p className="font-display text-sm tracking-[0.18em] text-brand md:mt-6">
                    PASO 0{i + 1}
                  </p>
                </div>
                <h3 className="mt-3 text-xl font-medium text-brand-dark">
                  {step.title}
                </h3>
                <p className="mt-2 max-w-xs leading-relaxed text-muted-foreground">
                  {step.text}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Catálogo */}
      <section id="servicios" className="scroll-mt-20 bg-cream/60 py-20 lg:py-28">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading
              eyebrow="Catálogo"
              title="Nuestros diseños"
              subtitle="Elige el tuyo y agenda en segundos."
              className="max-w-xl"
            />
            <Button
              variant="outline"
              render={<Link to="/shop" />}
              className="h-11 border-brand/25 px-5 text-brand-dark hover:bg-brand/5"
            >
              Ver todos
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="mt-12">
            {isLoading ? (
              <ProductsGridSkeleton />
            ) : (
              <ProductsGrid
                items={items}
                emptyMessage="Pronto publicaremos nuestros diseños aquí."
              />
            )}
          </div>
        </div>
      </section>

      {/* Nosotros */}
      <NosotrosSection />

      {/* Contacto */}
      <ContactoSection />

      {/* CTA final */}
      <section className="relative overflow-hidden bg-brand-dark text-brand-foreground">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-gold/15 blur-3xl"
        />
        <div className="relative container mx-auto flex flex-col items-center gap-6 px-4 py-24 text-center lg:px-8">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gold/20 text-gold">
            <ShieldCheck className="h-6 w-6" />
          </span>
          <h2 className="max-w-2xl font-display text-3xl leading-tight sm:text-4xl">
            ¿Lista para lucir unas uñas de revista?
          </h2>
          <p className="max-w-xl text-lg text-white/75">
            Agenda hoy y asegura tu lugar con nuestras nail artists.
          </p>
          <Button
            size="lg"
            render={<Link to="/shop/agendar" />}
            className="mt-2 h-12 bg-gold px-7 text-base text-brand-dark hover:bg-gold/85"
          >
            Agendar mi cita
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </section>
    </>
  );
};
