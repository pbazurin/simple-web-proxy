import { HttpService } from '@nestjs/axios';
import { Test, TestingModule } from '@nestjs/testing';
import { of } from 'rxjs';
import { ProxyRepository } from '../repositories/proxy.repository';
import { CustomLoggerService } from './custom-logger.service';
import { AbsoluteUrlProcessor } from './processors/absolute-url.processor';
import { IntegrityProcessor } from './processors/integrity.processor';
import { RelativeUrlProcessor } from './processors/relative-url.processor';
import { StyleUrlProcessor } from './processors/style-url.processor';
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
        CustomLoggerService,
        AbsoluteUrlProcessor,
        RelativeUrlProcessor,
        IntegrityProcessor,
        StyleUrlProcessor,
        {
          provide: HttpService,
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
