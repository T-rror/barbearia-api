import {
  IsEnum,
  IsNumber,
  IsUUID,
  IsOptional,
  IsString,
  IsPositive,
  MaxLength,
} from 'class-validator';
import { PaymentMethod } from '@prisma/client';

export class CreatePaymentDto {
  @IsUUID()
  appointmentId: string;

  @IsEnum(PaymentMethod)
  method: PaymentMethod;

  // Accepted for compatibility with older clients; the API ignores it.
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  amount?: number;

  // usado apenas no Web3
  @IsOptional()
  @IsString()
  @MaxLength(300)
  txHash?: string;
}
