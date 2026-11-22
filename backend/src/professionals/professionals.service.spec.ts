import { ProfessionalsService } from './professionals.service';

describe('ProfessionalsService', () => {
  it('should be defined', () => {
    const service = new ProfessionalsService(
      {} as never,
      {} as never,
      {} as never,
    );
    expect(service).toBeDefined();
  });
})