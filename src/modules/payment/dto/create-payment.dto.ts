import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsUUID,
} from 'class-validator';

import { PaymentMethod } from '../enums/payment-method';

export class CreatePaymentDto {
  @ApiProperty({
    example:
      '550e8400-e29b-41d4-a716-446655440000',
    description: 'Order UUID',
  })
  @IsUUID()
  orderId: string;

  @ApiProperty({
    enum: PaymentMethod,
    enumName: 'PaymentMethod',
    example: PaymentMethod.WALLET,
    description: 'Payment method',
  })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;
}
