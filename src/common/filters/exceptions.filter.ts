import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';

interface ErrorResponse {
  message: string;
  success: boolean;
}

interface ErrorWrapper {
  error: {
    data: ErrorResponse;
  };
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = 500;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();

      if (typeof res === 'string') {
        message = res;
      } else if (res && typeof res === 'object') {
        const msg = (res as any)?.message;
        if (Array.isArray(msg)) {
          message = msg.join(', ');
        } else if (typeof msg === 'string') {
          message = msg;
        } else {
          message = JSON.stringify(res) || 'Internal server error';
        }
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    const errorResponse: ErrorResponse = { message, success: false };
    const responseWrapper: ErrorWrapper = { error: { data: errorResponse } };

    response.status(status).json(responseWrapper);
  }
}
