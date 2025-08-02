import { Test, TestingModule } from '@nestjs/testing';
import { MobilecodeJsonService } from './mobilecode-json.service';

describe('MobilecodeJsonService', () => {
  let service: MobilecodeJsonService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MobilecodeJsonService],
    }).compile();

    service = module.get<MobilecodeJsonService>(MobilecodeJsonService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
