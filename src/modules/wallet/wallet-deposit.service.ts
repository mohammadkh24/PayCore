import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import {
  DataSource,
  Repository,
} from 'typeorm';

import { Wallet } from './entities/wallet.entity';
import { WalletTransaction } from './entities/wallet-transaction.entity';
import { Payment } from '../payment/entities/payment.entity';

import { DepositWalletDto } from './dto/deposit-wallet.dto';

import { PaymentStatus } from '../payment/enums/payment-status.enum';
import { PaymentType } from '../payment/enums/payment-type.enum';

import { ZarinPalService } from '../payment/providers/zarinpal/zarinpal.service';

import { WalletTransactionType } from './enums/wallet-transactions-type.enum';

import { WalletMessages } from 'src/common/enums/messages.enum';

@Injectable()
export class WalletDepositService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,

    private readonly zarinPalService: ZarinPalService,

    private readonly dataSource: DataSource,
  ) {}

  async deposit(
    userId: string,
    depositWalletDto: DepositWalletDto,
    wallet: Wallet,
  ) {
    const payment =
      this.paymentRepository.create({
        amount: depositWalletDto.amount,
        status: PaymentStatus.PENDING,
        type: PaymentType.WALLET_DEPOSIT,
        description: `Wallet deposit for user ${userId}`,
        user: {
          id: userId,
        },
        wallet,
      });

    const savedPayment =
      await this.paymentRepository.save(
        payment,
      );

    const paymentResult =
      await this.zarinPalService.requestPayment(
        savedPayment.amount,
        savedPayment.description,
        'http://localhost:3000/wallet/deposit/callback',
      );

    savedPayment.authority =
      paymentResult.authority;

    await this.paymentRepository.save(
      savedPayment,
    );

    return {
      paymentId: savedPayment.id,
      amount: savedPayment.amount,
      status: savedPayment.status,
      authority: savedPayment.authority,
      paymentUrl: paymentResult.paymentUrl,
    };
  }

  async handleDepositCallback(
    authority: string,
    status: string,
  ) {
    const payment =
      await this.paymentRepository.findOne({
        where: {
          authority,
          type: PaymentType.WALLET_DEPOSIT,
        },
        relations: {
          wallet: true,
        },
      });
  
    if (!payment) {
      throw new NotFoundException(
        WalletMessages.WALLET_DEPOSIT_NOT_FOUND,
      );
    }
  
    if (
      payment.status === PaymentStatus.SUCCESS
    ) {
      return {
        success: true,
        message:
          WalletMessages.WALLET_DEPOSIT_ALREADY_PROCESSED,
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
  
      return {
        success: false,
        message:
          WalletMessages.WALLET_DEPOSIT_CANCELLED,
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
          WalletMessages.WALLET_DEPOSIT_VERIFICATION_FAILED,
        paymentId: payment.id,
      };
    }
  
    return this.dataSource.transaction(
      async (manager) => {
        const wallet =
          await manager.findOne(Wallet, {
            where: {
              id: payment.wallet.id,
            },
          });
  
        if (!wallet) {
          throw new NotFoundException(
            WalletMessages.WALLET_NOT_FOUND,
          );
        }
  
        const balanceBefore =
          wallet.balance;
  
        wallet.balance += payment.amount;
  
        const balanceAfter =
          wallet.balance;
  
        await manager.save(
          Wallet,
          wallet,
        );
  
        const transaction =
          manager.create(
            WalletTransaction,
            {
              amount: payment.amount,
              balanceBefore,
              balanceAfter,
              type:
                WalletTransactionType.DEPOSIT,
              wallet,
            },
          );
  
        await manager.save(
          WalletTransaction,
          transaction,
        );
  
        payment.status =
          PaymentStatus.SUCCESS;
  
        payment.referenceId =
          verificationResult.referenceId!;
  
        await manager.save(
          Payment,
          payment,
        );
  
        return {
          success: true,
          message:
            WalletMessages.WALLET_DEPOSIT_SUCCESS,
          paymentId: payment.id,
          transactionId:
            transaction.id,
          amount: payment.amount,
          balance: balanceAfter,
          referenceId:
            verificationResult.referenceId,
        };
      },
    );
  }
}
