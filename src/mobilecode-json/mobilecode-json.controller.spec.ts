import { Test, TestingModule } from '@nestjs/testing';
import { MobilecodeJsonController } from './mobilecode-json.controller';

describe('MobilecodeJsonController', () => {
  let controller: MobilecodeJsonController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MobilecodeJsonController],
    }).compile();

    controller = module.get<MobilecodeJsonController>(MobilecodeJsonController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
