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
    return url.split(':')[0];
  }
}
