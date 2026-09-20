import { Injectable } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Payment } from '../entities/payment.entity';

import { PaymentStatus } from '../enums/payment-status.enum';
import { PaymentMethod } from '../enums/payment-method';

import { PaymentMessages } from 'src/common/enums/messages.enum';

import { ZarinPalService } from '../providers/zarinpal/zarinpal.service';

@Injectable()
export class PaymentIdempotencyService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,

    private readonly zarinPalService: ZarinPalService,
  ) {}

  async findExistingPayment(
    orderId: string,
    userId: string,
    idempotencyKey: string,
  ) {
    const payment =
      await this.paymentRepository.findOne({
        where: {
          idempotencyKey,
          user: {
            id: userId,
          },
          order: {
            id: orderId,
          },
        },
        relations: {
          order: true,
        },
      });

    if (!payment) {
      return null;
    }

    if (
      payment.status === PaymentStatus.SUCCESS
    ) {
      return this.buildResponse(payment);
    }

    if (
      payment.status === PaymentStatus.PENDING &&
      payment.expiresAt &&
      payment.expiresAt > new Date()
    ) {
      return this.buildResponse(payment);
    }

    if (
      payment.status === PaymentStatus.PENDING &&
      payment.expiresAt &&
      payment.expiresAt <= new Date()
    ) {
      payment.status =
        PaymentStatus.FAILED;

      await this.paymentRepository.save(
        payment,
      );
    }

    return null;
  }

  private buildResponse(payment: Payment) {
    return {
      success: true,

      message:
        PaymentMessages.PAYMENT_ALREADY_PROCESSED,

      paymentId: payment.id,

      orderId: payment.order?.id,

      amount: payment.amount,

      status: payment.status,

      paymentMethod:
        PaymentMethod.GATEWAY,

      authority: payment.authority,

      referenceId: payment.referenceId,

      paymentUrl:
        payment.authority
          ? this.zarinPalService.getPaymentUrl(
              payment.authority,
            )
          : null,
    };
  }
}
