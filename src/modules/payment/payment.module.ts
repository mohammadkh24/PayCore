import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { ZarinPalService } from './providers/zarinpal/zarinpal.service';
import { Order } from '../order/entities/order.entity';
import { Wallet } from '../wallet/entities/wallet.entity';
import { WalletTransaction } from '../wallet/entities/wallet-transaction.entity';
import { WalletPaymentService } from './methods/wallet-payment.service';
import { GatewayPaymentService } from './methods/gateway-payment.service';
import { PaymentCreationService } from './services/payment-creation.service';
import { PaymentOrderService } from './services/payment-order.service';
import { PaymentIdempotencyService } from './services/payment-idempotency.service';
import { PaymentCallbackService } from './services/payment-callback.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment, Order, Wallet, WalletTransaction]),
  ],
  controllers: [PaymentController],
  providers: [
    PaymentService,
    ZarinPalService,
    WalletPaymentService,
    GatewayPaymentService,
    PaymentCreationService,
    PaymentOrderService,
    PaymentIdempotencyService,
    PaymentCallbackService
  ],
  exports: [ZarinPalService],
})
export class PaymentModule {}
