import { BadRequestException, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { User } from '../auth/entities/user.entity';
import { CatalogItem } from '../catalog/entities/catalog-item.entity';
import { Service } from '../services/entities/service.entity';
import { AppointmentsService } from './appointments.service';
import { Appointment, AppointmentItem, AppointmentStatus } from './entities';
import { ScheduleService } from './schedule.service';
import { TimeOffService } from './time-off.service';

describe('AppointmentsService · cancelOwn', () => {
  let service: AppointmentsService;

  const appointmentRepository = {
    find: jest.fn(),
    findOneBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn((a) => a),
  };

  const clienta = { id: 'u1' } as User;
  const otra = { id: 'u2' } as User;

  const citaDe = (dueño: string) => ({
    id: 'a1',
    status: AppointmentStatus.confirmed,
    cancellationReason: null,
    user: { id: dueño },
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    appointmentRepository.save.mockImplementation((a) => a);

    const moduleRef = await Test.createTestingModule({
      providers: [
        AppointmentsService,
        {
          provide: getRepositoryToken(Appointment),
          useValue: appointmentRepository,
        },
        {
          provide: getRepositoryToken(Service),
          useValue: { findOneBy: jest.fn(), findBy: jest.fn() },
        },
        {
          provide: getRepositoryToken(AppointmentItem),
          useValue: { create: jest.fn() },
        },
        {
          provide: getRepositoryToken(CatalogItem),
          useValue: { findBy: jest.fn() },
        },
        {
          provide: ScheduleService,
          useValue: { getActiveRulesForWeekday: jest.fn() },
        },
        {
          provide: TimeOffService,
          useValue: { getTimeOffForDate: jest.fn() },
        },
        { provide: EventEmitter2, useValue: { emit: jest.fn() } },
      ],
    }).compile();

    service = moduleRef.get(AppointmentsService);
  });

  it('cancela y guarda el motivo que dio la clienta', async () => {
    appointmentRepository.findOneBy.mockResolvedValue(citaDe('u1'));

    const saved = await service.cancelOwn('a1', clienta, 'Me enfermé');

    expect(saved.status).toBe(AppointmentStatus.cancelled);
    expect(saved.cancellationReason).toBe('Me enfermé');
  });

  it('sin motivo la cancela igual, dejándolo en null', async () => {
    appointmentRepository.findOneBy.mockResolvedValue(citaDe('u1'));

    const saved = await service.cancelOwn('a1', clienta);

    expect(saved.status).toBe(AppointmentStatus.cancelled);
    expect(saved.cancellationReason).toBeNull();
  });

  // "No dijo nada" debe ser un solo valor en la base: una cadena vacía o de
  // espacios significaría lo mismo y obligaría a comprobar dos cosas al
  // mostrarlo.
  it.each([
    ['', 'vacío'],
    ['   ', 'solo espacios'],
  ])('un motivo %s (%s) se guarda como null', async (reason) => {
    appointmentRepository.findOneBy.mockResolvedValue(citaDe('u1'));

    const saved = await service.cancelOwn('a1', clienta, reason);

    expect(saved.cancellationReason).toBeNull();
  });

  it('recorta los espacios de alrededor del motivo', async () => {
    appointmentRepository.findOneBy.mockResolvedValue(citaDe('u1'));

    const saved = await service.cancelOwn('a1', clienta, '  Se me cruzó  ');

    expect(saved.cancellationReason).toBe('Se me cruzó');
  });

  it('no deja cancelar la cita de otra persona', async () => {
    appointmentRepository.findOneBy.mockResolvedValue(citaDe('u1'));

    await expect(
      service.cancelOwn('a1', otra, 'porque sí'),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(appointmentRepository.save).not.toHaveBeenCalled();
  });

  it('una cita que no existe da 404', async () => {
    appointmentRepository.findOneBy.mockResolvedValue(null);

    await expect(service.cancelOwn('nope', clienta)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
