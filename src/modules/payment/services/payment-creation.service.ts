import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';

import { CreatePaymentDto } from '../dto/create-payment.dto';

import { PaymentMethod } from '../enums/payment-method';

import { PaymentMessages } from 'src/common/enums/messages.enum';

import { PaymentOrderService } from './payment-order.service';
import { PaymentIdempotencyService } from './payment-idempotency.service';

import { WalletPaymentService } from '../methods/wallet-payment.service';
import { GatewayPaymentService } from '../methods/gateway-payment.service';

import { Order } from '../../order/entities/order.entity';

@Injectable()
export class PaymentCreationService {
  constructor(
    private readonly paymentOrderService: PaymentOrderService,

    private readonly paymentIdempotencyService: PaymentIdempotencyService,

    private readonly walletPaymentService: WalletPaymentService,

    private readonly gatewayPaymentService: GatewayPaymentService,
  ) {}

  async create(
    createPaymentDto: CreatePaymentDto,
    userId: string,
    idempotencyKey: string,
  ) {
    this.validateIdempotencyKey(
      idempotencyKey,
    );

    const order =
      await this.paymentOrderService.getOrder(
        createPaymentDto.orderId,
        userId,
      );

    this.paymentOrderService.validateOrder(
      order,
    );

    const existingPayment =
      await this.paymentIdempotencyService.findExistingPayment(
        order.id,
        userId,
        idempotencyKey,
      );

    if (existingPayment) {
      return existingPayment;
    }

    await this.paymentOrderService.handlePendingPayment(
      order.id,
    );

    try {
      return await this.processPayment(
        createPaymentDto.paymentMethod,
        order,
        userId,
        idempotencyKey,
      );
    } catch (error: any) {
      if (
        error?.code === '23505' &&
        error?.constraint ===
          'UQ_743b9fb1d2a059f2f7860418e4e'
      ) {
        throw new BadRequestException(
          PaymentMessages.PAYMENT_EXPIRED,
        );
      }

      throw error;
    }
  }

  private validateIdempotencyKey(
    idempotencyKey: string,
  ) {
    if (!idempotencyKey) {
      throw new BadRequestException(
        PaymentMessages.IDEMPOTENCY_KEY_REQUIRED,
      );
    }
  }

  private processPayment(
    paymentMethod: PaymentMethod,
    order: Order,
    userId: string,
    idempotencyKey: string,
  ) {
    if (
      paymentMethod === PaymentMethod.WALLET
    ) {
      return this.walletPaymentService.pay(
        order,
        userId,
        idempotencyKey,
      );
    }

    return this.gatewayPaymentService.pay(
      order,
      userId,
      idempotencyKey,
    );
  }
}
