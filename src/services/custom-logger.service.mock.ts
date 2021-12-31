import { CustomLoggerService } from './custom-logger.service';

export const CustomLoggerServiceMock = {
  log: (message: any) => (message ? null : undefined),
  warn: (message: any) => (message ? null : undefined),
  setContext: (content: any) => (content ? null : undefined),
} as CustomLoggerService;
