import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Payment } from './entities/payment.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { ZarinPalService } from './providers/zarinpal/zarinpal.service';
import { PaymentStatus } from './enums/payment-status.enum';

import { PaymentMessages } from 'src/common/enums/messages.enum';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,

    private readonly zarinPalService: ZarinPalService,
  ) {}

  async createPayment(
    createPaymentDto: CreatePaymentDto,
    userId: string,
  ) {
    const payment =
      this.paymentRepository.create({
        amount: createPaymentDto.amount,
        description:
          createPaymentDto.description,
        user: {
          id: userId,
        },
      });

    const savedPayment =
      await this.paymentRepository.save(
        payment,
      );

    const paymentResult =
      await this.zarinPalService.requestPayment(
        savedPayment.amount,
        savedPayment.description,
      );

    savedPayment.authority =
      paymentResult.authority;

    await this.paymentRepository.save(
      savedPayment,
    );

    return {
      id: savedPayment.id,
      amount: savedPayment.amount,
      description: savedPayment.description,
      status: savedPayment.status,
      authority: paymentResult.authority,
      paymentUrl: paymentResult.paymentUrl,
    };
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
    const payment =
      await this.paymentRepository.findOne({
        where: {
          authority,
        },
      });

    if (!payment) {
      throw new NotFoundException(
        PaymentMessages.PAYMENT_NOT_FOUND,
      );
    }

    if (status !== 'OK') {
      payment.status =
        PaymentStatus.FAILED;

      await this.paymentRepository.save(
        payment,
      );

      return {
        success: false,
        message:
          PaymentMessages.PAYMENT_CANCELLED,
        paymentId: payment.id,
      };
    }

    const verificationResult =
      await this.zarinPalService.verifyPayment(
        payment.amount,
        authority,
      );

    if (!verificationResult.success) {
      payment.status =
        PaymentStatus.FAILED;

      await this.paymentRepository.save(
        payment,
      );

      return {
        success: false,
        message:
          PaymentMessages.PAYMENT_VERIFICATION_FAILED,
        paymentId: payment.id,
      };
    }

    payment.status =
      PaymentStatus.SUCCESS;

    payment.referenceId =
      verificationResult.referenceId!;

    await this.paymentRepository.save(
      payment,
    );

    return {
      success: true,
      message:
        PaymentMessages.PAYMENT_SUCCESS,
      paymentId: payment.id,
      referenceId:
        verificationResult.referenceId,
    };
  }
}
