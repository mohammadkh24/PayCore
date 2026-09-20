import { Injectable } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Payment } from './entities/payment.entity';

import { CreatePaymentDto } from './dto/create-payment.dto';

import { PaymentCreationService } from './services/payment-creation.service';
import { PaymentCallbackService } from './services/payment-callback.service';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,

    private readonly paymentCreationService: PaymentCreationService,

    private readonly paymentCallbackService: PaymentCallbackService,
  ) {}

  async createPayment(
    createPaymentDto: CreatePaymentDto,
    userId: string,
    idempotencyKey: string,
  ) {
    return this.paymentCreationService.create(
      createPaymentDto,
      userId,
      idempotencyKey,
    );
  }

  async findAll(userId: string) {
    return this.paymentRepository.find({
      where: {
        user: {
          id: userId,
        },
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async handleCallback(
    authority: string,
    status: string,
  ) {
    return this.paymentCallbackService.handle(
      authority,
      status,
    );
  }
}
