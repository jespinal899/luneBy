import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsInt,
  Matches,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/;

export class ScheduleDayDto {
  /** 0 = domingo ... 6 = sábado. */
  @IsInt()
  @Min(0)
  @Max(6)
  weekday: number;

  @Matches(HHMM, { message: 'La hora de apertura debe tener el formato HH:mm' })
  startTime: string;

  @Matches(HHMM, { message: 'La hora de cierre debe tener el formato HH:mm' })
  endTime: string;

  @IsBoolean()
  isActive: boolean;
}

export class UpdateScheduleDto {
  @IsArray()
  @ArrayMinSize(7)
  @ArrayMaxSize(7)
  @ValidateNested({ each: true })
  @Type(() => ScheduleDayDto)
  days: ScheduleDayDto[];
}
