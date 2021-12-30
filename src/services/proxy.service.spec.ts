import { Test, TestingModule } from '@nestjs/testing';
import { of } from 'rxjs';
import { ProxyRepository } from '../repositories/proxy.repository';
import { ContentProcessingManagerService } from './content-processing-manager.service';
import { CustomLoggerService } from './custom-logger.service';
import { CustomLoggerServiceMock } from './custom-logger.service.mock';
import { HttpWrapperService } from './http-wrapper.service';
import { ProxyService } from './proxy.service';
import { UtilsService } from './utils.service';

describe('ProxyService', () => {
  let service: ProxyService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      providers: [
        ProxyService,
        ProxyRepository,
        UtilsService,
        {
          provide: ContentProcessingManagerService,
          useValue: {},
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
  });

  it('should create', () => {
    // Assert
    expect(service).toBeTruthy();
  });
});
