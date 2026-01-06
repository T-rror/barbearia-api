import { IsEnum, IsNumber, IsUUID, IsOptional, IsString } from 'class-validator';
import { PaymentMethod } from '@prisma/client';

export class CreatePaymentDto {
  @IsUUID()
  appointmentId: string;

  @IsEnum(PaymentMethod)
  method: PaymentMethod;

  @IsNumber()
  amount: number;

  // usado apenas no Web3
  @IsOptional()
  @IsString()
  txHash?: string;
}
