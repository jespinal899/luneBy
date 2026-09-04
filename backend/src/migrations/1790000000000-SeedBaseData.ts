import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * 02 · Datos base de Luné by Kelin (usuarios, catálogo de servicios y horario).
 *
 * Idempotente:
 *  - usuarios y servicios se insertan con `ON CONFLICT ... DO NOTHING`
 *    (claves únicas: `users.email`, `services.name`);
 *  - las reglas de disponibilidad se insertan solo para los días que aún no
 *    tienen ninguna regla (`WHERE NOT EXISTS`).
 *
 * Corre en cada arranque (`migrationsRun`), así que producción siempre tiene
 * el catálogo y el horario base sin necesidad de `npm run seed`. Las citas
 * reales que cree la gente no se tocan.
 *
 * Contraseña de ambos usuarios de ejemplo: `Abc123` (hash bcrypt vía pgcrypto).
 * Cámbiala en cuanto entres por primera vez.
 */
export class SeedBaseData1790000000000 implements MigrationInterface {
  name = 'SeedBaseData1790000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);

    // --- Usuarios ---
    await queryRunner.query(`
      INSERT INTO "users" ("email", "password", "fullName", "phone", "isActive", "roles")
      VALUES
        ('kelin@luneby.com', crypt('Abc123', gen_salt('bf', 10)), 'Kelin (Admin)', NULL, true, '{admin}'),
        ('cliente@test.com', crypt('Abc123', gen_salt('bf', 10)), 'Clienta de Prueba', '+18090000000', true, '{client}')
      ON CONFLICT ("email") DO NOTHING
    `);

    // --- Catálogo de servicios (slug = slugify(name), igual que la entidad) ---
    await queryRunner.query(`
      INSERT INTO "services"
        ("name", "slug", "price", "category", "durationMin", "description", "isActive")
      VALUES
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
      ON CONFLICT ("name") DO NOTHING
    `);

    // --- Horario de trabajo: lunes(1) a sábado(6), 09:00–18:00, slots de 30 min ---
    await queryRunner.query(`
      INSERT INTO "availability_rules" ("weekday", "startTime", "endTime", "slotIntervalMin", "isActive")
      SELECT w, '09:00', '18:00', 30, true
      FROM (VALUES (1), (2), (3), (4), (5), (6)) AS dias(w)
      WHERE NOT EXISTS (
        SELECT 1 FROM "availability_rules" ar WHERE ar."weekday" = dias.w
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM "availability_rules"
      WHERE "weekday" IN (1, 2, 3, 4, 5, 6)
        AND "startTime" = '09:00' AND "endTime" = '18:00' AND "slotIntervalMin" = 30
    `);
    await queryRunner.query(`
      DELETE FROM "services" WHERE "name" IN (
        'Manicura Rusa Premium', 'Uñas Acrílicas Esculpidas', 'Diseño Nail Art de Autor',
        'Esmaltado Semipermanente', 'Pedicura Spa Relajante', 'Baño de Acrílico (Kapping)',
        'Retiro Seguro + Cuidado', 'Nail Art Encapsulado 3D'
      )
    `);
    await queryRunner.query(
      `DELETE FROM "users" WHERE "email" IN ('kelin@luneby.com', 'cliente@test.com')`,
    );
  }
}
