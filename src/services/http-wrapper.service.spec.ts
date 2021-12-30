import { HttpService } from '@nestjs/axios';
import { BadRequestException, RequestTimeoutException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AxiosRequestHeaders } from 'axios';
import { of, throwError } from 'rxjs';
import { CustomLoggerService } from './custom-logger.service';
import { CustomLoggerServiceMock } from './custom-logger.service.mock';
import { HttpWrapperService } from './http-wrapper.service';

describe('HttpWrapperService', () => {
  let service: HttpWrapperService;
  let httpService: HttpService;

  const testResponse = 'some test response';

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      providers: [
        HttpWrapperService,
        {
          provide: CustomLoggerService,
          useValue: CustomLoggerServiceMock,
        },
        {
          provide: HttpService,
          useValue: {
            get: () => of({ data: testResponse }),
          },
        },
      ],
    }).compile();

    service = app.get<HttpWrapperService>(HttpWrapperService);
    httpService = app.get<HttpService>(HttpService);
  });

  it('should request url on get', async () => {
    // Arrange
    const testUrl = 'https://test.com/something';
    const testHeaders: AxiosRequestHeaders = { test: 'header' };
    const httpGetSpy = jest.spyOn(httpService, 'get');

    // Act
    const result = await service.get(testUrl, testHeaders);

    // Assert
    expect(result).toBeTruthy();
    expect(result.data).toBe(testResponse);
    expect(httpGetSpy).toBeCalledTimes(1);
    expect(httpGetSpy).toBeCalledWith(
      testUrl,
      expect.objectContaining({ headers: testHeaders }),
    );
  });

  it('should throw BadRequestException on error', async () => {
    // Arrange
    const testUrl = 'https://test.com/something';
    const testHeaders: AxiosRequestHeaders = { test: 'header' };
    jest
      .spyOn(httpService, 'get')
      .mockReturnValue(throwError(() => Error('test error')));

    // Assert
    await expect(
      async () => await service.get(testUrl, testHeaders),
    ).rejects.toThrow(BadRequestException);
  });

  it('should throw RequestTimeoutException on timeout', async () => {
    // Arrange
    const testUrl = 'https://test.com/something';
    const testHeaders: AxiosRequestHeaders = { test: 'header' };
    jest
      .spyOn(httpService, 'get')
      .mockReturnValue(throwError(() => Error('test timeout error')));

    // Assert
    await expect(
      async () => await service.get(testUrl, testHeaders),
    ).rejects.toThrow(RequestTimeoutException);
  });
});
