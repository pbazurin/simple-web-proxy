import { Test, TestingModule } from '@nestjs/testing';
import { CustomLoggerService } from '../services/custom-logger.service';
import { CustomLoggerServiceMock } from '../services/custom-logger.service.mock';
import { ProxyService } from '../services/proxy.service';
import { ProxyController } from './proxy.controller';

describe('ProxyController', () => {
  let controller: ProxyController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      providers: [
        ProxyController,
        {
          provide: ProxyService,
          useValue: {},
        },
        {
          provide: CustomLoggerService,
          useValue: CustomLoggerServiceMock,
        },
      ],
    }).compile();

    controller = app.get<ProxyController>(ProxyController);
  });

  it('should create', () => {
    // Assert
    expect(controller).toBeTruthy();
  });
});
