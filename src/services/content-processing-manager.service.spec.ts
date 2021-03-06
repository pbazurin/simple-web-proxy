import { Test, TestingModule } from '@nestjs/testing';
import { ContentProcessingManagerService } from './content-processing-manager.service';
import { CustomLoggerService } from './custom-logger.service';
import { CustomLoggerServiceMock } from './custom-logger.service.mock';
import { AbsoluteUrlProcessor } from './processors/absolute-url.processor';
import { IntegrityProcessor } from './processors/integrity.processor';
import { Processor } from './processors/processor';
import { RelativeUrlProcessor } from './processors/relative-url.processor';
import { StyleUrlProcessor } from './processors/style-url.processor';
import { UtilsService } from './utils.service';
import { UtilsServiceMock } from './utils.service.mock';

describe('ContentProcessingManagerService', () => {
  let service: ContentProcessingManagerService;
  let absoluteUrlProcessorSpy: jest.SpyInstance;
  let relativeUrlProcessorSpy: jest.SpyInstance;
  let integrityProcessorSpy: jest.SpyInstance;
  let styleUrlProcessorSpy: jest.SpyInstance;

  const processorMock: Processor = {
    process: async (content: string) => content,
  } as Processor;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      providers: [
        ContentProcessingManagerService,
        {
          provide: UtilsService,
          useValue: UtilsServiceMock,
        },
        {
          provide: CustomLoggerService,
          useValue: CustomLoggerServiceMock,
        },
        {
          provide: AbsoluteUrlProcessor,
          useValue: { ...processorMock } as AbsoluteUrlProcessor,
        },
        {
          provide: RelativeUrlProcessor,
          useValue: { ...processorMock } as RelativeUrlProcessor,
        },
        {
          provide: IntegrityProcessor,
          useValue: { ...processorMock } as IntegrityProcessor,
        },
        {
          provide: StyleUrlProcessor,
          useValue: { ...processorMock } as StyleUrlProcessor,
        },
      ],
    }).compile();

    service = app.get<ContentProcessingManagerService>(
      ContentProcessingManagerService,
    );

    absoluteUrlProcessorSpy = jest.spyOn(
      app.get<AbsoluteUrlProcessor>(AbsoluteUrlProcessor),
      'process',
    );
    relativeUrlProcessorSpy = jest.spyOn(
      app.get<RelativeUrlProcessor>(RelativeUrlProcessor),
      'process',
    );
    integrityProcessorSpy = jest.spyOn(
      app.get<IntegrityProcessor>(IntegrityProcessor),
      'process',
    );
    styleUrlProcessorSpy = jest.spyOn(
      app.get<StyleUrlProcessor>(StyleUrlProcessor),
      'process',
    );
  });

  it('should not call any processors if content type is null', async () => {
    // Arrange
    const testContent: Buffer = Buffer.from('test buffer');
    const testUrl = 'test url';
    const testGetProxyId = async (url: string) => url;

    // Act
    const result: Buffer | string = await service.processContent(
      testContent,
      null,
      testUrl,
      testGetProxyId,
    );

    // Assert
    expect(result).toBe(testContent);
    expect(absoluteUrlProcessorSpy).not.toHaveBeenCalled();
    expect(relativeUrlProcessorSpy).not.toHaveBeenCalled();
    expect(integrityProcessorSpy).not.toHaveBeenCalled();
    expect(styleUrlProcessorSpy).not.toHaveBeenCalled();
  });

  it('should ignore unknown content type', async () => {
    // Arrange
    const testContent: Buffer = Buffer.from('test buffer');
    const testUrl = 'test url';
    const htmlContentType = 'multipart/form-data; boundary=something';
    const testGetProxyId = async (url: string) => url;

    // Act
    const result: Buffer | string = await service.processContent(
      testContent,
      htmlContentType,
      testUrl,
      testGetProxyId,
    );

    // Assert
    expect(result).toBe(testContent);
    expect(absoluteUrlProcessorSpy).not.toHaveBeenCalled();
    expect(relativeUrlProcessorSpy).not.toHaveBeenCalled();
    expect(integrityProcessorSpy).not.toHaveBeenCalled();
    expect(styleUrlProcessorSpy).not.toHaveBeenCalled();
  });

  it('should properly process html content', async () => {
    // Arrange
    const testContent = 'test buffer';
    const testUrl = 'test url';
    const htmlContentType = 'text/html; charset=UTF-8';
    const testGetProxyId = async (url: string) => url;

    // Act
    const result: Buffer | string = await service.processContent(
      Buffer.from(testContent),
      htmlContentType,
      testUrl,
      testGetProxyId,
    );

    // Assert
    expect(result).toBe(testContent);
    expect(absoluteUrlProcessorSpy).toHaveBeenCalled();
    expect(relativeUrlProcessorSpy).toHaveBeenCalled();
    expect(integrityProcessorSpy).toHaveBeenCalled();
    expect(styleUrlProcessorSpy).toHaveBeenCalled();
  });

  it('should properly process js content', async () => {
    // Arrange
    const testContent = 'test buffer';
    const testUrl = 'test url';
    const jsContentType = 'text/javascript';
    const testGetProxyId = async (url: string) => url;

    // Act
    const result: Buffer | string = await service.processContent(
      Buffer.from(testContent),
      jsContentType,
      testUrl,
      testGetProxyId,
    );

    // Assert
    expect(result).toBe(testContent);
    expect(absoluteUrlProcessorSpy).toHaveBeenCalled();
    expect(relativeUrlProcessorSpy).not.toHaveBeenCalled();
    expect(integrityProcessorSpy).toHaveBeenCalled();
    expect(styleUrlProcessorSpy).not.toHaveBeenCalled();
  });

  it('should properly process css content', async () => {
    // Arrange
    const testContent = 'test buffer';
    const testUrl = 'test url';
    const cssContentType = 'text/css';
    const testGetProxyId = async (url: string) => url;

    // Act
    const result: Buffer | string = await service.processContent(
      Buffer.from(testContent),
      cssContentType,
      testUrl,
      testGetProxyId,
    );

    // Assert
    expect(result).toBe(testContent);
    expect(absoluteUrlProcessorSpy).toHaveBeenCalled();
    expect(relativeUrlProcessorSpy).not.toHaveBeenCalled();
    expect(integrityProcessorSpy).toHaveBeenCalled();
    expect(styleUrlProcessorSpy).toHaveBeenCalled();
  });
});
