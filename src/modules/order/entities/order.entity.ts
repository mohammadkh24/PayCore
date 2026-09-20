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
  import { Product } from '../../product/entities/product.entity';
import { OrderStatus } from '../enums/orderStatus.enum';

  
  @Entity('orders')
  export class Order {
    @PrimaryGeneratedColumn("uuid")
    id: string;
  
    @Column()
    amount: number;
  
    @Column({
      type: 'enum',
      enum: OrderStatus,
      default: OrderStatus.PENDING,
    })
    status: OrderStatus;
  
    @ManyToOne(() => User, {
      nullable: false,
    })
    @JoinColumn({ name: 'userId' })
    user: User;
  
    @ManyToOne(() => Product, {
      nullable: false,
    })
    @JoinColumn({ name: 'productId' })
    product: Product;
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
  }