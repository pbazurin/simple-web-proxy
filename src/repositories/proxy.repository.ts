import { Injectable } from '@nestjs/common';
import { CustomLoggerService } from 'src/services/custom-logger.service';
import { v5 as uuidv5, validate as uuidValidate } from 'uuid';

@Injectable()
export class ProxyRepository {
  private idToContentMap: { [id: string]: string } = {};

  constructor(private loggerService: CustomLoggerService) {
    this.loggerService.setContext(ProxyRepository.name);
  }

  isValidIdFormat(id: string): boolean {
    return uuidValidate(id);
  }

  async add(value: string): Promise<string> {
    const newId = uuidv5(value, uuidv5.URL);

    this.loggerService.log(`generated id "${newId}" for "${value}"`);

    this.idToContentMap[newId] = value;

    return newId;
  }

  async getById(id: string): Promise<string> {
    if (!this.isValidIdFormat(id)) {
      throw new Error(`Invalid id format "${id}"`);
    }

    const value = this.idToContentMap[id];

    if (!value) {
      throw Error(`Item with id "${id}" not found`);
    }

    return value;
  }
}
