import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Order } from '../../order/entities/order.entity';
import { OrderStatus } from '../../order/enums/orderStatus.enum';

import { Payment } from '../entities/payment.entity';
import { PaymentStatus } from '../enums/payment-status.enum';
import { PaymentType } from '../enums/payment-type.enum';

import { PaymentMessages } from 'src/common/enums/messages.enum';

@Injectable()
export class PaymentOrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,

    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
  ) {}

  async getOrder(
    orderId: string,
    userId: string,
  ) {
    const order = await this.orderRepository.findOne({
      where: {
        id: orderId,
        user: {
          id: userId,
        },
      },
    });

    if (!order) {
      throw new NotFoundException(
        PaymentMessages.ORDER_NOT_FOUND,
      );
    }

    return order;
  }

  validateOrder(order: Order) {
    if (order.status === OrderStatus.PAID) {
      throw new BadRequestException(
        PaymentMessages.ORDER_ALREADY_PAID,
      );
    }
  }

  async handlePendingPayment(orderId: string) {
    const pendingPayment =
      await this.paymentRepository.findOne({
        where: {
          order: {
            id: orderId,
          },
          status: PaymentStatus.PENDING,
          type: PaymentType.ORDER,
        },
      });

    if (!pendingPayment) {
      return;
    }

    if (
      pendingPayment.expiresAt &&
      pendingPayment.expiresAt <= new Date()
    ) {
      pendingPayment.status = PaymentStatus.FAILED;

      await this.paymentRepository.save(
        pendingPayment,
      );

      return;
    }

    throw new BadRequestException(
      PaymentMessages.PAYMENT_ALREADY_IN_PROGRESS,
    );
  }
}
