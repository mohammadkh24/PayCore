import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import type { Request } from 'express';

import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

import { AuthGuard } from 'src/common/guards/auth.guard';

interface AuthenticatedRequest extends Request {
  user: {
    sub: string;
    email: string;
  };
}

@ApiTags('Payments')
@Controller('payments')
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
  ) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Create a payment',
    description:
      'Creates a new payment and requests a payment authority from ZarinPal.',
  })
  @ApiResponse({
    status: 201,
    description:
      'Payment created successfully.',
  })
  @ApiResponse({
    status: 400,
    description:
      'Invalid payment data.',
  })
  @ApiResponse({
    status: 401,
    description:
      'Unauthorized.',
  })
  create(
    @Body() createPaymentDto: CreatePaymentDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.paymentService.createPayment(
      createPaymentDto,
      req.user.sub,
    );
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Get user payments',
    description:
      'Returns all payments belonging to the authenticated user.',
  })
  @ApiResponse({
    status: 200,
    description:
      'User payments retrieved successfully.',
  })
  @ApiResponse({
    status: 401,
    description:
      'Unauthorized.',
  })
  findAll(
    @Req() req: AuthenticatedRequest,
  ) {
    return this.paymentService.findAll(
      req.user.sub,
    );
  }

  @Get('callback')
  @ApiOperation({
    summary: 'Handle payment callback',
    description:
      'Handles the callback sent by ZarinPal after payment.',
  })
  @ApiResponse({
    status: 200,
    description:
      'Payment callback handled successfully.',
  })
  @ApiResponse({
    status: 404,
    description:
      'Payment not found.',
  })
  callback(
    @Query('Authority') authority: string,
    @Query('Status') status: string,
  ) {
    return this.paymentService.handleCallback(
      authority,
      status,
    );
  }
}
