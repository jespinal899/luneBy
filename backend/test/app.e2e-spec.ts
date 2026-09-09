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

  it('GET /api/services devuelve el catálogo de servicios base', async () => {
    const res = await request(server)
      .get('/api/services?kind=base&limit=50')
      .expect(200);

    expect(Array.isArray(res.body.products)).toBe(true);
    expect(res.body.products.length).toBeGreaterThan(0);
    expect(res.body.products.every((s: { kind: string }) => s.kind === 'base'))
      .toBe(true);
  });

  it('GET /api/services?kind=estilo devuelve los estilos', async () => {
    const res = await request(server)
      .get('/api/services?kind=estilo&limit=50')
      .expect(200);

    expect(res.body.products.length).toBeGreaterThan(0);
    expect(
      res.body.products.every((s: { kind: string }) => s.kind === 'estilo'),
    ).toBe(true);
  });

  it('flujo completo: registro → disponibilidad → agendar con estilos', async () => {
    // 1. Registro de una clienta nueva.
    const email = `e2e_${Date.now()}@test.com`;
    const register = await request(server)
      .post('/api/auth/register')
      .send({ email, password: 'Abc123', fullName: 'Clienta E2E' })
      .expect(201);

    const token: string = register.body.token;
    expect(token).toBeTruthy();

    // 2. Servicio base + un estilo.
    const bases = (
      await request(server).get('/api/services?kind=base&limit=50').expect(200)
    ).body.products;
    const styles = (
      await request(server)
        .get('/api/services?kind=estilo&limit=50')
        .expect(200)
    ).body.products;

    const base = bases[0];
    const style = styles[0];

    // 3. Disponibilidad para una fecha futura.
    const date = iso(new Date(Date.now() + 10 * 24 * 60 * 60 * 1000));
    const extraMinutes = style.durationMin * 2;
    const slotsRes = await request(server)
      .get(
        `/api/appointments/availability?date=${date}` +
          `&serviceId=${base.id}&extraMinutes=${extraMinutes}`,
      )
      .expect(200);

    expect(Array.isArray(slotsRes.body)).toBe(true);
    expect(slotsRes.body.length).toBeGreaterThan(0);
    const startTime: string = slotsRes.body[0];

    // 4. Agendar con el estilo repetido x2.
    const created = await request(server)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${token}`)
      .send({
        serviceId: base.id,
        date,
        startTime,
        items: [{ serviceId: style.id, quantity: 2 }],
      })
      .expect(201);

    expect(created.body.priceAtBooking).toBe(base.price + style.price * 2);
    expect(created.body.durationMin).toBe(base.durationMin + style.durationMin * 2);
    expect(created.body.items).toHaveLength(2); // base + estilo

    // 5. La cita aparece en "mis citas".
    const mine = await request(server)
      .get('/api/appointments/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(mine.body.some((a: { id: string }) => a.id === created.body.id)).toBe(
      true,
    );
  });
});
