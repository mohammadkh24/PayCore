import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiHeader,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import type { Response } from 'express';
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
      'Creates a payment for an order using wallet or payment gateway.',
  })
  @ApiConsumes(
    'application/x-www-form-urlencoded',
  )
  @ApiHeader({
    name: 'Idempotency-Key',
    description:
      'Unique key for preventing duplicate payment requests.',
    required: true,
    example: 'payment-123456',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        orderId: {
          type: 'string',
          format: 'uuid',
          example:
            '550e8400-e29b-41d4-a716-446655440000',
          description: 'Order UUID',
        },
        paymentMethod: {
          type: 'string',
          enum: ['WALLET', 'GATEWAY'],
          example: 'WALLET',
          description: 'Payment method',
        },
      },
      required: [
        'orderId',
        'paymentMethod',
      ],
    },
  })
  @ApiResponse({
    status: 201,
    description:
      'Payment created successfully.',
  })
  @ApiResponse({
    status: 400,
    description:
      'Invalid payment data, insufficient wallet balance, or duplicate payment.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized.',
  })
  @ApiResponse({
    status: 404,
    description: 'Order not found.',
  })
  create(
    @Body()
    createPaymentDto: CreatePaymentDto,

    @Req()
    req: AuthenticatedRequest,

    @Headers('Idempotency-Key')
    idempotencyKey: string,
  ) {
    return this.paymentService.createPayment(
      createPaymentDto,
      req.user.sub,
      idempotencyKey,
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
    description: 'Unauthorized.',
  })
  findAll(
    @Req()
    req: AuthenticatedRequest,
  ) {
    return this.paymentService.findAll(
      req.user.sub,
    );
  }

  @Get('callback')
  async callback(
    @Query('Authority')
    authority: string,

    @Query('Status')
    status: string,

    @Res()
    res: Response,
  ) {
    try {
      const result =
        await this.paymentService.handleCallback(
          authority,
          status,
        );

      const params =
        new URLSearchParams({
          success: String(
            result.success,
          ),

          message:
            result.message ?? '',

          paymentId:
            result.paymentId ?? '',

          referenceId:
            result.referenceId ?? '',
        });

      return res.redirect(
        `http://localhost:5500/wallet-result.html?${params.toString()}}`,
      );
    } catch (error: any) {
      const params =
        new URLSearchParams({
          success: 'false',

          message:
            error?.message ||
            'پرداخت ناموفق بود',
        });

      return res.redirect(
        `http://localhost:5500/wallet-result.html?${params.toString()}`,
      );
    }
  }
}
