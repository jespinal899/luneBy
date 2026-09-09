import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';

import { AppModule } from '../src/app.module';

/**
 * Tests de integración: la app real contra una base de datos Postgres real
 * con las migraciones de `supabase/migrations` aplicadas.
 *
 * Verifican que las entidades de TypeORM coinciden con el esquema SQL y que
 * el flujo crítico (registro → disponibilidad → agendar) funciona de punta
 * a punta.
 *
 * Requiere las variables DB_* (o DATABASE_URL) apuntando a esa base.
 */
describe('App (e2e)', () => {
  let app: INestApplication;
  let server: ReturnType<INestApplication['getHttpServer']>;

  const iso = (d: Date) => d.toISOString().slice(0, 10);

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
    server = app.getHttpServer();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/health responde ok sin tocar la base', async () => {
    const res = await request(server).get('/api/health').expect(200);
    expect(res.body.status).toBe('ok');
  });

  it('GET /api/services devuelve el catálogo', async () => {
    const res = await request(server).get('/api/services?limit=50').expect(200);

    expect(Array.isArray(res.body.products)).toBe(true);
    expect(
      res.body.products.some((s: { isActive: boolean }) => s.isActive),
    ).toBe(true);
  });

  it('flujo completo: registro → disponibilidad → agendar varios servicios', async () => {
    // 1. Registro de una clienta nueva.
    const email = `e2e_${Date.now()}@test.com`;
    const register = await request(server)
      .post('/api/auth/register')
      .send({ email, password: 'Abc123', fullName: 'Clienta E2E' })
      .expect(201);

    const token: string = register.body.token;
    expect(token).toBeTruthy();

    // 2. Dos servicios activos del catálogo.
    const services = (
      await request(server).get('/api/services?limit=50').expect(200)
    ).body.products.filter((s: { isActive: boolean }) => s.isActive);
    const [a, b] = services;

    // 3. Disponibilidad para una fecha futura (duración = a + b).
    //    Lejos en el tiempo para no chocar con otras citas de la BD.
    const date = iso(new Date(Date.now() + 45 * 24 * 60 * 60 * 1000));
    const slotsRes = await request(server)
      .get(
        `/api/appointments/availability?date=${date}` +
          `&serviceId=${a.id}&extraMinutes=${b.durationMin}`,
      )
      .expect(200);

    expect(Array.isArray(slotsRes.body)).toBe(true);
    expect(slotsRes.body.length).toBeGreaterThan(0);
    const startTime: string = slotsRes.body[0];

    // 4. Agendar con los dos servicios.
    const created = await request(server)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${token}`)
      .send({ serviceIds: [a.id, b.id], date, startTime })
      .expect(201);

    expect(created.body.priceAtBooking).toBe(a.price + b.price);
    expect(created.body.durationMin).toBe(a.durationMin + b.durationMin);
    expect(created.body.items).toHaveLength(2);

    // 5. La cita aparece en "mis citas".
    const mine = await request(server)
      .get('/api/appointments/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(
      mine.body.some((appt: { id: string }) => appt.id === created.body.id),
    ).toBe(true);
  });
});
