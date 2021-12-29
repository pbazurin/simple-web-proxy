import { Test, TestingModule } from '@nestjs/testing';
import { CustomLoggerService } from '../services/custom-logger.service';
import { CustomLoggerServiceMock } from '../services/custom-logger.service.mock';
import { ProxyRepository } from './proxy.repository';

describe('ProxyRepository', () => {
  let repository: ProxyRepository;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      providers: [
        ProxyRepository,
        {
          provide: CustomLoggerService,
          useValue: CustomLoggerServiceMock,
        },
      ],
    }).compile();

    repository = app.get<ProxyRepository>(ProxyRepository);
  });

  it('should create', () => {
    // Assert
    expect(repository).toBeTruthy();
  });
});
