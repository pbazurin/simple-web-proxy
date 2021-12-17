import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { ProxyRepository } from './proxy.repository';

@Injectable()
export class ProxyService {
  constructor(
    private proxyRepository: ProxyRepository,
    private httpService: HttpService,
  ) {}

  generateProxyId(url: string): string {
    const proxyId = uuidv4();

    this.proxyRepository.add(proxyId, url);

    return proxyId;
  }

  getContentByProxyId(proxyId: string): Observable<string> {
    const url = this.proxyRepository.getById(proxyId);

    return this.httpService.get<string>(url).pipe(
      map((res) => {
        return res.data;
      }),
    );
  }
}
