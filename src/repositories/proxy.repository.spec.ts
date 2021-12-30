import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CustomLoggerService } from '../services/custom-logger.service';
import { CustomLoggerServiceMock } from '../services/custom-logger.service.mock';
import { ProxyRepository } from './proxy.repository';

describe('ProxyRepository', () => {
  let repository: ProxyRepository;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      providers: [
        ProxyRepository,
        {
          provide: CustomLoggerService,
          useValue: CustomLoggerServiceMock,
        },
      ],
    }).compile();

    repository = app.get<ProxyRepository>(ProxyRepository);
  });

  it('should generate new id on add', async () => {
    // Arrange
    const testValue = 'some test value';

    // Act
    const result = await repository.add(testValue);

    // Assert
    expect(result).toBeTruthy();
  });

  describe('isValidIdFormat', () => {
    const testCases: [string, boolean][] = [
      [`7980bf6b-bf9b-5376-b0b4-baef6b1aa354`, true],
      [`7980bf6b-bf9b-5376-b0b4-baef6`, false],
      [`test`, false],
      [`7980bf6b-bf9b-5376-b0b4-zaef6b1aa354`, false],
    ];

    test.each(testCases)('given %p, returns %p', async (id, expectedResult) => {
      // Act
      const result = await repository.isValidIdFormat(id);

      // Assert
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getById', () => {
    it('should throw BadRequestException on invalid id', async () => {
      // Arrange
      const invalidId = 'some test id';

      // Assert
      await expect(
        async () => await repository.getById(invalidId),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException on unknown id', async () => {
      // Arrange
      const invalidId = '7980bf6b-bf9b-5376-b0b4-baef6b1aa354';

      // Assert
      await expect(
        async () => await repository.getById(invalidId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should get the same value as it was added', async () => {
      // Arrange
      const testValue = 'some text content';
      const id = await repository.add(testValue);

      // Act
      const result = await repository.getById(id);

      // Assert
      expect(result).toBe(testValue);
    });
  });
});
