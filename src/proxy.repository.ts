import { Injectable } from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ProxyRepository {
  private idToContentMap: { [id: string]: string } = {};

  add(content: string): Observable<string> {
    const newId = uuidv4();

    this.idToContentMap[newId] = content;

    return of(newId);
  }

  getById(id: string): Observable<string> {
    const value = this.idToContentMap[id];

    if (!value) {
      throw Error('Item not found');
    }

    return of(value);
  }
}
