import { Test, TestingModule } from '@nestjs/testing';
import { CustomLoggerService } from '../custom-logger.service';
import { CustomLoggerServiceMock } from '../custom-logger.service.mock';
import { IntegrityProcessor } from './integrity.processor';

describe('IntegrityProcessor', () => {
  let processor: IntegrityProcessor;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      providers: [
        IntegrityProcessor,
        {
          provide: CustomLoggerService,
          useValue: CustomLoggerServiceMock,
        },
      ],
    }).compile();

    processor = app.get<IntegrityProcessor>(IntegrityProcessor);
  });

  it('should create', () => {
    expect(processor).toBeFalsy();
  });
});
