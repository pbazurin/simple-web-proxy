import { Injectable } from '@nestjs/common';

@Injectable()
export class HeadersProcessingManager {
  processRequestHeaders(
    requestHeaders: Record<string, string | string[]>,
  ): Record<string, string | string[]> {
    const excludedHeaderNames = ['host', 'referer', 'user-agent'];
    const result: Record<string, string | string[]> = {};

    Object.keys(requestHeaders).forEach((headerName: string) => {
      if (!excludedHeaderNames.includes(headerName)) {
        result[headerName] = requestHeaders[headerName];
      }
    });

    result['accept-encoding'] = 'gzip, deflate';

    return result;
  }

  processResponseHeaders(
    responseHeaders: Record<string, string | string[]>,
  ): Record<string, string | string[]> {
    return responseHeaders;
  }
}
