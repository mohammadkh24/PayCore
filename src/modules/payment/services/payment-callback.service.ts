import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Payment } from '../entities/payment.entity';
import { Order } from '../../order/entities/order.entity';

import { PaymentStatus } from '../enums/payment-status.enum';
import { PaymentType } from '../enums/payment-type.enum';
import { OrderStatus } from '../../order/enums/orderStatus.enum';

import { PaymentMessages } from 'src/common/enums/messages.enum';

import { ZarinPalService } from '../providers/zarinpal/zarinpal.service';

@Injectable()
export class PaymentCallbackService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,

    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,

    private readonly zarinPalService: ZarinPalService,
  ) {}

  async handle(
    authority: string,
    status: string,
  ) {
    const payment =
      await this.paymentRepository.findOne({
        where: {
          authority,
        },
        relations: {
          order: true,
          user: true,
        },
      });

    if (!payment) {
      throw new NotFoundException(
        PaymentMessages.PAYMENT_NOT_FOUND,
      );
    }

    if (
      payment.status === PaymentStatus.SUCCESS
    ) {
      return {
        success: true,
        message:
          PaymentMessages.WALLET_DEPOSIT_ALREADY_PROCESSED,
        paymentId: payment.id,
        referenceId: payment.referenceId,
      };
    }

    if (status !== 'OK') {
      payment.status =
        PaymentStatus.FAILED;

      await this.paymentRepository.save(
        payment,
      );

      if (
        payment.type === PaymentType.ORDER &&
        payment.order
      ) {
        payment.order.status =
          OrderStatus.CANCELLED;

        await this.orderRepository.save(
          payment.order,
        );
      }

      throw new BadRequestException(
        PaymentMessages.PAYMENT_CANCELLED,
      );
    }

    const verification =
      await this.zarinPalService.verifyPayment(
        payment.amount,
        authority,
      );

    if (
      !verification.success ||
      !verification.referenceId
    ) {
      payment.status =
        PaymentStatus.FAILED;

      await this.paymentRepository.save(
        payment,
      );

      throw new BadRequestException(
        PaymentMessages.PAYMENT_VERIFICATION_FAILED,
      );
    }

    payment.status =
      PaymentStatus.SUCCESS;

    payment.referenceId =
      verification.referenceId;

    await this.paymentRepository.save(
      payment,
    );

    if (
      payment.type === PaymentType.ORDER &&
      payment.order
    ) {
      payment.order.status =
        OrderStatus.PAID;

      await this.orderRepository.save(
        payment.order,
      );
    }

    return {
      success: true,
      message:
        PaymentMessages.PAYMENT_SUCCESS,
      paymentId: payment.id,
      referenceId:
        verification.referenceId,
      orderId:
        payment.order?.id ?? null,
    };
  }
}
