import { UtilsService } from './utils.service';

describe('UtilsService', () => {
  let service: UtilsService;

  beforeEach(async () => {
    service = new UtilsService();
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });
});
