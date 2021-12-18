import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ProxyRepository {
  private idToContentMap: { [id: string]: string } = {};

  async add(content: string): Promise<string> {
    const newId = uuidv4();

    this.idToContentMap[newId] = content;

    return newId;
  }

  async getById(id: string): Promise<string> {
    const value = this.idToContentMap[id];

    if (!value) {
      throw Error('Item not found');
    }

    return value;
  }
}
