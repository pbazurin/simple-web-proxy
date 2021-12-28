import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { v5 as uuidv5, validate as uuidValidate } from 'uuid';
import { CustomLoggerService } from '../services/custom-logger.service';

@Injectable()
export class ProxyRepository {
  private idToContentMap: { [id: string]: string } = {};

  constructor(private loggerService: CustomLoggerService) {
    loggerService.setContext(ProxyRepository.name);
  }

  isValidIdFormat(id: string): boolean {
    return uuidValidate(id);
  }

  async add(value: string): Promise<string> {
    const newId = uuidv5(value, uuidv5.URL);

    this.loggerService.log(`Generated id "${newId}" for "${value}"`);

    this.idToContentMap[newId] = value;

    return newId;
  }

  async getById(id: string): Promise<string> {
    if (!this.isValidIdFormat(id)) {
      throw new BadRequestException(`Invalid id format "${id}"`);
    }

    const value = this.idToContentMap[id];

    if (!value) {
      throw new NotFoundException(`Item with "${id}" doesn't exist`);
    }

    return value;
  }
}
