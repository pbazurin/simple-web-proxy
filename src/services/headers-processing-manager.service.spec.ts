import { Test, TestingModule } from '@nestjs/testing';
import { HeadersProcessingManager } from './headers-processing-manager.service';

describe('HeadersProcessingManager', () => {
  let service: HeadersProcessingManager;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      providers: [HeadersProcessingManager],
    }).compile();

    service = app.get<HeadersProcessingManager>(HeadersProcessingManager);
  });

  describe('processRequestHeaders', () => {
    it(`should change 'accept-encoding' header`, () => {
      // Arrange
      const testHeaders: Record<string, string | string[]> = {
        header1: 'value1',
        header2: 'value2',
        'accept-encoding': 'something',
      };

      // Act
      const result: Record<string, string | string[]> =
        service.processRequestHeaders(testHeaders);

      // Assert
      expect(Object.keys(result)).toEqual(Object.keys(testHeaders));
      expect(result['header1']).toBe(testHeaders['header1']);
      expect(result['header2']).toBe(testHeaders['header2']);
      expect(result['accept-encoding']).toBe('gzip, deflate');
    });

    it(`should remove excluded headers`, () => {
      // Arrange
      const testHeaders: Record<string, string | string[]> = {
        header1: 'value1',
        host: 'testHost',
        referer: 'testReferer',
        'user-agent': 'testUserAgent',
      };

      // Act
      const result: Record<string, string | string[]> =
        service.processRequestHeaders(testHeaders);

      // Assert
      const resultKeys: string[] = Object.keys(result);

      expect(resultKeys).not.toContain('host');
      expect(resultKeys).not.toContain('referer');
      expect(resultKeys).not.toContain('user-agent');
      expect(result['header1']).toBe(testHeaders['header1']);
    });
  });

  describe('processResponseHeaders', () => {
    it('should return headers without any changes', () => {
      // Arrange
      const testHeaders: Record<string, string | string[]> = {
        header1: 'value1',
        header2: 'value2',
      };

      // Act
      const result: Record<string, string | string[]> =
        service.processResponseHeaders(testHeaders);

      // Assert
      expect(result).toBe(testHeaders);
    });
  });
});
