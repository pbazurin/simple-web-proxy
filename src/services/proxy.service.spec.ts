import { Test, TestingModule } from '@nestjs/testing';
import { AxiosResponse } from 'axios';
import { of } from 'rxjs';
import { ProxyResponse } from '../models/proxy-response';
import { ProxyRepository } from '../repositories/proxy.repository';
import { ContentProcessingManagerService } from './content-processing-manager.service';
import { CustomLoggerService } from './custom-logger.service';
import { CustomLoggerServiceMock } from './custom-logger.service.mock';
import { HeadersProcessingManager } from './headers-processing-manager.service';
import { HttpWrapperService } from './http-wrapper.service';
import { ProxyService } from './proxy.service';
import { UtilsService } from './utils.service';
import { UtilsServiceMock } from './utils.service.mock';

describe('ProxyService', () => {
  let service: ProxyService;
  let proxyRepository: ProxyRepository;
  let httpWrapperService: HttpWrapperService;
  let contentProcessingManagerService: ContentProcessingManagerService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      providers: [
        ProxyService,
        {
          provide: UtilsService,
          useValue: UtilsServiceMock,
        },
        {
          provide: ProxyRepository,
          useValue: {
            add: async (value: string) => value,
            getById: async (id: string) => id,
          } as ProxyRepository,
        },
        {
          provide: ContentProcessingManagerService,
          useValue: {
            processContent: async (
              contentBuffer: Buffer,
              contentType: string,
              realUrl: string,
              getProxyUrl: (realUrl: string) => Promise<string>,
            ) =>
              contentBuffer && contentType && realUrl && getProxyUrl
                ? 'testContent'
                : null,
          } as ContentProcessingManagerService,
        },
        {
          provide: HeadersProcessingManager,
          useValue: {
            processRequestHeaders: (
              requestHeaders: Record<string, string | string[]>,
            ) => requestHeaders,
            processResponseHeaders: (
              responseHeaders: Record<string, string | string[]>,
            ) => responseHeaders,
          } as HeadersProcessingManager,
        },
        {
          provide: CustomLoggerService,
          useValue: CustomLoggerServiceMock,
        },
        {
          provide: HttpWrapperService,
          useValue: {
            get: () => of(null),
          },
        },
      ],
    }).compile();

    service = app.get<ProxyService>(ProxyService);
    proxyRepository = app.get<ProxyRepository>(ProxyRepository);
    httpWrapperService = app.get<HttpWrapperService>(HttpWrapperService);
    contentProcessingManagerService = app.get<ContentProcessingManagerService>(
      ContentProcessingManagerService,
    );
  });

  describe('generateProxyIdForUrl', () => {
    it('should get new id from proxy repository', async () => {
      // Arrange
      const testUrl = 'test url';
      const testProxyId = 'test proxy id';
      const proxyRepositoryAddSpy = jest
        .spyOn(proxyRepository, 'add')
        .mockResolvedValue(testProxyId);

      // Act
      const result: string = await service.generateProxyIdForUrl(testUrl);

      // Assert
      expect(proxyRepositoryAddSpy).toBeCalledWith(testUrl);
      expect(result).toBe(testProxyId);
    });
  });

  describe('getContentByProxyId', () => {
    it('should get content from proxy repository', async () => {
      // Arrange
      const testProxyId = 'test proxy id';
      const testRealUrl = 'some test url';
      const proxyRepositoryGetByIdSpy = jest
        .spyOn(proxyRepository, 'getById')
        .mockResolvedValue(testRealUrl);
      const requestHeaders: Record<string, string | string[]> = {
        header1: 'value1',
        header2: 'value2',
      };
      const expectedProxyResponse: ProxyResponse = {
        status: 200,
        body: 'test response',
        headers: {
          some: 'header',
        },
      } as ProxyResponse;
      jest.spyOn(httpWrapperService, 'get').mockResolvedValue({
        status: expectedProxyResponse.status,
        headers: expectedProxyResponse.headers,
      } as AxiosResponse);
      jest
        .spyOn(contentProcessingManagerService, 'processContent')
        .mockResolvedValue(expectedProxyResponse.body);

      // Act
      const result: ProxyResponse = await service.getContentByProxyId(
        testProxyId,
        requestHeaders,
        (url: string) => url,
      );

      // Assert
      expect(proxyRepositoryGetByIdSpy).toBeCalledWith(testProxyId);
      expect(result).toEqual(expectedProxyResponse);
    });
  });
});
