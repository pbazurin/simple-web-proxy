import { Injectable } from '@nestjs/common';

@Injectable()
export class UtilsService {
  removeTrailingSlashes(url: string): string {
    return url.replace(/\/$/, '');
  }
}
