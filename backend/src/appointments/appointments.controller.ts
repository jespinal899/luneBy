import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { Auth, GetUser } from '../auth/decorators';
import { User } from '../auth/entities/user.entity';
import { ValidRoles } from '../auth/interfaces';
import { AppointmentsService } from './appointments.service';
import {
  AvailabilityQueryDto,
  CreateAppointmentDto,
  CreateTimeOffDto,
  UpdateAppointmentStatusDto,
  UpdateScheduleDto,
} from './dto';
import { AppointmentStatus } from './entities';

@ApiTags('Appointments')
@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  /** Horas libres para una fecha y un servicio. */
  @Get('availability')
  // Cambia con cada reserva: caché muy corta.
  @Header('Cache-Control', 'public, max-age=15')
  getAvailability(@Query() query: AvailabilityQueryDto) {
    return this.appointmentsService.getAvailability(
      query.date,
      query.serviceId,
    );
  }

  /** Agenda una cita. */
  @Post()
  @Auth()
  @ApiBearerAuth()
  create(@Body() dto: CreateAppointmentDto, @GetUser() user: User) {
    return this.appointmentsService.create(dto, user);
  }

  /** Citas del usuario autenticado. */
  @Get('me')
  @Auth()
  @ApiBearerAuth()
  @Header('Cache-Control', 'private, no-cache')
  findMine(@GetUser() user: User) {
    return this.appointmentsService.findMine(user);
  }

  /** Cancela una cita propia. */
  @Patch(':id/cancel')
  @Auth()
  @ApiBearerAuth()
  cancelOwn(@Param('id', ParseUUIDPipe) id: string, @GetUser() user: User) {
    return this.appointmentsService.cancelOwn(id, user);
  }

  // ---- Administración: horario de trabajo ----

  /** Horario semanal (7 días). */
  @Get('schedule')
  @Auth(ValidRoles.admin)
  @ApiBearerAuth()
  @Header('Cache-Control', 'private, no-cache')
  getSchedule() {
    return this.appointmentsService.getSchedule();
  }

  /** Reemplaza el horario semanal completo. */
  @Put('schedule')
  @Auth(ValidRoles.admin)
  @ApiBearerAuth()
  replaceSchedule(@Body() dto: UpdateScheduleDto) {
    return this.appointmentsService.replaceSchedule(dto.days);
  }

  /** Días cerrados (desde hoy, o entre ?from= y ?to=). */
  @Get('time-off')
  @Auth(ValidRoles.admin)
  @ApiBearerAuth()
  @Header('Cache-Control', 'private, no-cache')
  listTimeOff(@Query('from') from?: string, @Query('to') to?: string) {
    return this.appointmentsService.listTimeOff(from, to);
  }

  /** Cierra un día completo. */
  @Post('time-off')
  @Auth(ValidRoles.admin)
  @ApiBearerAuth()
  addTimeOff(@Body() dto: CreateTimeOffDto) {
    return this.appointmentsService.addTimeOff(dto);
  }

  /** Reabre un día cerrado. */
  @Delete('time-off/:id')
  @Auth(ValidRoles.admin)
  @ApiBearerAuth()
  removeTimeOff(@Param('id', ParseUUIDPipe) id: string) {
    return this.appointmentsService.removeTimeOff(id);
  }

  // ---- Administración: citas ----

  /** Agenda completa (filtros opcionales ?date= y ?status=). */
  @Get()
  @Auth(ValidRoles.admin)
  @ApiBearerAuth()
  @Header('Cache-Control', 'private, no-cache')
  findAll(
    @Query('date') date?: string,
    @Query('status') status?: AppointmentStatus,
  ) {
    return this.appointmentsService.findAll({ date, status });
  }

  /** Confirma, completa o cancela una cita. */
  @Patch(':id/status')
  @Auth(ValidRoles.admin)
  @ApiBearerAuth()
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAppointmentStatusDto,
  ) {
    return this.appointmentsService.updateStatus(id, dto.status);
  }
}
