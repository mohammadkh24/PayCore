import { PartialType } from '@nestjs/swagger';
import { DepositWalletDto } from './deposit-wallet.dto';

export class UpdateWalletDto extends PartialType(DepositWalletDto) {}
