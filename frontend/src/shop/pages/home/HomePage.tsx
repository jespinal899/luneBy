import { Link } from 'react-router';
import { CalendarCheck, Sparkles, Clock, ShieldCheck, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sparkle } from '@/components/Sparkle';
import { ProductsGrid } from '@/shop/components/ProductsGrid';
import { ProductsGridSkeleton } from '@/shop/components/ProductsGridSkeleton';
import { useServices } from '@/shop/hooks/use-services';
import heroImage from '@/assets/hero-nailart.webp';

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
  const { data, isLoading } = useServices({ limit: 6, kind: 'base' });
  const services = (data?.products ?? []).filter((s) => s.isActive);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-cream">
        <Sparkle className="pointer-events-none absolute left-[5%] top-[26%] hidden h-7 w-7 text-gold lg:block" />
        <Sparkle className="pointer-events-none absolute left-[46%] top-[12%] hidden h-4 w-4 text-gold/70 lg:block" />
        <Sparkle className="pointer-events-none absolute bottom-[16%] left-[39%] hidden h-5 w-5 text-gold/80 lg:block" />

        <div className="container mx-auto grid items-center gap-12 px-4 py-16 lg:grid-cols-2 lg:gap-8 lg:px-8 lg:py-24">
          {/* Texto */}
          <div className="relative z-10 max-w-xl">
            <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.28em] text-brand/70">
              <Sparkle className="h-3.5 w-3.5" />
              Estudio de uñas
              <Sparkle className="h-3.5 w-3.5" />
            </p>

            <h1 className="mt-6 font-display text-[2.25rem] leading-[1.08] text-brand-dark sm:text-[3.5rem]">
              Tus uñas,
              <br />
              tu mejor
              <span className="mt-1 block font-script text-[1.3em] font-normal leading-[1.1] text-gold sm:text-[1.45em]">
                accesorio de lujo
              </span>
            </h1>

            <p className="mt-6 max-w-md text-base leading-relaxed text-brand-dark/70">
              Especialistas en manicura rusa, uñas acrílicas esculpidas y nail
              art de autor.
            </p>
            <p className="mt-3 max-w-md text-base leading-relaxed text-brand-dark/70">
              Cotiza tu diseño favorito en tiempo real y agenda tu cita en
              segundos.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                size="lg"
                render={<Link to="/shop/agendar" />}
                className="h-11 rounded-full bg-brand px-6 text-brand-foreground hover:bg-brand-dark"
              >
                <Sparkles className="h-4 w-4" />
                Agendar mi cita
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                render={<Link to="/shop" />}
                className="h-11 rounded-full border-brand/25 bg-transparent px-6 text-brand-dark hover:bg-brand/5"
              >
                Ver servicios
              </Button>
            </div>
          </div>

          {/* Imagen */}
          <div className="relative mx-auto w-full max-w-[78vw] sm:max-w-sm lg:max-w-md">
            <div
              aria-hidden
              className="absolute -inset-3 -z-10 -rotate-3 rounded-[42%_58%_62%_38%/48%_42%_58%_52%] border-2 border-gold/50 sm:-inset-4"
            />
            <img
              src={heroImage}
              alt="Trabajo de uñas de Luné by Kelin"
              width={1400}
              height={1750}
              fetchPriority="high"
              decoding="async"
              className="aspect-[4/5] w-full rounded-[42%_58%_62%_38%/48%_42%_58%_52%] object-cover shadow-xl shadow-brand/15"
            />
            <Sparkle className="absolute -right-2 top-6 h-6 w-6 text-gold" />
            <Sparkle className="absolute -left-4 bottom-24 h-4 w-4 text-gold/80" />
          </div>
        </div>
      </section>

      {/* Cómo funciona */}
      <section className="border-b bg-muted/40 py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-montserrat text-3xl tracking-tight">
              Reservar es muy simple
            </h2>
            <p className="mt-3 text-muted-foreground">
              En tres pasos tienes tu cita confirmada.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {steps.map((step, i) => (
              <div
                key={step.title}
                className="rounded-2xl border bg-background p-6 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand text-brand-foreground">
                    <step.icon className="h-5 w-5" />
                  </span>
                  <span className="text-4xl font-semibold text-brand/15">
                    0{i + 1}
                  </span>
                </div>
                <h3 className="mt-4 text-lg font-semibold">{step.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Catálogo */}
      <section className="py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="mb-10 flex items-end justify-between gap-4">
            <div>
              <h2 className="font-montserrat text-3xl tracking-tight">
                Nuestros servicios
              </h2>
              <p className="mt-2 text-muted-foreground">
                Elige el tuyo y agenda en segundos.
              </p>
            </div>
            <Button variant="outline" render={<Link to="/shop" />}>
              Ver todos
            </Button>
          </div>

          {isLoading ? (
            <ProductsGridSkeleton />
          ) : (
            <ProductsGrid services={services} />
          )}
        </div>
      </section>

      {/* CTA final */}
      <section className="bg-brand-dark text-brand-foreground">
        <div className="container mx-auto flex flex-col items-center gap-5 px-4 py-16 text-center lg:px-8">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold text-gold-foreground">
            <ShieldCheck className="h-6 w-6" />
          </span>
          <h2 className="max-w-2xl font-montserrat text-3xl tracking-tight sm:text-4xl">
            ¿Lista para lucir unas uñas de revista?
          </h2>
          <p className="max-w-xl text-white/80">
            Agenda hoy y asegura tu lugar con nuestras nail artists.
          </p>
          <Button
            size="lg"
            render={<Link to="/shop/agendar" />}
            className="h-11 bg-gold px-6 text-gold-foreground hover:bg-gold/90"
          >
            Agendar mi cita
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </section>
    </>
  );
};
