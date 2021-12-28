import { Test, TestingModule } from '@nestjs/testing';
import { CustomLoggerService } from '../custom-logger.service';
import { CustomLoggerServiceMock } from '../custom-logger.service.mock';
import { UtilsService } from '../utils.service';
import { RelativeUrlProcessor } from './relative-url.processor';

describe('RelativeUrlProcessor', () => {
  let processor: RelativeUrlProcessor;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      providers: [
        RelativeUrlProcessor,
        UtilsService,
        {
          provide: CustomLoggerService,
          useValue: CustomLoggerServiceMock,
        },
      ],
    }).compile();

    processor = app.get<RelativeUrlProcessor>(RelativeUrlProcessor);
  });

  it('should create', () => {
    expect(processor).toBeTruthy();
  });
});
