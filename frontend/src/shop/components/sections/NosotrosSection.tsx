import { Link } from 'react-router';
import {
  CalendarCheck,
  HeartHandshake,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { SectionHeading } from '@/shop/components/SectionHeading';
import heroImage from '@/assets/hero-nailart.webp';

const valores = [
  {
    icon: ShieldCheck,
    title: 'Higiene primero',
    text: 'Esterilización de instrumentos y material desechable en cada servicio.',
  },
  {
    icon: Sparkles,
    title: 'Técnica de autor',
    text: 'Manicura rusa, acrílico esculpido y nail art hecho a mano, sin plantillas.',
  },
  {
    icon: HeartHandshake,
    title: 'Atención personal',
    text: 'Una sola clienta a la vez: tu cita es tuya, sin prisas ni interrupciones.',
  },
];

/** Sección "Nosotros". Se usa en el home (ancla #nosotros) y en /nosotros. */
export const NosotrosSection = () => {
  return (
    <section id="nosotros" className="scroll-mt-20 bg-cream">
      <div className="container mx-auto grid items-center gap-14 px-4 py-20 lg:grid-cols-2 lg:gap-20 lg:px-8 lg:py-24">
        <div>
          <SectionHeading eyebrow="Nosotros" title="El estudio de Kelin" />
          <p className="mt-6 leading-relaxed text-muted-foreground">
            Luné by Kelin nació de las ganas de hacer las cosas bien: uñas
            bonitas que además cuidan tu uña natural. Cada diseño se trabaja con
            calma, con productos de calidad y con la atención puesta en el
            detalle.
          </p>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            No somos una cadena. Somos un espacio pequeño donde vas a sentirte
            atendida de verdad, con el tiempo que tu servicio necesita.
          </p>
        </div>

        <div className="mx-auto w-full max-w-md">
          <img
            src={heroImage}
            alt="Trabajo de uñas de Luné by Kelin"
            loading="lazy"
            className="aspect-[4/5] w-full rounded-3xl object-cover shadow-xl shadow-brand/10"
          />
        </div>
      </div>

      <div className="border-t border-brand/10 bg-background">
        <div className="container mx-auto px-4 py-20 lg:px-8">
          <div className="grid gap-6 md:grid-cols-3">
            {valores.map((v) => (
              <div
                key={v.title}
                className="rounded-2xl border border-brand/10 p-7 transition-colors hover:border-brand/25"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 text-brand">
                  <v.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-6 text-lg font-medium text-brand-dark">
                  {v.title}
                </h3>
                <p className="mt-2 leading-relaxed text-muted-foreground">
                  {v.text}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-14 text-center">
            <Button
              size="lg"
              render={<Link to="/shop/agendar" />}
              className="h-12 bg-brand px-7 text-base text-brand-foreground hover:bg-brand-dark"
            >
              <CalendarCheck className="h-4 w-4" />
              Agendar mi cita
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
