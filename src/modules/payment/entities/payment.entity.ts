import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { User } from '../../user/entities/user.entity';
import { Order } from '../../order/entities/order.entity';
import { Wallet } from '../../wallet/entities/wallet.entity';

import { PaymentStatus } from '../enums/payment-status.enum';
import { PaymentType } from '../enums/payment-type.enum';

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  amount: number;

  @Column({ nullable: true })
  authority: string;

  @Column({ nullable: true })
  referenceId: string;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  @Column({
    type: 'enum',
    enum: PaymentType,
  })
  type: PaymentType;

  @Column({ nullable: true })
  description: string;

  @ManyToOne(() => User, {
    nullable: false,
  })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Order, {
    nullable: true,
  })
  @JoinColumn({ name: 'orderId' })
  order: Order;

  @ManyToOne(() => Wallet, {
    nullable: true,
  })
  @JoinColumn({ name: 'walletId' })
  wallet: Wallet;

  @Column({
    type: 'varchar',
    length: 100,
    unique: true,
    nullable: true,
  })
  idempotencyKey: string | null;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  expiresAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
