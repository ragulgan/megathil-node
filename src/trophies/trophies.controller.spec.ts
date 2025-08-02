import { Test, TestingModule } from '@nestjs/testing';
import { TrophiesController } from './trophies.controller';

describe('TrophiesController', () => {
  let controller: TrophiesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TrophiesController],
    }).compile();

    controller = module.get<TrophiesController>(TrophiesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
