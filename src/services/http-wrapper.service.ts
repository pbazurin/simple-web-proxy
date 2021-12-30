import { HttpService } from '@nestjs/axios';
import {
  BadRequestException,
  Injectable,
  RequestTimeoutException,
} from '@nestjs/common';
import { AxiosRequestHeaders, AxiosResponse } from 'axios';
import { catchError, firstValueFrom, throwError } from 'rxjs';
import { CustomLoggerService } from './custom-logger.service';

@Injectable()
export class HttpWrapperService {
  private readonly timeoutTimerMs = 5000;

  constructor(
    private loggerService: CustomLoggerService,
    private httpService: HttpService,
  ) {
    loggerService.setContext(HttpWrapperService.name);
  }

  async get(url: string, headers: AxiosRequestHeaders): Promise<AxiosResponse> {
    this.loggerService.log(`Requesting url "${url}"...`);

    const response = await firstValueFrom(
      this.httpService
        .get<string>(url, {
          headers: headers,
          responseType: 'arraybuffer',
          timeout: this.timeoutTimerMs,
          validateStatus: (status: number) => status < 500,
        })
        .pipe(
          catchError((originalError: Error) => {
            let error = new BadRequestException(
              `Failed to request url "${url}"`,
            );
            if (originalError.message.includes('timeout')) {
              error = new RequestTimeoutException(
                `Timeout for url "${url}" with timer ${this.timeoutTimerMs}ms`,
              );
            }

            return throwError(() => error);
          }),
        ),
    );

    this.loggerService.log(`Received response for url "${url}"`);

    return response;
  }
}
