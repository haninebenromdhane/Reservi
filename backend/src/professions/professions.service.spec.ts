import { ProfessionsService } from './professions.service';

describe('ProfessionsService', () => {
  it('should be defined', () => {
    const service = new ProfessionsService({} as never);
    expect(service).toBeDefined();
  });
});