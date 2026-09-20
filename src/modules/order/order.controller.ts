import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import type { Request } from 'express';

import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';

import { AuthGuard } from 'src/common/guards/auth.guard';

interface AuthenticatedRequest
  extends Request {
  user: {
    sub: string;
    email: string;
  };
}

@ApiTags('Orders')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('orders')
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Create an order',
    description:
      'Creates an order for the authenticated user using the current product price.',
  })
  @ApiResponse({
    status: 201,
    description:
      'Order created successfully.',
  })
  @ApiResponse({
    status: 400,
    description:
      'Product is not active or request data is invalid.',
  })
  @ApiResponse({
    status: 401,
    description:
      'Unauthorized.',
  })
  @ApiResponse({
    status: 404,
    description:
      'Product not found.',
  })
  create(
    @Body()
    createOrderDto: CreateOrderDto,

    @Req()
    req: AuthenticatedRequest,
  ) {
    return this.orderService.create(
      createOrderDto,
      req.user.sub,
    );
  }

  @Get()
  @ApiOperation({
    summary: 'Get user orders',
  })
  @ApiResponse({
    status: 200,
    description:
      'Orders retrieved successfully.',
  })
  findAll(
    @Req()
    req: AuthenticatedRequest,
  ) {
    return this.orderService.findAll(
      req.user.sub,
    );
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get an order by ID',
  })
  @ApiParam({
    name: 'id',
    example:
      '550e8400-e29b-41d4-a716-446655440000',
    description: 'Order UUID',
  })
  @ApiResponse({
    status: 200,
    description:
      'Order retrieved successfully.',
  })
  @ApiResponse({
    status: 401,
    description:
      'Unauthorized.',
  })
  @ApiResponse({
    status: 404,
    description:
      'Order not found.',
  })
  findOne(
    @Param(
      'id',
      new ParseUUIDPipe(),
    )
    id: string,

    @Req()
    req: AuthenticatedRequest,
  ) {
    return this.orderService.findOne(
      id,
      req.user.sub,
    );
  }
}