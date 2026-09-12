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
  const { data, isLoading } = useCatalog({ limit: 6, sort: 'recent' });
  // El endpoint público ya devuelve solo las entradas visibles.
  const items = data?.products ?? [];

  return (
    <>
      {/* Hero */}
      <section className="border-b border-brand/10 bg-cream">
        <div className="container mx-auto grid items-center gap-12 px-4 py-20 lg:grid-cols-[1.1fr_1fr] lg:gap-20 lg:px-8 lg:py-28">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">
              Estudio de uñas · Choloma
            </p>

            <h1 className="mt-5 font-display text-[2.75rem] leading-[1.08] text-brand-dark sm:text-6xl">
              Tus uñas, tu mejor accesorio de lujo
            </h1>

            <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground">
              Especialistas en manicura rusa, uñas acrílicas esculpidas y nail
              art de autor. Cotiza tu diseño y agenda tu cita en segundos.
            </p>

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

            <dl className="mt-12 flex gap-10 border-t border-brand/10 pt-8">
              <div>
                <dt className="text-sm text-muted-foreground">Atención</dt>
                <dd className="mt-1 font-display text-xl text-brand-dark">
                  Una clienta a la vez
                </dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Reservas</dt>
                <dd className="mt-1 font-display text-xl text-brand-dark">
                  En línea, 24/7
                </dd>
              </div>
            </dl>
          </div>

          <div className="mx-auto w-full max-w-md">
            <img
              src={heroImage}
              alt="Trabajo de uñas de Luné by Kelin"
              width={1400}
              height={1750}
              fetchPriority="high"
              decoding="async"
              className="aspect-[4/5] w-full rounded-3xl object-cover shadow-xl shadow-brand/10"
            />
          </div>
        </div>
      </section>

      {/* Cómo funciona */}
      <section className="border-b border-brand/10 bg-background py-20 lg:py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <SectionHeading
            align="center"
            eyebrow="Cómo funciona"
            title="Reservar es muy simple"
            subtitle="En tres pasos tienes tu cita confirmada."
          />

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {steps.map((step, i) => (
              <div
                key={step.title}
                className="rounded-2xl border border-brand/10 bg-cream p-7 transition-colors hover:border-brand/25"
              >
                <div className="flex items-center justify-between">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand text-brand-foreground">
                    <step.icon className="h-5 w-5" />
                  </span>
                  <span className="font-display text-3xl text-brand/25">
                    0{i + 1}
                  </span>
                </div>
                <h3 className="mt-6 text-lg font-medium text-brand-dark">
                  {step.title}
                </h3>
                <p className="mt-2 leading-relaxed text-muted-foreground">
                  {step.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Catálogo */}
      <section id="servicios" className="scroll-mt-20 py-20 lg:py-24">
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
      <section className="bg-brand-dark text-brand-foreground">
        <div className="container mx-auto flex flex-col items-center gap-6 px-4 py-20 text-center lg:px-8">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
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
            variant="secondary"
            render={<Link to="/shop/agendar" />}
            className="mt-2 h-12 px-7 text-base"
          >
            Agendar mi cita
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </section>
    </>
  );
};
