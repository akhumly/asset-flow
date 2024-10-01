// src/filters/all-exceptions.filter.ts

import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
  } from '@nestjs/common';
  import { Request, Response } from 'express';
  
  @Catch()
  export class AllExceptionsFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse<Response>();
      const request = ctx.getRequest<Request>();
  
      let status =
        exception instanceof HttpException
          ? exception.getStatus()
          : HttpStatus.INTERNAL_SERVER_ERROR;
  
      let message =
        exception instanceof HttpException
          ? exception.getResponse()
          : 'Internal server error';
  
      // Handle Prisma Client Known Request Errors
      if (
        exception instanceof Error &&
        exception.hasOwnProperty('code') &&
        (exception as any).code.startsWith('P')
      ) {
        status = HttpStatus.BAD_REQUEST;
        message = (exception as any).message;
      }
  
      response.status(status).json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
        error: message,
      });
    }
  }
  