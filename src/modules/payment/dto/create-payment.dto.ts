import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsPositive, IsString } from 'class-validator';

export class CreatePaymentDto {
  @ApiProperty({
    example: 100000,
    description: 'Payment amount in toman',
  })
  @IsInt()
  @IsPositive()
  amount: number;

  @ApiProperty({
    example: 'Test payment',
    description: 'Payment description',
  })
  @IsString()
  @IsNotEmpty()
  description: string;
}
