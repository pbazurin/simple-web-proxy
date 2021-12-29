import { Test, TestingModule } from '@nestjs/testing';
import { CustomLoggerService } from '../custom-logger.service';
import { CustomLoggerServiceMock } from '../custom-logger.service.mock';
import { UtilsService } from '../utils.service';
import { RelativeUrlProcessor } from './relative-url.processor';

describe('RelativeUrlProcessor', () => {
  let processor: RelativeUrlProcessor;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      providers: [
        RelativeUrlProcessor,
        UtilsService,
        {
          provide: CustomLoggerService,
          useValue: CustomLoggerServiceMock,
        },
      ],
    }).compile();

    processor = app.get<RelativeUrlProcessor>(RelativeUrlProcessor);
  });

  const testRealUrlProtocol = 'http:';
  const testRealUrlOrigin = testRealUrlProtocol + '//test';
  const testRealUrl = testRealUrlOrigin + '/real/url';
  const generateTestUrl = (url: string) => `proxy>>${url}<<proxy`;
  const testGetProxyUrl = async (url: string) => {
    return Promise.resolve(generateTestUrl(url));
  };

  describe('valid relative urls', () => {
    const testCases: [string, string][] = [
      [`"/t.c/ss"`, `${generateTestUrl(testRealUrlOrigin + '/t.c/ss')}`],
      [
        `something "/here.com" and one more here = "/another.one/url/"`,
        `something ${generateTestUrl(
          testRealUrlOrigin + '/here.com',
        )} and one more here = ${generateTestUrl(
          testRealUrlOrigin + '/another.one/url/',
        )}`,
      ],
      [
        `
        something "/here.com/" and 
        one more here = "/another.one/url-something"
        `,
        `
        something ${generateTestUrl(testRealUrlOrigin + '/here.com/')} and 
        one more here = ${generateTestUrl(
          testRealUrlOrigin + '/another.one/url-something',
        )}
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

  describe('valid urls without protocol', () => {
    const testCases: [string, string][] = [
      [
        `"//some.url"`,
        `${generateTestUrl(testRealUrlProtocol + '//some.url')}`,
      ],
      [
        `something "//here.com" and one more here = "//another.one/url/"`,
        `something ${generateTestUrl(
          testRealUrlProtocol + '//here.com',
        )} and one more here = ${generateTestUrl(
          testRealUrlProtocol + '//another.one/url/',
        )}`,
      ],
      [
        `
        something "//here.com/" and 
        one more here = "//another.one/url-something"
        `,
        `
        something ${generateTestUrl(testRealUrlProtocol + '//here.com/')} and 
        one more here = ${generateTestUrl(
          testRealUrlProtocol + '//another.one/url-something',
        )}
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
      [`"/ test.com"`, `"/ test.com"`],
      [`(/some.url/here)`, `(/some.url/here)`],
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
