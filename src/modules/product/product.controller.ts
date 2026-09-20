import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { AuthGuard } from 'src/common/guards/auth.guard';

@ApiTags('Products')
@Controller('products')
export class ProductController {
  constructor(
    private readonly productService: ProductService,
  ) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Create a product',
  })
  @ApiResponse({
    status: 201,
    description:
      'Product created successfully.',
  })
  @ApiResponse({
    status: 400,
    description:
      'Invalid product data.',
  })
  create(
    @Body()
    createProductDto: CreateProductDto,
  ) {
    return this.productService.create(
      createProductDto,
    );
  }

  @Get()
  @ApiOperation({
    summary: 'Get all products',
  })
  @ApiResponse({
    status: 200,
    description:
      'Products retrieved successfully.',
  })
  findAll() {
    return this.productService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a product by ID',
  })
  @ApiParam({
    name: 'id',
    example: 1,
    description: 'Product ID',
  })
  @ApiResponse({
    status: 200,
    description:
      'Product retrieved successfully.',
  })
  @ApiResponse({
    status: 404,
    description:
      'Product not found.',
  })
  findOne(
    @Param('id')
    id: string,
  ) {
    return this.productService.findOne(id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Update a product',
  })
  @ApiParam({
    name: 'id',
    example: "921d47d6-5ef3-4de9-9893-e43fc1f9d3ff",
    description: 'Product ID',
  })
  @ApiResponse({
    status: 200,
    description:
      'Product updated successfully.',
  })
  @ApiResponse({
    status: 404,
    description:
      'Product not found.',
  })
  update(
    @Param('id')
    id: string,

    @Body()
    updateProductDto: UpdateProductDto,
  ) {
    return this.productService.update(
      id,
      updateProductDto,
    );
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Delete a product',
  })
  @ApiParam({
    name: 'id',
    example: 1,
    description: 'Product ID',
  })
  @ApiResponse({
    status: 200,
    description:
      'Product deleted successfully.',
  })
  @ApiResponse({
    status: 404,
    description:
      'Product not found.',
  })
  remove(
    @Param('id')
    id: string,
  ) {
    return this.productService.remove(id);
  }
}