import { Test, TestingModule } from '@nestjs/testing';
import { ContentProcessingManagerService } from './content-processing-manager.service';
import { CustomLoggerService } from './custom-logger.service';
import { CustomLoggerServiceMock } from './custom-logger.service.mock';
import { AbsoluteUrlProcessor } from './processors/absolute-url.processor';
import { IntegrityProcessor } from './processors/integrity.processor';
import { RelativeUrlProcessor } from './processors/relative-url.processor';
import { StyleUrlProcessor } from './processors/style-url.processor';
import { UtilsService } from './utils.service';

describe('ContentProcessingManagerService', () => {
  let service: ContentProcessingManagerService;
  let absoluteUrlProcessorSpy: jest.SpyInstance;
  let relativeUrlProcessorSpy: jest.SpyInstance;
  let integrityProcessorSpy: jest.SpyInstance;
  let styleUrlProcessorSpy: jest.SpyInstance;

  const processorMock = {
    process: async (content: string) => content,
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      providers: [
        ContentProcessingManagerService,
        UtilsService,
        {
          provide: CustomLoggerService,
          useValue: CustomLoggerServiceMock,
        },
        {
          provide: AbsoluteUrlProcessor,
          useValue: { ...processorMock },
        },
        {
          provide: RelativeUrlProcessor,
          useValue: { ...processorMock },
        },
        {
          provide: IntegrityProcessor,
          useValue: { ...processorMock },
        },
        {
          provide: StyleUrlProcessor,
          useValue: { ...processorMock },
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
    const result: Buffer | string = await service.getProcessedContent(
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
    const result: Buffer | string = await service.getProcessedContent(
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
    const result: Buffer | string = await service.getProcessedContent(
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
    const result: Buffer | string = await service.getProcessedContent(
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
    const result: Buffer | string = await service.getProcessedContent(
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
