import { Injectable } from '@nestjs/common';

@Injectable()
export class UtilsService {
  removeTrailingSlashes(url: string): string {
    return url.replace(/\/$/, '');
  }

  removeTrailingQuotes(url: string): string {
    return url.replace(/^["'](.*)["']$/, '$1');
  }

  getProtocolFromUrl(url: string): string {
    try {
      return new URL(url).protocol;
    } catch {
      return '';
    }
  }

  getOriginFromUrl(url: string): string {
    try {
      return new URL(url).origin;
    } catch {
      return '';
    }
  }
}
