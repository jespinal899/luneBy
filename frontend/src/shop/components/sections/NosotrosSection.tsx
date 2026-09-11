import { Link } from 'react-router';
import {
  CalendarCheck,
  HeartHandshake,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
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
      <div className="container mx-auto grid items-center gap-12 px-4 py-16 lg:grid-cols-2 lg:px-8 lg:py-20">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
            Nosotros
          </p>
          <h2 className="mt-4 font-display text-4xl text-brand-dark sm:text-5xl">
            El estudio de Kelin
          </h2>
          <p className="mt-6 text-brand-dark/70">
            Luné by Kelin nació de las ganas de hacer las cosas bien: uñas
            bonitas que además cuidan tu uña natural. Cada diseño se trabaja con
            calma, con productos de calidad y con la atención puesta en el
            detalle.
          </p>
          <p className="mt-3 text-brand-dark/70">
            No somos una cadena. Somos un espacio pequeño donde vas a sentirte
            atendida de verdad, con el tiempo que tu servicio necesita.
          </p>
        </div>

        <div className="relative mx-auto w-full max-w-sm lg:max-w-md">
          <img
            src={heroImage}
            alt="Trabajo de uñas de Luné by Kelin"
            loading="lazy"
            className="aspect-[4/5] w-full rounded-2xl object-cover shadow-lg"
          />
        </div>
      </div>

      <div className="border-t border-brand/10 bg-background">
        <div className="container mx-auto px-4 py-16 lg:px-8">
          <div className="grid gap-6 md:grid-cols-3">
            {valores.map((v) => (
              <div
                key={v.title}
                className="rounded-2xl border border-brand/10 p-6"
              >
                <v.icon className="h-6 w-6 text-brand" />
                <h3 className="mt-4 font-display text-lg text-brand-dark">
                  {v.title}
                </h3>
                <p className="mt-1 text-sm text-brand-dark/60">{v.text}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Button
              size="lg"
              render={<Link to="/shop/agendar" />}
              className="h-11 rounded-full bg-brand px-6 text-brand-foreground hover:bg-brand-dark"
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
