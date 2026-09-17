import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(
    createProductDto: CreateProductDto,
  ) {
    const product =
      this.productRepository.create(
        createProductDto,
      );

    return this.productRepository.save(
      product,
    );
  }

  async findAll() {
    return this.productRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOne(id: string) {
    const product =
      await this.productRepository.findOne({
        where: {
          id,
        },
      });

    if (!product) {
      throw new NotFoundException(
        'محصول پیدا نشد',
      );
    }

    return product;
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
  ) {
    const product =
      await this.findOne(id);

    Object.assign(
      product,
      updateProductDto,
    );

    return this.productRepository.save(
      product,
    );
  }

  async remove(id: string) {
    const product =
      await this.findOne(id);

    await this.productRepository.remove(
      product,
    );

    return {
      message: 'محصول با موفقیت حذف شد',
    };
  }
}