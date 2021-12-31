import { Test, TestingModule } from '@nestjs/testing';
import { Request, Response } from 'express';
import { ProxyResponse } from '../models/proxy-response';
import { CustomLoggerService } from '../services/custom-logger.service';
import { CustomLoggerServiceMock } from '../services/custom-logger.service.mock';
import { ProxyService } from '../services/proxy.service';
import { ProxyController } from './proxy.controller';

describe('ProxyController', () => {
  let controller: ProxyController;
  let proxyService: ProxyService;
  let responseMock: Response;
  let redirectSpy: jest.SpyInstance;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      providers: [
        ProxyController,
        {
          provide: ProxyService,
          useValue: {
            getContentByProxyId: async () => null,
            generateProxyIdForUrl: async () => null,
          },
        },
        {
          provide: CustomLoggerService,
          useValue: CustomLoggerServiceMock,
        },
      ],
    }).compile();

    controller = app.get<ProxyController>(ProxyController);
    proxyService = app.get<ProxyService>(ProxyService);

    responseMock = {
      redirect: (url: string) => (url ? null : undefined),
      status: (status: number) => (status ? responseMock : null),
      setHeader: (name: string, value: any) =>
        name && value ? responseMock : null,
      send: () => null,
    } as Response;
    redirectSpy = jest.spyOn(responseMock, 'redirect');
  });

  describe('getProxyContentById', () => {
    let requestMock: Request;

    beforeEach(async () => {
      requestMock = {} as Request;
    });

    it('should redirect to home page with error if proxy id is empty', async () => {
      // Arrange
      const testProxyId = '';

      // Act
      await controller.getProxyContentById(
        testProxyId,
        requestMock,
        responseMock,
      );

      // Assert
      expect(redirectSpy).toBeCalledWith('/?failed');
    });

    it('should redirect to home page with error if any error is thrown', async () => {
      // Arrange
      const testProxyId = '12345';

      // Act
      await controller.getProxyContentById(
        testProxyId,
        requestMock,
        responseMock,
      );

      // Assert
      expect(redirectSpy).toBeCalledWith('/?failed');
    });

    it('should return real url response if proxy id is valid', async () => {
      // Arrange
      const testProxyId = '12345';
      const responseStatusSpy = jest.spyOn(responseMock, 'status');
      const responseSendSpy = jest.spyOn(responseMock, 'send');
      const responseSetHeaderSpy = jest.spyOn(responseMock, 'setHeader');
      const proxyResponse = {
        status: 200,
        headers: { test: 'response headers' },
        body: 'test response',
      } as ProxyResponse;
      const getContentByProxyIdSpy = jest
        .spyOn(proxyService, 'getContentByProxyId')
        .mockResolvedValue(proxyResponse);

      // Act
      await controller.getProxyContentById(
        testProxyId,
        requestMock,
        responseMock,
      );

      // Assert
      expect(getContentByProxyIdSpy).toBeCalledWith(
        testProxyId,
        requestMock.headers,
        expect.any(Function),
      );
      expect(responseStatusSpy).toBeCalledWith(proxyResponse.status);
      expect(responseSetHeaderSpy).toBeCalledWith(
        'test',
        proxyResponse.headers['test'],
      );
      expect(responseSendSpy).toBeCalledWith(proxyResponse.body);
    });
  });

  describe('createProxy', () => {
    it('should redirect to proxy url if url is not empty', async () => {
      // Arrange
      const testProxyId = '12345';
      const testUrl = 'some test url';
      const generateProxyIdForUrlSpy = jest
        .spyOn(proxyService, 'generateProxyIdForUrl')
        .mockResolvedValue(testProxyId);

      // Act
      await controller.createProxy(testUrl, responseMock);

      // Assert
      expect(generateProxyIdForUrlSpy).toBeCalledWith(testUrl);
      expect(redirectSpy).toBeCalledWith(expect.stringContaining(testProxyId));
    });

    it('should redirect to home page with empty error if url is empty', async () => {
      // Act
      await controller.createProxy(null, responseMock);

      // Assert
      expect(redirectSpy).toBeCalledWith('/?empty');
    });
  });
});
