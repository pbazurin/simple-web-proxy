import { ArgumentsHost, Catch } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { CustomLoggerService } from 'src/services/custom-logger.service';

@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter {
  constructor(private loggerService: CustomLoggerService) {
    super();
    loggerService.setContext(AllExceptionsFilter.name);
  }

  catch(exception: unknown, host: ArgumentsHost) {
    this.loggerService.warn(exception);

    super.catch(exception, host);
  }
}
