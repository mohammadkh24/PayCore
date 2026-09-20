import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsPositive,
} from 'class-validator';

export class DepositWalletDto {
  @ApiProperty({
    example: 200000,
    description: 'Deposit amount in toman',
  })
  @IsInt()
  @IsPositive()
  amount: number;
}
