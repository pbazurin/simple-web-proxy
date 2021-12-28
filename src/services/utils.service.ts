import { Injectable } from '@nestjs/common';

@Injectable()
export class UtilsService {
  removeTrailingSlashes(url: string): string {
    return url.replace(/\/$/, '');
  }

  removeTrailingQuotes(url: string): string {
    return url.replace(/^["']|["']$/g, '');
  }

  getProtocolFromUrl(url: string): string {
    return new URL(url).protocol;
  }

  getOriginFromUrl(url: string): string {
    return new URL(url).origin;
  }
}
