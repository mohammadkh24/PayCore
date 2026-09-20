import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  Order,
} from './entities/order.entity';

import { CreateOrderDto } from './dto/create-order.dto';

import { Product } from '../product/entities/product.entity';

import { OrderMessages } from 'src/common/enums/messages.enum';
import { OrderStatus } from './enums/orderStatus.enum';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(
    createOrderDto: CreateOrderDto,
    userId: string,
  ) {
    const product =
      await this.productRepository.findOne({
        where: {
          id: createOrderDto.productId,
        },
      });

    if (!product) {
      throw new NotFoundException(
        OrderMessages.PRODUCT_NOT_FOUND,
      );
    }

    if (!product.isActive) {
      throw new BadRequestException(
        OrderMessages.PRODUCT_NOT_ACTIVE,
      );
    }

    const order =
      this.orderRepository.create({
        amount: product.price,
        status: OrderStatus.PENDING,
        user: {
          id: userId,
        },
        product,
      });

    return this.orderRepository.save(
      order,
    );
  }

  async findAll(userId: string) {
    return this.orderRepository.find({
      where: {
        user: {
          id: userId,
        },
      },
      relations: {
        product: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOne(
    id: string,
    userId: string,
  ) {
    const order =
      await this.orderRepository.findOne({
        where: {
          id,
          user: {
            id: userId,
          },
        },
        relations: {
          product: true,
        },
      });

    if (!order) {
      throw new NotFoundException(
        OrderMessages.ORDER_NOT_FOUND,
      );
    }

    return order;
  }
}