-- 0008 · Catálogo único de servicios
--
-- Se elimina la distinción base/estilo: ahora hay una sola lista de servicios
-- y la cita se arma sumando los que la clienta elija. Cada servicio lleva un
-- precio de referencia que el administrador ajusta desde /admin/products.

-- ── Quitar el modelo base/estilo ────────────────────────────────────
alter table public.services drop column if exists kind;
alter table public.appointment_items drop column if exists kind;
alter table public.appointment_items drop column if exists quantity;

-- ── Ocultar el catálogo demo anterior ──────────────────────────────
-- No se borra: hay citas antiguas que lo referencian. Solo deja de verse.
update public.services set "isActive" = false;

-- ── Catálogo real ──────────────────────────────────────────────────
-- Precios y duraciones de referencia; el admin los edita en /admin/products.
insert into public.services
  (name, slug, price, category, "durationMin", description, "isActive")
values
  ('Manicura rusa',        'manicura-rusa',        450, 'Manicura',       75, 'Limpieza profunda de cutícula con técnica rusa y esmaltado al ras.', true),
  ('Rubber Base',          'rubber-base',          300, 'Manicura',       60, 'Base niveladora de alta resistencia sobre la uña natural.', true),
  ('French rosa pálido',   'french-rosa-palido',   350, 'Diseño',         50, 'French clásico en tono rosa pálido.', true),
  ('Esmaltado',            'esmaltado',            250, 'Semipermanente', 45, 'Esmaltado semipermanente en color liso.', true),
  ('Diseño',               'diseno',               150, 'Nail Art',       30, 'Diseño a elección en las uñas indicadas.', true),
  ('Soft gel',             'soft-gel',             550, 'Extensiones',    90, 'Extensión con tips de soft gel y acabado natural.', true),
  ('Nail Art',             'nail-art',             200, 'Nail Art',       40, 'Arte a mano alzada, pedrería o efectos especiales.', true),
  ('Soft Glam + Pedrería', 'soft-glam-pedreria',   850, 'Extensiones',   120, 'Incluye extensiones en soft gel, glam y pedrería.', true),
  ('Esmaltado Cat eye',    'esmaltado-cat-eye',    320, 'Semipermanente', 50, 'Esmaltado con efecto magnético ojo de gato.', true),
  ('Efecto Chrome',        'efecto-chrome',        380, 'Diseño',         45, 'Acabado espejo cromado.', true),
  ('Diseños Cardone',      'disenos-cardone',      500, 'Nail Art',       70, 'Chrome combinado con relieves.', true)
on conflict (slug) do update set
  price          = excluded.price,
  category       = excluded.category,
  "durationMin"  = excluded."durationMin",
  description    = excluded.description,
  "isActive"     = true;
