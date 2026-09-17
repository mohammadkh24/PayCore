import { entityName } from 'src/common/enums/entityNames.enum';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PaymentStatus } from '../enums/payment-status.enum';
import { User } from 'src/modules/user/entities/user.entity';

@Entity(entityName.Payment)
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: number;

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

  @Column({ nullable: true })
  description: string;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'userId' })
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
