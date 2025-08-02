import { Test, TestingModule } from '@nestjs/testing';
import { ProcessAudioController } from './processAudio.controller';

describe('ProcessAudioController', () => {
  let controller: ProcessAudioController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProcessAudioController],
    }).compile();

    controller = module.get<ProcessAudioController>(ProcessAudioController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
