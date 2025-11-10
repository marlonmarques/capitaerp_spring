import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MainLayoutComponent } from './main-layout.component';
import { Router, NavigationEnd } from '@angular/router';
import { NgZorroModule } from '../../shared/ng-zorro.module';
import { AuthService } from '../../core/services/auth.service';
import { of, Subject } from 'rxjs';
import { User } from '../../core/auth/models/user.model';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('MainLayoutComponent', () => {
  let component: MainLayoutComponent;
  let fixture: ComponentFixture<MainLayoutComponent>;
  let authService: AuthService;
  let router: Router;
  let routerEventsSubject: Subject<NavigationEnd>;

  const mockUser: User = {
    id: 1, email: 'test@test.com', roles: ['ROLE_USER'],
    firstName: '',
    lastName: ''
  };
  const mockAdmin: User = {
    id: 2, email: 'admin@test.com', roles: ['ROLE_ADMIN'],
    firstName: '',
    lastName: ''
  };

  beforeEach(async () => {
    routerEventsSubject = new Subject<NavigationEnd>();

    const authServiceMock = {
      currentUser$: of(mockUser),
      hasAnyRole: (roles: string[]) => roles.includes('ROLE_USER'),
      logout: jasmine.createSpy('logout')
    };

    TestBed.configureTestingModule({
      imports: [
        NgZorroModule,
        NoopAnimationsModule,
        RouterTestingModule,
        HttpClientTestingModule
      ],
      declarations: [MainLayoutComponent],
      providers: [
        { provide: AuthService, useValue: authServiceMock }
      ]
    });

    // We need to override the router events for testing purposes
    router = TestBed.inject(Router);
    Object.defineProperty(router, 'events', {
      get: () => routerEventsSubject.asObservable()
    });

    fixture = TestBed.createComponent(MainLayoutComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should set up breadcrumb and user on initialization', () => {
      const setupBreadcrumbSpy = spyOn(component as any, 'setupBreadcrumb');
      const setupUserSpy = spyOn(component as any, 'setupUser');
      component.ngOnInit();
      expect(setupBreadcrumbSpy).toHaveBeenCalled();
      expect(setupUserSpy).toHaveBeenCalled();
    });

    it('should set currentUser from AuthService', () => {
      fixture.detectChanges(); // triggers ngOnInit
      expect(component.currentUser).toEqual(mockUser);
    });
  });

  describe('Breadcrumb', () => {
    it('should update breadcrumb on /products route', () => {
      // Simula a URL antes de chamar updateBreadcrumb
      Object.defineProperty(router, 'url', { value: '/products' });

      // Chama diretamente o método que atualiza o breadcrumb
      (component as any).updateBreadcrumb();

      expect(component.breadcrumbItems).toEqual([
        { label: 'Dashboard', link: '/dashboard' },
        { label: 'Produtos' }
      ]);
    });
  });


  describe('logout', () => {
    it('should call authService.logout when logout is called', () => {
      component.logout();
      expect(authService.logout).toHaveBeenCalled();
    });
  });
});
