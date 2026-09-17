import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsPositive,
  IsString,
  IsOptional,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty({
    example: 'Premium Subscription',
    description: 'Product name',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'One month premium subscription',
    description: 'Product description',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: 100000,
    description: 'Product price in toman',
  })
  @IsInt()
  @IsPositive()
  price: number;
}