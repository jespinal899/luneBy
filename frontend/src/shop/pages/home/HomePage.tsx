import { Link } from 'react-router';
import { CalendarCheck, Clock, ShieldCheck, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductsGrid } from '@/shop/components/ProductsGrid';
import { ProductsGridSkeleton } from '@/shop/components/ProductsGridSkeleton';
import { ContactoSection } from '@/shop/components/sections/ContactoSection';
import { NosotrosSection } from '@/shop/components/sections/NosotrosSection';
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
  const { data, isLoading } = useServices({ limit: 6, sort: 'recent' });
  // El endpoint público ya devuelve solo los visibles (`isActive`).
  const services = data?.products ?? [];

  return (
    <>
      {/* Hero */}
      <section className="border-b bg-cream">
        <div className="container mx-auto grid items-center gap-12 px-4 py-16 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-24">
          {/* Texto */}
          <div className="max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
              Estudio de uñas
            </p>

            <h1 className="mt-4 font-display text-4xl leading-tight text-brand-dark sm:text-5xl">
              Tus uñas, tu mejor accesorio de lujo
            </h1>

            <p className="mt-6 max-w-md leading-relaxed text-brand-dark/70">
              Especialistas en manicura rusa, uñas acrílicas esculpidas y nail
              art de autor. Cotiza tu diseño favorito en tiempo real y agenda
              tu cita en segundos.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                size="lg"
                render={<Link to="/shop/agendar" />}
                className="h-11 bg-brand px-6 text-brand-foreground hover:bg-brand-dark"
              >
                Agendar mi cita
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                render={<Link to="/shop" />}
                className="h-11 border-brand/25 bg-transparent px-6 text-brand-dark hover:bg-brand/5"
              >
                Ver servicios
              </Button>
            </div>
          </div>

          {/* Imagen */}
          <div className="mx-auto w-full max-w-sm lg:max-w-md">
            <img
              src={heroImage}
              alt="Trabajo de uñas de Luné by Kelin"
              width={1400}
              height={1750}
              fetchPriority="high"
              decoding="async"
              className="aspect-[4/5] w-full rounded-2xl object-cover shadow-lg"
            />
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
      <section id="servicios" className="scroll-mt-20 py-16">
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

      {/* Nosotros */}
      <NosotrosSection />

      {/* Contacto */}
      <ContactoSection />

      {/* CTA final */}
      <section className="bg-brand-dark text-brand-foreground">
        <div className="container mx-auto flex flex-col items-center gap-5 px-4 py-16 text-center lg:px-8">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
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
            variant="secondary"
            render={<Link to="/shop/agendar" />}
            className="h-11 px-6"
          >
            Agendar mi cita
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </section>
    </>
  );
};
