import { UtilsService } from './utils.service';

describe('UtilsService', () => {
  let service: UtilsService;

  beforeEach(async () => {
    service = new UtilsService();
  });

  describe('removeTrailingSlashes', () => {
    const testCases: [string, string][] = [
      ['', ''],
      ['test', 'test'],
      ['http://test', 'http://test'],
      ['http://test.com/', 'http://test.com'],
    ];

    test.each(testCases)('given %p, returns %p', (url, expectedResult) => {
      // Act
      const result: string = service.removeTrailingSlashes(url);

      // Assert
      expect(result).toEqual(expectedResult);
    });
  });

  describe('removeTrailingQuotes', () => {
    const testCases: [string, string][] = [
      ['', ''],
      [`test`, `test`],
      [`'http://test'`, `http://test`],
      [`"http://test.com/"`, `http://test.com/`],
    ];

    test.each(testCases)('given %p, returns %p', (url, expectedResult) => {
      // Act
      const result: string = service.removeTrailingQuotes(url);

      // Assert
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getProtocolFromUrl', () => {
    const testCases: [string, string][] = [
      ['', ''],
      [`test`, ``],
      [`http://test`, `http:`],
      [`https://some.com/else"`, `https:`],
    ];

    test.each(testCases)('given %p, returns %p', (url, expectedResult) => {
      // Act
      const result: string = service.getProtocolFromUrl(url);

      // Assert
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getOriginFromUrl', () => {
    const testCases: [string, string][] = [
      ['', ''],
      [`test`, ``],
      [`http://test`, `http://test`],
      [`https://some.com/else"`, `https://some.com`],
    ];

    test.each(testCases)('given %p, returns %p', (url, expectedResult) => {
      // Act
      const result: string = service.getOriginFromUrl(url);

      // Assert
      expect(result).toEqual(expectedResult);
    });
  });
});
