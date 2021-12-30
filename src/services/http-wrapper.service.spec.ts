import { HttpService } from '@nestjs/axios';
import { Test, TestingModule } from '@nestjs/testing';
import { of } from 'rxjs';
import { CustomLoggerService } from './custom-logger.service';
import { CustomLoggerServiceMock } from './custom-logger.service.mock';
import { HttpWrapperService } from './http-wrapper.service';

describe('HttpWrapperService', () => {
  let service: HttpWrapperService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      providers: [
        HttpWrapperService,
        {
          provide: CustomLoggerService,
          useValue: CustomLoggerServiceMock,
        },
        {
          provide: HttpService,
          useValue: {
            get: () => of(null),
          },
        },
      ],
    }).compile();

    service = app.get<HttpWrapperService>(HttpWrapperService);
  });

  it('should create', () => {
    // Assert
    expect(service).toBeTruthy();
  });
});
