import { BadRequestException, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { CatalogItem } from '../catalog/entities/catalog-item.entity';
import { Service } from '../services/entities/service.entity';
import { AppointmentsService } from './appointments.service';
import { Appointment, AppointmentItem } from './entities';
import { ScheduleService } from './schedule.service';
import { TimeOffService } from './time-off.service';

describe('AppointmentsService · getAvailability', () => {
  let service: AppointmentsService;

  const appointmentRepository = {
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };
  const serviceRepository = { findOneBy: jest.fn(), findBy: jest.fn() };
  const itemRepository = { create: jest.fn((x) => x) };
  const catalogRepository = { findBy: jest.fn() };
  const scheduleService = { getActiveRulesForWeekday: jest.fn() };
  const timeOffService = { getTimeOffForDate: jest.fn() };
  const eventEmitter = { emit: jest.fn() };

  const activeService = (durationMin = 60) => ({
    id: 's1',
    isActive: true,
    durationMin,
  });
  // Miércoles. Congelamos "hoy" al día anterior para que el filtro de horas
  // pasadas no dependa de la fecha real en la que corran los tests.
  const WEDNESDAY = '2026-09-09';

  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-09-08T08:00:00Z'));
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    appointmentRepository.find.mockResolvedValue([]);
    scheduleService.getActiveRulesForWeekday.mockResolvedValue([]);
    timeOffService.getTimeOffForDate.mockResolvedValue([]);
    catalogRepository.findBy.mockResolvedValue([]);

    const moduleRef = await Test.createTestingModule({
      providers: [
        AppointmentsService,
        {
          provide: getRepositoryToken(Appointment),
          useValue: appointmentRepository,
        },
        { provide: getRepositoryToken(Service), useValue: serviceRepository },
        {
          provide: getRepositoryToken(AppointmentItem),
          useValue: itemRepository,
        },
        {
          provide: getRepositoryToken(CatalogItem),
          useValue: catalogRepository,
        },
        { provide: ScheduleService, useValue: scheduleService },
        { provide: TimeOffService, useValue: timeOffService },
        { provide: EventEmitter2, useValue: eventEmitter },
      ],
    }).compile();

    service = moduleRef.get(AppointmentsService);
  });

  it('lanza NotFoundException si el servicio no existe', async () => {
    serviceRepository.findOneBy.mockResolvedValue(null);
    await expect(
      service.getAvailability(WEDNESDAY, 'x'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('lanza BadRequestException si el servicio no está disponible para agendar', async () => {
    serviceRepository.findOneBy.mockResolvedValue({
      id: 's1',
      isActive: false,
    });
    await expect(
      service.getAvailability(WEDNESDAY, 's1'),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('devuelve [] si no hay regla de disponibilidad para ese día', async () => {
    serviceRepository.findOneBy.mockResolvedValue(activeService());
    scheduleService.getActiveRulesForWeekday.mockResolvedValue([]);
    expect(await service.getAvailability(WEDNESDAY, 's1')).toEqual([]);
  });

  it('genera slots dentro de la franja respetando la duración', async () => {
    serviceRepository.findOneBy.mockResolvedValue(activeService(60));
    scheduleService.getActiveRulesForWeekday.mockResolvedValue([
      { startTime: '09:00', endTime: '12:00', slotIntervalMin: 30 },
    ]);
    // 09:00..12:00, duración 60, cada 30 => 09:00, 09:30, 10:00, 10:30, 11:00
    expect(await service.getAvailability(WEDNESDAY, 's1')).toEqual([
      '09:00',
      '09:30',
      '10:00',
      '10:30',
      '11:00',
    ]);
  });

  it('descarta los slots que se solapan con una cita existente', async () => {
    serviceRepository.findOneBy.mockResolvedValue(activeService(60));
    scheduleService.getActiveRulesForWeekday.mockResolvedValue([
      { startTime: '09:00', endTime: '12:00', slotIntervalMin: 30 },
    ]);
    appointmentRepository.find.mockResolvedValue([
      { startTime: '10:00', endTime: '11:00' },
    ]);
    // Se caen 09:30, 10:00, 10:30 (solapan con 10:00-11:00 + duración 60)
    expect(await service.getAvailability(WEDNESDAY, 's1')).toEqual([
      '09:00',
      '11:00',
    ]);
  });

  it('devuelve [] si hay un bloqueo de día completo', async () => {
    serviceRepository.findOneBy.mockResolvedValue(activeService(60));
    scheduleService.getActiveRulesForWeekday.mockResolvedValue([
      { startTime: '09:00', endTime: '18:00', slotIntervalMin: 30 },
    ]);
    timeOffService.getTimeOffForDate.mockResolvedValue([
      { startTime: null, endTime: null },
    ]);
    expect(await service.getAvailability(WEDNESDAY, 's1')).toEqual([]);
  });

  describe('create · el diseño elegido manda sobre el servicio', () => {
    const esmaltado = {
      id: 's1',
      name: 'Esmaltado',
      price: 350,
      durationMin: 45,
      isActive: true,
    };
    const softGlam = {
      id: 'd1',
      name: 'Soft Glam',
      price: 450,
      service: esmaltado,
    };

    const agendable = () => {
      serviceRepository.findBy.mockResolvedValue([esmaltado]);
      scheduleService.getActiveRulesForWeekday.mockResolvedValue([
        { startTime: '09:00', endTime: '17:00', slotIntervalMin: 45 },
      ]);
      appointmentRepository.create.mockImplementation((x: unknown) => x);
      appointmentRepository.save.mockResolvedValue(undefined);
    };

    const reservar = (catalogItemIds?: string[]) =>
      service.create(
        {
          serviceIds: ['s1'],
          catalogItemIds,
          date: WEDNESDAY,
          startTime: '09:00',
        } as never,
        { id: 'u1' } as never,
      );

    it('el diseño se suma al servicio, no lo reemplaza', async () => {
      agendable();
      catalogRepository.findBy.mockResolvedValue([softGlam]);

      const cita = await reservar(['d1']);

      // 350 del esmaltado + 450 del diseño: hacer un Soft Glam es hacer el
      // esmaltado y además el diseño.
      expect(cita.items[0]).toMatchObject({
        nameAtBooking: 'Esmaltado · Soft Glam',
        priceAtBooking: 800,
      });
      // Y queda registrado qué diseño fue, no solo su nombre.
      expect(cita.items[0].catalogItem).toBe(softGlam);
      expect(cita.priceAtBooking).toBe(800);
    });

    it('un diseño sin adicional deja el precio del servicio', async () => {
      agendable();
      catalogRepository.findBy.mockResolvedValue([{ ...softGlam, price: 0 }]);

      const cita = await reservar(['d1']);

      expect(cita.priceAtBooking).toBe(350);
    });

    it('sin diseño elegido sigue congelando los del servicio', async () => {
      agendable();

      const cita = await reservar();

      expect(cita.items[0]).toMatchObject({
        nameAtBooking: 'Esmaltado',
        priceAtBooking: 350,
        catalogItem: null,
      });
      expect(cita.priceAtBooking).toBe(350);
    });

    it('la duración sale siempre del servicio, no del diseño', async () => {
      agendable();
      catalogRepository.findBy.mockResolvedValue([softGlam]);

      const cita = await reservar(['d1']);

      // 45 min del servicio: el diseño no altera el cálculo de horarios.
      expect(cita.durationMin).toBe(45);
      expect(cita.endTime).toBe('09:45');
    });

    it('rechaza un diseño que no pertenece a los servicios elegidos', async () => {
      agendable();
      catalogRepository.findBy.mockResolvedValue([
        { id: 'd9', name: 'Baby Boomer', price: 700, service: { id: 'otro' } },
      ]);

      await expect(reservar(['d9'])).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });

    it('rechaza un diseño inexistente', async () => {
      agendable();
      catalogRepository.findBy.mockResolvedValue([]);

      await expect(reservar(['no-existe'])).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });
});
