import { ArgumentsHost } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { CustomLoggerService } from '../services/custom-logger.service';
import { CustomLoggerServiceMock } from '../services/custom-logger.service.mock';
import { AllExceptionsFilter } from './all-exceptions.filter';

describe('AllExceptionsFilter', () => {
  let filter: AllExceptionsFilter;
  let loggerService: CustomLoggerService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      providers: [
        AllExceptionsFilter,
        {
          provide: CustomLoggerService,
          useValue: CustomLoggerServiceMock,
        },
        {
          provide: HttpAdapterHost,
          useValue: {
            httpAdapter: {
              reply: (response: any, body: any) =>
                response && body ? null : undefined,
            },
          } as HttpAdapterHost,
        },
      ],
    }).compile();

    filter = app.get<AllExceptionsFilter>(AllExceptionsFilter);
    loggerService = app.get<CustomLoggerService>(CustomLoggerService);
  });

  it('should log error', () => {
    // Arrange
    const warnSpy = jest.spyOn(loggerService, 'warn').mockImplementation();
    const testError = {
      message: 'test error',
      name: 'TestError',
      stack: 'test stack',
    } as Error;
    const argumentsHostMock: ArgumentsHost = {
      getArgByIndex: (index: number) => index,
    } as ArgumentsHost;

    // Act
    filter.catch(testError, argumentsHostMock);

    // Assert
    expect(warnSpy).toBeCalledTimes(1);
    expect(warnSpy).toBeCalledWith(testError);
  });
});
