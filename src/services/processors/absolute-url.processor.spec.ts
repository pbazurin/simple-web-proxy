import { Test, TestingModule } from '@nestjs/testing';
import { CustomLoggerService } from '../custom-logger.service';
import { CustomLoggerServiceMock } from '../custom-logger.service.mock';
import { AbsoluteUrlProcessor } from './absolute-url.processor';

describe('AbsoluteUrlProcessor', () => {
  let processor: AbsoluteUrlProcessor;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      providers: [
        AbsoluteUrlProcessor,
        {
          provide: CustomLoggerService,
          useValue: CustomLoggerServiceMock,
        },
      ],
    }).compile();

    processor = app.get<AbsoluteUrlProcessor>(AbsoluteUrlProcessor);
  });

  const testRealUrl = 'http://test/real/url';
  const generateTestUrl = (url: string) => `proxy>>${url}<<proxy`;
  const testGetProxyUrl = async (url: string) => {
    return Promise.resolve(generateTestUrl(url));
  };

  describe('valid urls', () => {
    const testCases: [string, string][] = [
      [`http://t.c/ss`, `${generateTestUrl('http://t.c/ss')}`],
      [
        `something https://here.com and one more here = "http://another.one/url/"`,
        `something ${generateTestUrl(
          'https://here.com',
        )} and one more here = "${generateTestUrl('http://another.one/url/')}"`,
      ],
      [
        `
        something https://here.com/ and 
        one more here = "http://another.one/url-something"
        `,
        `
        something ${generateTestUrl('https://here.com/')} and 
        one more here = "${generateTestUrl('http://another.one/url-something')}"
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
      [`http:/test`, `http:/test`],
      [`htt ps://some. com/else"`, `htt ps://some. com/else"`],
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
      ['http://www.w3.org/2000/svg', 'http://www.w3.org/2000/svg'],
      [
        `http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd`,
        `http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd`,
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
});
