import { Link } from 'react-router';
import { AtSign, CalendarCheck, Clock, MapPin, Phone } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { formatScheduleLines } from '@/shop/lib/format-schedule';
import { salon, whatsappLink } from '@/shop/lib/salon';
import { useSalonSchedule } from '@/shop/hooks/use-salon-schedule';

/** Sección "Contacto". Se usa en el home (ancla #contacto) y en /contacto. */
export const ContactoSection = () => {
  const { data: schedule } = useSalonSchedule();
  const scheduleLines = schedule ? formatScheduleLines(schedule) : [];

  return (
    <section id="contacto" className="scroll-mt-20 bg-cream">
      <div className="container mx-auto px-4 py-16 lg:px-8 lg:py-20">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
          Contacto
        </p>
        <h2 className="mt-4 font-display text-4xl text-brand-dark sm:text-5xl">
          Hablemos de tus uñas
        </h2>
        <p className="mt-4 max-w-lg text-brand-dark/70">
          Escríbenos para dudas, cotizaciones o para agendar tu cita. Te
          respondemos lo antes posible.
        </p>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:max-w-3xl">
          <a
            href={whatsappLink('Hola, me gustaría agendar una cita 💅')}
            target="_blank"
            rel="noreferrer"
            className="flex items-start gap-4 rounded-2xl border border-brand/15 bg-background p-5 transition-colors hover:border-brand/35"
          >
            <Phone className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
            <div>
              <p className="font-semibold text-brand-dark">
                WhatsApp / Teléfono
              </p>
              <p className="mt-1 text-sm text-brand-dark/60">{salon.phone}</p>
            </div>
          </a>

          <a
            href={`https://instagram.com/${salon.instagram}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-start gap-4 rounded-2xl border border-brand/15 bg-background p-5 transition-colors hover:border-brand/35"
          >
            <AtSign className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
            <div>
              <p className="font-semibold text-brand-dark">Instagram</p>
              <p className="mt-1 text-sm text-brand-dark/60">
                @{salon.instagram}
              </p>
            </div>
          </a>

          <div className="flex items-start gap-4 rounded-2xl border border-brand/15 bg-background p-5">
            <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
            <div>
              <p className="font-semibold text-brand-dark">Ubicación</p>
              <p className="mt-1 text-sm text-brand-dark/60">{salon.address}</p>
            </div>
          </div>

          <div className="flex items-start gap-4 rounded-2xl border border-brand/15 bg-background p-5">
            <Clock className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
            <div>
              <p className="font-semibold text-brand-dark">Horario</p>
              <ul className="mt-1 space-y-0.5 text-sm text-brand-dark/60">
                {scheduleLines.map((h) => (
                  <li key={h.days}>
                    {h.days}: {h.time}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12">
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
    </section>
  );
};
