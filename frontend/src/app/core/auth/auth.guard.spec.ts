import { TestBed } from '@angular/core/testing';
import { CanActivateFn, Router } from '@angular/router';

import { AdminGuard } from './admin.guard';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';
import { AuthGuard } from './auth.guard';

describe('AdminGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AdminGuard,
        { provide: AuthService, useValue: {} }, // Mock AuthService
        { provide: Router, useValue: {} }, // Mock Router
        { provide: NotificationService, useValue: {} } // Mock NotificationService
      ]
    });
  });

  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => TestBed.inject(AuthGuard).canActivate(...guardParameters));

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
