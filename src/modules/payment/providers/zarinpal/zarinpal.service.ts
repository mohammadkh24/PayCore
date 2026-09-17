import {
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';

import axios from 'axios';
import { ConfigService } from '@nestjs/config';

import { ZarinPalMessages } from 'src/common/enums/messages.enum';

@Injectable()
export class ZarinPalService {
  private readonly merchantId: string;
  private readonly baseUrl: string;
  private readonly callbackUrl: string;

  constructor(
    private readonly configService: ConfigService,
  ) {
    this.merchantId =
      this.configService.get<string>(
        'zarinpal.merchantId',
      )!;

    this.baseUrl =
      this.configService.get<string>(
        'zarinpal.baseUrl',
      )!;

    this.callbackUrl =
      this.configService.get<string>(
        'zarinpal.callbackUrl',
      )!;
  }

  async requestPayment(
    amount: number,
    description: string,
  ) {
    const response = await axios.post(
      `${this.baseUrl}/pg/v4/payment/request.json`,
      {
        merchant_id: this.merchantId,
        amount,
        description,
        callback_url: this.callbackUrl,
        currency: 'IRR',
      },
    );

    const data = response.data;

    if (data.data?.code !== 100) {
      throw new InternalServerErrorException(
        ZarinPalMessages.REQUEST_FAILED,
      );
    }

    const authority =
      data.data.authority;

    return {
      authority,
      paymentUrl:
        `${this.baseUrl}/pg/StartPay/${authority}`,
    };
  }

  async verifyPayment(
    amount: number,
    authority: string,
  ) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/pg/v4/payment/verify.json`,
        {
          merchant_id: this.merchantId,
          amount,
          authority,
        },
      );

      const data = response.data;
      const code = data.data?.code;

      if (
        code === 100 ||
        code === 101
      ) {
        return {
          success: true,
          referenceId: String(
            data.data.ref_id,
          ),
        };
      }

      return {
        success: false,
        referenceId: null,
      };
    } catch (error) {
      console.error(
        'ZarinPal Verify ERROR:',
        error,
      );

      return {
        success: false,
        referenceId: null,
      };
    }
  }
}
