import { Test, TestingModule } from '@nestjs/testing';
import { MegathilPointsController } from './megathil-points.controller';

describe('MegathilPointsController', () => {
  let controller: MegathilPointsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MegathilPointsController],
    }).compile();

    controller = module.get<MegathilPointsController>(MegathilPointsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
