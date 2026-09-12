import { Link } from 'react-router';
import { AtSign, CalendarCheck, Clock, MapPin, Phone } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { SectionHeading } from '@/shop/components/SectionHeading';
import { formatScheduleLines } from '@/shop/lib/format-schedule';
import { salon, whatsappLink } from '@/shop/lib/salon';
import { useSalonSchedule } from '@/shop/hooks/use-salon-schedule';

const cardClass =
  'flex items-start gap-4 rounded-2xl border border-brand/10 bg-background p-6 transition-colors';

/** Sección "Contacto". Se usa en el home (ancla #contacto) y en /contacto. */
export const ContactoSection = () => {
  const { data: schedule } = useSalonSchedule();
  const scheduleLines = schedule ? formatScheduleLines(schedule) : [];

  return (
    <section id="contacto" className="scroll-mt-20 bg-cream">
      <div className="container mx-auto px-4 py-20 lg:px-8 lg:py-24">
        <SectionHeading
          eyebrow="Contacto"
          title="Hablemos de tus uñas"
          subtitle="Escríbenos para dudas, cotizaciones o para agendar tu cita. Te respondemos lo antes posible."
        />

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:max-w-4xl">
          <a
            href={whatsappLink('Hola, me gustaría agendar una cita 💅')}
            target="_blank"
            rel="noreferrer"
            className={`${cardClass} hover:border-brand/30 hover:shadow-sm`}
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
              <Phone className="h-5 w-5" />
            </span>
            <div>
              <p className="font-medium text-brand-dark">WhatsApp / Teléfono</p>
              <p className="mt-1 text-muted-foreground">{salon.phone}</p>
            </div>
          </a>

          <a
            href={`https://instagram.com/${salon.instagram}`}
            target="_blank"
            rel="noreferrer"
            className={`${cardClass} hover:border-brand/30 hover:shadow-sm`}
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
              <AtSign className="h-5 w-5" />
            </span>
            <div>
              <p className="font-medium text-brand-dark">Instagram</p>
              <p className="mt-1 text-muted-foreground">@{salon.instagram}</p>
            </div>
          </a>

          <div className={cardClass}>
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
              <MapPin className="h-5 w-5" />
            </span>
            <div>
              <p className="font-medium text-brand-dark">Ubicación</p>
              <p className="mt-1 text-muted-foreground">{salon.address}</p>
            </div>
          </div>

          <div className={cardClass}>
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
              <Clock className="h-5 w-5" />
            </span>
            <div>
              <p className="font-medium text-brand-dark">Horario</p>
              <ul className="mt-1 space-y-1 text-muted-foreground">
                {scheduleLines.map((h) => (
                  <li key={h.days}>
                    {h.days}: {h.time}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-14">
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
    </section>
  );
};
