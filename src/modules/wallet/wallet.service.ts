import { Injectable } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Wallet } from './entities/wallet.entity';

import { DepositWalletDto } from './dto/deposit-wallet.dto';

import { WalletDepositService } from './wallet-deposit.service';
import { GetWalletTransactionsDto } from './dto/get-wallet-transaction.dto';
import { WalletTransaction } from './entities/wallet-transaction.entity';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,

    private readonly walletDepositService: WalletDepositService,

    @InjectRepository(WalletTransaction)
    private readonly walletTransactionRepository: Repository<WalletTransaction>,
  ) {}

  async getOrCreateWallet(userId: string) {
    let wallet = await this.walletRepository.findOne({
      where: {
        user: {
          id: userId,
        },
      },
    });

    if (!wallet) {
      wallet = this.walletRepository.create({
        balance: 0,
        user: {
          id: userId,
        },
      });

      wallet = await this.walletRepository.save(wallet);
    }

    return wallet;
  }

  async getBalance(userId: string) {
    const wallet = await this.getOrCreateWallet(userId);

    return {
      balance: wallet.balance,
    };
  }

  async deposit(userId: string, depositWalletDto: DepositWalletDto) {
    const wallet = await this.getOrCreateWallet(userId);

    return this.walletDepositService.deposit(userId, depositWalletDto, wallet);
  }

  async handleDepositCallback(authority: string, status: string) {
    return this.walletDepositService.handleDepositCallback(authority, status);
  }

  async getTransactions(
    userId: string,
    getWalletTransactionsDto: GetWalletTransactionsDto,
  ) {
    const { page = 1, limit = 10 } = getWalletTransactionsDto;

    const skip = (page - 1) * limit;

    const [transactions, total] =
      await this.walletTransactionRepository.findAndCount({
        where: {
          wallet: {
            user: {
              id: userId,
            },
          },
        },
        order: {
          createdAt: 'DESC',
        },
        skip,
        take: limit,
      });

    return {
      items: transactions,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
