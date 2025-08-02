import { Test, TestingModule } from '@nestjs/testing';
import { ConfigJsonController } from './config-json.controller';

describe('ConfigJsonController', () => {
  let controller: ConfigJsonController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConfigJsonController],
    }).compile();

    controller = module.get<ConfigJsonController>(ConfigJsonController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
