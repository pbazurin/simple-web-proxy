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

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      providers: [
        ContentProcessingManagerService,
        AbsoluteUrlProcessor,
        RelativeUrlProcessor,
        IntegrityProcessor,
        StyleUrlProcessor,
        UtilsService,
        {
          provide: CustomLoggerService,
          useValue: CustomLoggerServiceMock,
        },
      ],
    }).compile();

    service = app.get<ContentProcessingManagerService>(
      ContentProcessingManagerService,
    );
  });

  it('should create', () => {
    // Assert
    expect(service).toBeTruthy();
  });
});
