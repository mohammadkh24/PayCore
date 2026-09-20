import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Wallet } from './wallet.entity';
import { entityName } from 'src/common/enums/entityNames.enum';
import { WalletTransactionType } from '../enums/wallet-transactions-type.enum';

@Entity(entityName.Wallet_Transactions)
export class WalletTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('bigint')
  amount: number;

  @Column()
  balanceBefore: number;

  @Column()
  balanceAfter: number;

  @Column({
    type: 'enum',
    enum: WalletTransactionType,
  })
  type: WalletTransactionType;

  @ManyToOne(() => Wallet, {
    nullable: false,
  })
  @JoinColumn({ name: 'walletId' })
  wallet: Wallet;

  @CreateDateColumn()
  createdAt: Date;
}
