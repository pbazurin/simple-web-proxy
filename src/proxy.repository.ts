import { Injectable } from '@nestjs/common';

@Injectable()
export class ProxyRepository {
  private idToContentMap: { [id: string]: string } = {};

  add(id: string, content: string): void {
    this.idToContentMap[id] = content;
  }

  getById(id: string): string {
    const value = this.idToContentMap[id];

    if (!value) {
      throw Error('Item not found');
    }

    return value;
  }
}
