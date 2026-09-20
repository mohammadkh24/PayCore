import { Module } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Wallet } from './entities/wallet.entity';
import { WalletTransaction } from './entities/wallet-transaction.entity';
import { Payment } from '../payment/entities/payment.entity';
import { PaymentModule } from '../payment/payment.module';
import { WalletDepositService } from './wallet-deposit.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Wallet, WalletTransaction, Payment]),
    PaymentModule,
  ],
  controllers: [WalletController],
  providers: [WalletService, WalletDepositService],
})
export class WalletModule {}
