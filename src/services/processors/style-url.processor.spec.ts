import { Test, TestingModule } from '@nestjs/testing';
import { CustomLoggerService } from '../custom-logger.service';
import { CustomLoggerServiceMock } from '../custom-logger.service.mock';
import { UtilsService } from '../utils.service';
import { StyleUrlProcessor } from './style-url.processor';

describe('StyleUrlProcessor', () => {
  let processor: StyleUrlProcessor;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      providers: [
        StyleUrlProcessor,
        UtilsService,
        {
          provide: CustomLoggerService,
          useValue: CustomLoggerServiceMock,
        },
      ],
    }).compile();

    processor = app.get<StyleUrlProcessor>(StyleUrlProcessor);
  });

  const testRealUrlProtocol = 'http:';
  const testRealUrlOrigin = testRealUrlProtocol + '//test';
  const testRealUrl = testRealUrlOrigin + '/real/url';
  const generateTestUrl = (url: string) => `proxy>>${url}<<proxy`;
  const testGetProxyUrl = async (url: string) => {
    return Promise.resolve(generateTestUrl(url));
  };

  describe('valid urls', () => {
    const testCases: [string, string][] = [
      [`url(http://t.c/ss)`, `url(${generateTestUrl('http://t.c/ss')})`],
      [
        `
        something url("/here/") and 
        one more here = url('//another.one/url-something') and there <style>.test{background-image:url(dumb.jpeg)}</style>
        `,
        `
        something url(${generateTestUrl(testRealUrlOrigin + '/here/')}) and 
        one more here = url(${generateTestUrl(
          testRealUrlProtocol + '//another.one/url-something',
        )}) and there <style>.test{background-image:url(${generateTestUrl(
          testRealUrlOrigin + '/dumb.jpeg',
        )})}</style>
        `,
      ],
    ];

    test.each(testCases)(
      'given %p, returns %p',
      async (url, expectedResult) => {
        // Act
        const result = await processor.process(
          url,
          testRealUrl,
          testGetProxyUrl,
        );

        // Assert
        expect(result).toEqual(expectedResult);
      },
    );
  });

  describe('invalid urls', () => {
    const testCases: [string, string][] = [
      ['', ''],
      [`test`, `test`],
      [`http://test`, `http://test`],
      [`url()`, `url()`],
      [`url("incomplete"`, `url("incomplete"`],
    ];

    test.each(testCases)(
      'given %p, returns %p',
      async (url, expectedResult) => {
        // Act
        const result = await processor.process(
          url,
          testRealUrl,
          testGetProxyUrl,
        );

        // Assert
        expect(result).toEqual(expectedResult);
      },
    );
  });

  describe('excluded urls', () => {
    const testCases: [string, string][] = [
      ['url("data:someEncodedImage")', 'url("data:someEncodedImage")'],
    ];

    test.each(testCases)(
      'given %p, returns %p',
      async (url, expectedResult) => {
        // Act
        const result = await processor.process(
          url,
          testRealUrl,
          testGetProxyUrl,
        );

        // Assert
        expect(result).toEqual(expectedResult);
      },
    );
  });
});
