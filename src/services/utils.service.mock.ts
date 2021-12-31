import { UtilsService } from './utils.service';

export const UtilsServiceMock = {
  removeTrailingSlashes: (url: string) => url,
  removeTrailingQuotes: (url: string) => url,
  getProtocolFromUrl: (url: string) => url,
  getOriginFromUrl: (url: string) => url,
} as UtilsService;
