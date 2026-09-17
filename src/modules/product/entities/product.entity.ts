import { entityName } from 'src/common/enums/entityNames.enum';
import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
  } from 'typeorm';
  
  @Entity(entityName.Product)
  export class Product {
    @PrimaryGeneratedColumn("uuid")
    id: string;
  
    @Column()
    name: string;
  
    @Column({ nullable: true })
    description: string;
  
    @Column()
    price: number;
  
    @Column({ default: true })
    isActive: boolean;
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
  }