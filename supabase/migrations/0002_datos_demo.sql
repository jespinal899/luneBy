-- 0002 · Datos demo de Luné by Kelin
--
-- Usuarios de ejemplo, catálogo de servicios y horario de trabajo base.
-- Idempotente:
--   · users y services      -> "on conflict (email|name) do nothing"
--   · availability_rules     -> solo para los días sin regla ("where not exists")
--
-- Contraseña de los dos usuarios: Abc123  (hash bcrypt, cost 10).
-- Cámbiala en cuanto entres por primera vez.

-- ---------------------------------------------------------------------------
-- Usuarios
-- ---------------------------------------------------------------------------
insert into public.users (email, password, "fullName", phone, "isActive", roles)
values
  ('kelin@luneby.com', '$2b$10$ckqPNMR7vKSYUjE0wn4sdu1jM1R3nqVeNSrDM4p5rQku5dTZLfSWy', 'Kelin (Admin)',     null,           true, '{admin}'),
  ('cliente@test.com', '$2b$10$kOIkuLVh8esUjD5C3IYcAOSxPo81rvUldMqi7h7N998oNPIPWNQfq', 'Clienta de Prueba', '+18090000000', true, '{client}')
on conflict (email) do nothing;

-- ---------------------------------------------------------------------------
-- Catálogo de servicios  (slug = slugify(name), igual que en el backend)
-- ---------------------------------------------------------------------------
insert into public.services (name, slug, price, category, "durationMin", description, "isActive")
values
  ('Manicura Rusa Premium', 'manicura-rusa-premium', 35, 'Manicura', 75,
    'Técnica de precisión milimétrica que limpia profundamente la cutícula para permitir un esmaltado debajo del pliegue ungueal con duración de 3 semanas.', true),
  ('Uñas Acrílicas Esculpidas', 'u-as-acr-licas-esculpidas', 65, 'Acrilico', 120,
    'Extensión y modelado de uñas acrílicas a mano alzada para un acabado natural, resistente y elegante.', true),
  ('Diseño Nail Art de Autor', 'dise-o-nail-art-de-autor', 45, 'Nail Art', 90,
    'Diseños creativos personalizados y pintados a mano alzada por nuestras artistas especialistas.', true),
  ('Esmaltado Semipermanente', 'esmaltado-semipermanente', 25, 'Semipermanente', 45,
    'Esmaltado de larga duración con brillo extremo, curado bajo cabina LED para uñas impecables.', true),
  ('Pedicura Spa Relajante', 'pedicura-spa-relajante', 50, 'Pedicura', 60,
    'Tratamiento completo para pies que incluye exfoliación profunda, masaje de hidratación y esmaltado.', true),
  ('Baño de Acrílico (Kapping)', 'ba-o-de-acr-lico-kapping', 40, 'Acrilico', 80,
    'Capa de acrílico protectora sobre tu uña natural para fortalecerla y evitar rupturas.', true),
  ('Retiro Seguro + Cuidado', 'retiro-seguro-cuidado', 15, 'Manicura', 30,
    'Retiro cuidadoso de sistemas sin dañar tu uña natural, finalizando con aceite nutritivo.', true),
  ('Nail Art Encapsulado 3D', 'nail-art-encapsulado-3d', 55, 'Nail Art', 110,
    'Diseño premium encapsulado con flores secas, glitters o relieve en 3D para una manicura de impacto.', false)
on conflict (name) do nothing;

-- ---------------------------------------------------------------------------
-- Horario: lunes (1) a sábado (6), 09:00–18:00, slots de 30 min
-- ---------------------------------------------------------------------------
insert into public.availability_rules (weekday, "startTime", "endTime", "slotIntervalMin", "isActive")
select w, '09:00', '18:00', 30, true
from (values (1), (2), (3), (4), (5), (6)) as dias(w)
where not exists (
  select 1 from public.availability_rules ar where ar.weekday = dias.w
);
