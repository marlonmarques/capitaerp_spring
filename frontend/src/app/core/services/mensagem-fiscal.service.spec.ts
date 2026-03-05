import { TestBed } from '@angular/core/testing';

import { MensagemFiscalService } from './mensagem-fiscal.service';

describe('MensagemFiscalService', () => {
  let service: MensagemFiscalService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MensagemFiscalService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
