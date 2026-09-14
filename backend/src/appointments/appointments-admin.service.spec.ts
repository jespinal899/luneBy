import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { AppointmentsAdminService } from './appointments-admin.service';
import { Appointment, AppointmentStatus } from './entities';

describe('AppointmentsAdminService', () => {
  let service: AppointmentsAdminService;

  const appointmentRepository = {
    find: jest.fn(),
    findOneBy: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        AppointmentsAdminService,
        {
          provide: getRepositoryToken(Appointment),
          useValue: appointmentRepository,
        },
      ],
    }).compile();
    service = moduleRef.get(AppointmentsAdminService);
  });

  describe('findAll', () => {
    it('sin filtros pide toda la agenda, de la más próxima a la más lejana', async () => {
      appointmentRepository.find.mockResolvedValue([]);

      await service.findAll({});

      expect(appointmentRepository.find).toHaveBeenCalledWith({
        where: { date: undefined, status: undefined },
        order: { date: 'ASC', startTime: 'ASC' },
      });
    });

    it('pasa los filtros de fecha y estado', async () => {
      appointmentRepository.find.mockResolvedValue([]);

      await service.findAll({
        date: '2026-09-20',
        status: AppointmentStatus.pending,
      });

      expect(appointmentRepository.find.mock.calls[0][0].where).toEqual({
        date: '2026-09-20',
        status: AppointmentStatus.pending,
      });
    });
  });

  describe('updateStatus', () => {
    it('cambia el estado y guarda', async () => {
      const appointment = { id: '1', status: AppointmentStatus.pending };
      appointmentRepository.findOneBy.mockResolvedValue(appointment);
      appointmentRepository.save.mockImplementation((a: unknown) => a);

      const result = await service.updateStatus(
        '1',
        AppointmentStatus.confirmed,
      );

      expect(result).toMatchObject({ status: AppointmentStatus.confirmed });
      expect(appointmentRepository.save).toHaveBeenCalledWith(appointment);
    });

    it('lanza NotFoundException si la cita no existe', async () => {
      appointmentRepository.findOneBy.mockResolvedValue(null);

      await expect(
        service.updateStatus('x', AppointmentStatus.confirmed),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(appointmentRepository.save).not.toHaveBeenCalled();
    });

    it('a diferencia de la clienta, puede llevar una cita a cualquier estado', async () => {
      appointmentRepository.findOneBy.mockResolvedValue({ id: '1' });
      appointmentRepository.save.mockImplementation((a: unknown) => a);

      for (const status of [
        AppointmentStatus.confirmed,
        AppointmentStatus.cancelled,
        AppointmentStatus.done,
      ]) {
        const result = await service.updateStatus('1', status);
        expect(result).toMatchObject({ status });
      }
    });
  });
});
