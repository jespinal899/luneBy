import { Link } from 'react-router';
import { CalendarCheck, Sparkles, Clock, ShieldCheck, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductsGrid } from '@/shop/components/ProductsGrid';
import { useServices } from '@/shop/hooks/use-services';
import heroImage from '@/assets/service-nailart.jpg';

const stats = [
  { value: '4.9', label: 'Valoración de clientas' },
  { value: '+2.500', label: 'Citas realizadas' },
];

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
  const { data, isLoading } = useServices({ limit: 6 });
  const services = (data?.products ?? []).filter((s) => s.isActive);

  return (
    <>
      {/* Hero — banner ancho */}
      <section className="relative isolate overflow-hidden">
        <img
          src={heroImage}
          alt="Estudio de uñas Lune By Kelin"
          className="absolute inset-0 -z-10 h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 -z-10 bg-gradient from-brand-dark/95 via-brand/80 to-brand/40" />

        <div className="container mx-auto px-4 py-16 md:py-24 lg:px-8">
          <div className="max-w-2xl text-brand-foreground">
            <span className="inline-flex items-center gap-2 rounded-full bg-gold px-3 py-1 text-xs font-semibold tracking-wide text-gold-foreground">
              <Sparkles className="h-3.5 w-3.5" />
              Estudio de uñas · Lune By Kelin
            </span>
            <h1 className="mt-5 font-display text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
              Tus uñas, tu mejor{' '}
              <span className="italic text-gold">accesorio de lujo</span>
            </h1>
            <p className="mt-4 max-w-xl text-base text-white/85 sm:text-lg">
              Bienvenida a LuneBy Kelin. Especialistas en manicura rusa, uñas
              acrílicas esculpidas y nail art de autor. Cotiza tu diseño favorito en
              tiempo real y agenda tu cita en segundos.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button
                size="lg"
                render={<Link to="/shop/agendar" />}
                className="h-11 bg-gold px-6 text-gold-foreground hover:bg-gold/90"
              >
                Agendar cita
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="secondary"
                render={<Link to="/shop" />}
                className="h-11 px-6"
              >
                Ver servicios
              </Button>
            </div>

            <div className="mt-10 flex flex-wrap gap-x-10 gap-y-4">
              {stats.map((s) => (
                <div key={s.label}>
                  <p className="text-2xl font-semibold">{s.value}</p>
                  <p className="text-sm text-white/70">{s.label}</p>
                </div>
              ))}
            </div>
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
            <p className="py-16 text-center text-muted-foreground">
              Cargando servicios…
            </p>
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
