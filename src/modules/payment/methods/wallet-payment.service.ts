import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';

import { Payment } from '../entities/payment.entity';
import { Order } from '../../order/entities/order.entity';
import { Wallet } from '../../wallet/entities/wallet.entity';
import { WalletTransaction } from '../../wallet/entities/wallet-transaction.entity';

import { PaymentStatus } from '../enums/payment-status.enum';
import { PaymentType } from '../enums/payment-type.enum';
import { PaymentMethod } from '../enums/payment-method';
import { OrderStatus } from '../../order/enums/orderStatus.enum';
import { WalletTransactionType } from '../../wallet/enums/wallet-transactions-type.enum';

import { PaymentMessages } from 'src/common/enums/messages.enum';

@Injectable()
export class WalletPaymentService {
  constructor(
    private readonly dataSource: DataSource,
  ) {}

  async pay(
    order: Order,
    userId: string,
    idempotencyKey: string,
  ) {
    return this.dataSource.transaction(async (manager) => {
      const wallet = await manager.findOne(Wallet, {
        where: {
          user: {
            id: userId,
          },
        },
        lock: {
          mode: 'pessimistic_write',
        },
      });

      if (!wallet) {
        throw new NotFoundException(
          PaymentMessages.WALLET_NOT_FOUND,
        );
      }

      if (wallet.balance < order.amount) {
        throw new BadRequestException(
          PaymentMessages.WALLET_INSUFFICIENT_BALANCE,
        );
      }

      const balanceBefore = wallet.balance;

      wallet.balance -= order.amount;

      const balanceAfter = wallet.balance;

      await manager.save(Wallet, wallet);

      const transaction = manager.create(
        WalletTransaction,
        {
          amount: order.amount,
          balanceBefore,
          balanceAfter,
          type: WalletTransactionType.PAYMENT,
          wallet,
        },
      );

      await manager.save(
        WalletTransaction,
        transaction,
      );

      const payment = manager.create(
        Payment,
        {
          amount: order.amount,
          status: PaymentStatus.SUCCESS,
          type: PaymentType.ORDER,
          idempotencyKey,
          description: `Wallet payment for order ${order.id}`,
          user: {
            id: userId,
          },
          order,
          wallet,
        },
      );

      const savedPayment = await manager.save(
        Payment,
        payment,
      );

      order.status = OrderStatus.PAID;

      await manager.save(Order, order);

      return {
        success: true,
        message:
          PaymentMessages.WALLET_PAYMENT_SUCCESS,
        paymentId: savedPayment.id,
        transactionId: transaction.id,
        orderId: order.id,
        amount: order.amount,
        paymentMethod: PaymentMethod.WALLET,
        balance: balanceAfter,
      };
    });
  }
}
