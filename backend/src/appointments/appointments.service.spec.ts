import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { Service } from '../services/entities/service.entity';
import { AppointmentsService } from './appointments.service';
import { Appointment, AvailabilityRule, TimeOff } from './entities';

describe('AppointmentsService · getAvailability', () => {
  let service: AppointmentsService;

  const appointmentRepository = { find: jest.fn() };
  const ruleRepository = { find: jest.fn() };
  const timeOffRepository = { find: jest.fn() };
  const serviceRepository = { findOneBy: jest.fn() };

  const activeService = (durationMin = 60) => ({
    id: 's1',
    isActive: true,
    durationMin,
  });
  // Miércoles.
  const WEDNESDAY = '2026-09-09';

  beforeEach(async () => {
    jest.clearAllMocks();
    appointmentRepository.find.mockResolvedValue([]);
    ruleRepository.find.mockResolvedValue([]);
    timeOffRepository.find.mockResolvedValue([]);

    const moduleRef = await Test.createTestingModule({
      providers: [
        AppointmentsService,
        {
          provide: getRepositoryToken(Appointment),
          useValue: appointmentRepository,
        },
        {
          provide: getRepositoryToken(AvailabilityRule),
          useValue: ruleRepository,
        },
        { provide: getRepositoryToken(TimeOff), useValue: timeOffRepository },
        { provide: getRepositoryToken(Service), useValue: serviceRepository },
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

  it('lanza BadRequestException si el servicio está inactivo', async () => {
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
    ruleRepository.find.mockResolvedValue([]);
    expect(await service.getAvailability(WEDNESDAY, 's1')).toEqual([]);
  });

  it('genera slots dentro de la franja respetando la duración', async () => {
    serviceRepository.findOneBy.mockResolvedValue(activeService(60));
    ruleRepository.find.mockResolvedValue([
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
    ruleRepository.find.mockResolvedValue([
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
    ruleRepository.find.mockResolvedValue([
      { startTime: '09:00', endTime: '18:00', slotIntervalMin: 30 },
    ]);
    timeOffRepository.find.mockResolvedValue([
      { startTime: null, endTime: null },
    ]);
    expect(await service.getAvailability(WEDNESDAY, 's1')).toEqual([]);
  });
});
