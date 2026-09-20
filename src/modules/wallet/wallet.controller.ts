import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import type { Response } from 'express';

import { WalletService } from './wallet.service';
import { DepositWalletDto } from './dto/deposit-wallet.dto';
import { AuthGuard } from 'src/common/guards/auth.guard';
import type { AuthenticatedRequest } from '../payment/interfaces/authenticated-req.interface';
import { GetWalletTransactionsDto } from './dto/get-wallet-transaction.dto';

@ApiTags('Wallet')
@Controller('wallet')
export class WalletController {
  constructor(
    private readonly walletService: WalletService,
  ) {}

  @Get()
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  getBalance(
    @Req() req: AuthenticatedRequest,
  ) {
    return this.walletService.getBalance(
      req.user.sub,
    );
  }

  @Post('deposit')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  deposit(
    @Body()
    depositWalletDto: DepositWalletDto,

    @Req()
    req: AuthenticatedRequest,
  ) {
    return this.walletService.deposit(
      req.user.sub,
      depositWalletDto,
    );
  }

  @Get('deposit/callback')
  async callback(
    @Query('Authority')
    authority: string,

    @Query('Status')
    status: string,

    @Res()
    res: Response,
  ) {
    try {
      const result =
        await this.walletService.handleDepositCallback(
          authority,
          status,
        );

      const params =
        new URLSearchParams({
          success: String(
            result.success,
          ),

          message:
            result.message ?? '',

          paymentId:
            result.paymentId ?? '',

          referenceId:
            result.referenceId ?? '',
        });

      return res.redirect(
        `http://localhost:5500/wallet-result.html?${params.toString()}`,
      );
    } catch (error: any) {
      const params =
        new URLSearchParams({
          success: 'false',

          message:
            error?.message ||
            'پرداخت ناموفق بود',
        });

      return res.redirect(
        `http://localhost:5500/wallet-result.html?${params.toString()}`,
      );
    }
  }

  @Get('transactions')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Get wallet transaction history',
  })
  async getTransactions(
    @Req() req,
    @Query()
    query: GetWalletTransactionsDto,
  ) {
    return this.walletService.getTransactions(
      req.user.sub,
      query,
    );
  }
}
