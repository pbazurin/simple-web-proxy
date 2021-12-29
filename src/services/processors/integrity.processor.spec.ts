import { Test, TestingModule } from '@nestjs/testing';
import { CustomLoggerService } from '../custom-logger.service';
import { CustomLoggerServiceMock } from '../custom-logger.service.mock';
import { IntegrityProcessor } from './integrity.processor';

describe('IntegrityProcessor', () => {
  let processor: IntegrityProcessor;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      providers: [
        IntegrityProcessor,
        {
          provide: CustomLoggerService,
          useValue: CustomLoggerServiceMock,
        },
      ],
    }).compile();

    processor = app.get<IntegrityProcessor>(IntegrityProcessor);
  });

  it('should remove integrity attributes', async () => {
    const testContent = `
    <script defer src="https://use.fontawesome.com/releases/v5.1.1/js/solid.js" integrity="sha384-GXi56ipjsBwAe6v5X4xSrVNXGOmpdJYZEEh/0/GqJ3JTHsfDsF8v0YQvZCJYAiGu" crossorigin="anonymous"></script>
    <script defer src="https://use.fontawesome.com/releases/v5.1.1/js/brands.js" integrity="sha384-0inRy4HkP0hJ038ZyfQ4vLl+F4POKbqnaUB6ewmU4dWP0ki8Q27A0VFiVRIpscvL" crossorigin="anonymous"></script>
    <script defer src="https://use.fontawesome.com/releases/v5.1.1/js/fontawesome.js" integrity="sha384-NY6PHjYLP2f+gL3uaVfqUZImmw71ArL9+Roi9o+I4+RBqArA2CfW1sJ1wkABFfPe" crossorigin="anonymous"></script>
    `;
    const expectedContent = `
    <script defer src="https://use.fontawesome.com/releases/v5.1.1/js/solid.js"  crossorigin="anonymous"></script>
    <script defer src="https://use.fontawesome.com/releases/v5.1.1/js/brands.js"  crossorigin="anonymous"></script>
    <script defer src="https://use.fontawesome.com/releases/v5.1.1/js/fontawesome.js"  crossorigin="anonymous"></script>
    `;

    const result = await processor.process(testContent);

    expect(result).toBe(expectedContent);
  });

  it('should remove integrity hashes', async () => {
    const testContent = `
    some.integrity = 'sha384-GXi56ipjsBwAe6v5X4xSrVNXGOmpdJYZEEh/0/GqJ3JTHsfDsF8v0YQvZCJYAiGu';
    another.integrity = "sha384-0inRy4HkP0hJ038ZyfQ4vLl+F4POKbqnaUB6ewmU4dWP0ki8Q27A0VFiVRIpscvL";

    sha384-NY6PHjYLP2f+gL3uaVfqUZImmw71ArL9+Roi9o+I4+RBqArA2CfW1sJ1wkABFfPe
    `;
    const expectedContent = `
    some.integrity = '';
    another.integrity = "";

    
    `;

    const result = await processor.process(testContent);

    expect(result).toBe(expectedContent);
  });
});
