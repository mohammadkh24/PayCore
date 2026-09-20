import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { Payment } from '../entities/payment.entity';
import { Order } from '../../order/entities/order.entity';
import { ZarinPalService } from '../providers/zarinpal/zarinpal.service';
import { PaymentStatus } from '../enums/payment-status.enum';
import { PaymentType } from '../enums/payment-type.enum';
import { PaymentMethod } from '../enums/payment-method';

@Injectable()
export class GatewayPaymentService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,

    private readonly zarinPalService: ZarinPalService,
  ) {}

  async pay(
    order: Order,
    userId: string,
    idempotencyKey: string,
  ) {
    const payment = this.paymentRepository.create({
      amount: order.amount,
      description: `Payment for order ${order.id}`,
      status: PaymentStatus.PENDING,
      type: PaymentType.ORDER,
      idempotencyKey,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      user: {
        id: userId,
      },
      order,
    });

    

    const savedPayment =
      await this.paymentRepository.save(payment);

    const paymentResult =
      await this.zarinPalService.requestPayment(
        savedPayment.amount,
        savedPayment.description,
        'http://localhost:3000/payments/callback',
      );

    savedPayment.authority =
      paymentResult.authority;

    await this.paymentRepository.save(
      savedPayment,
    );

    return {
      paymentId: savedPayment.id,
      orderId: order.id,
      amount: savedPayment.amount,
      status: savedPayment.status,
      paymentMethod: PaymentMethod.GATEWAY,
      authority: paymentResult.authority,
      paymentUrl: paymentResult.paymentUrl,
    };
  }
}