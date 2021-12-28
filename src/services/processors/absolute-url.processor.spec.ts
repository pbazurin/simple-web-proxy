import { Test, TestingModule } from '@nestjs/testing';
import { CustomLoggerService } from '../custom-logger.service';
import { CustomLoggerServiceMock } from '../custom-logger.service.mock';
import { AbsoluteUrlProcessor } from './absolute-url.processor';

describe('AbsoluteUrlProcessor', () => {
  let processor: AbsoluteUrlProcessor;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      providers: [
        AbsoluteUrlProcessor,
        {
          provide: CustomLoggerService,
          useValue: CustomLoggerServiceMock,
        },
      ],
    }).compile();

    processor = app.get<AbsoluteUrlProcessor>(AbsoluteUrlProcessor);
  });

  it('should create', () => {
    expect(processor).toBeFalsy();
  });
});
