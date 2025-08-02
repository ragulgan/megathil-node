import { Test, TestingModule } from '@nestjs/testing';
import { MegathilPointsService } from './megathil-points.service';

describe('MegathilPointsService', () => {
  let service: MegathilPointsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MegathilPointsService],
    }).compile();

    service = module.get<MegathilPointsService>(MegathilPointsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
