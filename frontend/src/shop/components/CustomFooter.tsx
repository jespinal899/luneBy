import { Link } from 'react-router';

import { salon } from '@/shop/lib/salon';

export const CustomFooter = () => {
  return (
    <footer className="mt-16 border-t px-4 py-12 lg:px-8">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div>
            <h3 className="mb-4 font-display text-lg text-brand-dark">
              {salon.name}
            </h3>
            <p className="text-sm text-muted-foreground">
              Estudio profesional de manicura, uñas acrílicas esculpidas y nail
              art de autor. Diseñamos con pasión y precisión para resaltar tu
              estilo único.
            </p>
          </div>

          <div>
            <h4 className="mb-4 font-medium">Explora</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/shop" className="hover:text-foreground">
                  Servicios
                </Link>
              </li>
              <li>
                <Link to="/galeria" className="hover:text-foreground">
                  Galería
                </Link>
              </li>
              <li>
                <Link to="/nosotros" className="hover:text-foreground">
                  Nosotros
                </Link>
              </li>
              <li>
                <Link to="/shop/agendar" className="hover:text-foreground">
                  Agendar cita
                </Link>
              </li>
              <li>
                <Link to="/contacto" className="hover:text-foreground">
                  Contacto
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-medium">Horario</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {salon.hours.map((h) => (
                <li key={h.days}>
                  {h.days}: {h.time}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-medium">Contacto</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>{salon.address}</li>
              <li>
                <a
                  href={`tel:${salon.phone.replace(/\s/g, '')}`}
                  className="hover:text-foreground"
                >
                  {salon.phone}
                </a>
              </li>
              <li>
                <a
                  href={`https://instagram.com/${salon.instagram}`}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-foreground"
                >
                  @{salon.instagram}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()} {salon.name}. Todos los derechos
            reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};
