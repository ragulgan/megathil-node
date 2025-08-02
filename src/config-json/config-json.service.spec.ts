import { Test, TestingModule } from '@nestjs/testing';
import { ConfigJsonService } from './config-json.service';

describe('ConfigJsonService', () => {
  let service: ConfigJsonService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConfigJsonService],
    }).compile();

    service = module.get<ConfigJsonService>(ConfigJsonService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
