import { Test, TestingModule } from '@nestjs/testing';
import { CustomLoggerService } from '../custom-logger.service';
import { CustomLoggerServiceMock } from '../custom-logger.service.mock';
import { UtilsService } from '../utils.service';
import { StyleUrlProcessor } from './style-url.processor';

describe('StyleUrlProcessor', () => {
  let processor: StyleUrlProcessor;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      providers: [
        StyleUrlProcessor,
        UtilsService,
        {
          provide: CustomLoggerService,
          useValue: CustomLoggerServiceMock,
        },
      ],
    }).compile();

    processor = app.get<StyleUrlProcessor>(StyleUrlProcessor);
  });

  it('should create', () => {
    expect(processor).toBeTruthy();
  });
});
