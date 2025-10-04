import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import {
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { AuthResponse, LogedUser } from '../models/auth.model';
import { environment } from '../../environments/environment';

// Helper function to mock localStorage. It's called before each test context.
const mockLocalStorage = () => {
  let store: { [key: string]: string } = {};
  const mock = {
    getItem: (key: string): string | null => (key in store ? store[key] : null),
    setItem: (key: string, value: string) => {
      store[key] = `${value}`;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };

  jest.spyOn(Storage.prototype, 'getItem').mockImplementation(mock.getItem);
  jest.spyOn(Storage.prototype, 'setItem').mockImplementation(mock.setItem);
  jest
    .spyOn(Storage.prototype, 'removeItem')
    .mockImplementation(mock.removeItem);
  jest.spyOn(Storage.prototype, 'clear').mockImplementation(mock.clear);
};

// --- Main Test Suite for AuthService ---
describe('AuthService', () => {
  // ===================================================================================
  // CONTEXT 1: The service is initialized when NO user is logged in.
  // This is the most common scenario for tests like login, failed login, etc.
  // ===================================================================================
  describe('when initialized with no tokens in localStorage', () => {
    let service: AuthService;
    let httpTestingController: HttpTestingController;
    let router: Router;

    beforeEach(() => {
      mockLocalStorage(); // Ensure storage is empty and mocked

      TestBed.configureTestingModule({
        providers: [
          provideHttpClient(withInterceptorsFromDi()),
          provideHttpClientTesting(),
          AuthService,
          { provide: Router, useValue: { navigate: jest.fn() } },
        ],
      });

      // Inject services. The AuthService constructor runs here with empty localStorage.
      httpTestingController = TestBed.inject(HttpTestingController);
      router = TestBed.inject(Router);
      service = TestBed.inject(AuthService);
    });

    afterEach(() => {
      httpTestingController.verify(); // Verify no outstanding HTTP requests
      jest.restoreAllMocks(); // Clean up spies
    });

    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should initialize with logged-out state', () => {
      expect(service.isLoggedIn()).toBe(false);
      expect(service.logedUser()).toBeNull();
    });

    it('should return false for #hasRole when no user is logged in', () => {
      expect(service.hasRole('admin')).toBe(false);
    });

    describe('#login', () => {
      it('should authenticate user, save tokens, and update signals on success', () => {
        const mockCredentials = {
          email: 'test@test.com',
          password: 'password',
        };
        const mockApiResponse: AuthResponse = {
          id: 1,
          username: 'testuser',
          email: 'test@test.com',
          firstName: 'John',
          lastName: 'Doe',
          gender: 'male',
          image: 'path/to/image.jpg',
          accessToken: 'fake-access-token-123',
          refreshToken: 'fake-refresh-token-456',
        };
        const expectedSavedUser: LogedUser = {
          firstName: 'John',
          lastName: 'Doe',
          image: 'path/to/image.jpg',
          roles: ['admin'],
        };

        service.login(mockCredentials).subscribe();

        const req = httpTestingController.expectOne(
          `${environment.apiUrl}/auth/login`
        );
        expect(req.request.method).toBe('POST');
        req.flush(mockApiResponse);

        expect(service.isLoggedIn()).toBe(true);
        expect(service.logedUser()).toEqual(expectedSavedUser);
        expect(localStorage.getItem('auth_access_token')).toBe(
          mockApiResponse.accessToken
        );
        expect(localStorage.getItem('logged_user')).toBe(
          JSON.stringify(expectedSavedUser)
        );
      });

      it('should not update state on a failed login', () => {
        const mockCredentials = {
          email: 'test@test.com',
          password: 'password',
        };
        service
          .login(mockCredentials)
          .subscribe({ error: (err) => expect(err).toBeTruthy() });

        const req = httpTestingController.expectOne(
          `${environment.apiUrl}/auth/login`
        );
        req.flush(null, { status: 401, statusText: 'Unauthorized' });

        expect(service.isLoggedIn()).toBe(false);
        expect(service.logedUser()).toBeNull();
        expect(localStorage.getItem('auth_access_token')).toBeNull();
      });
    });
  });

  // ===================================================================================
  // CONTEXT 2: The service is initialized when a user IS already logged in.
  // This tests the constructor's ability to restore state from localStorage.
  // ===================================================================================
  describe('when initialized with tokens in localStorage', () => {
    let service: AuthService;
    let router: Router;
    const mockUser: LogedUser = {
      firstName: 'Jane',
      lastName: 'Doe',
      image: 'jane.jpg',
      roles: ['viewer'],
    };

    beforeEach(() => {
      mockLocalStorage();
      // ARRANGE: Set up localStorage BEFORE the service is created/injected.
      localStorage.setItem('auth_access_token', 'existing-token');
      localStorage.setItem('logged_user', JSON.stringify(mockUser));

      TestBed.configureTestingModule({
        providers: [
          provideHttpClient(withInterceptorsFromDi()),
          provideHttpClientTesting(),
          AuthService,
          { provide: Router, useValue: { navigate: jest.fn() } },
        ],
      });

      // ACT: Inject the service, which triggers its constructor to read the mock localStorage.
      router = TestBed.inject(Router);
      service = TestBed.inject(AuthService);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should initialize with logged-in state', () => {
      expect(service.isLoggedIn()).toBe(true);
      expect(service.logedUser()).toEqual(mockUser);
    });

    describe('#logout', () => {
      it('should clear all tokens/user data, reset signals, and navigate to login', () => {
        // Act
        service.logout();

        // Assert
        expect(service.isLoggedIn()).toBe(false);
        expect(service.logedUser()).toBeNull();
        expect(localStorage.getItem('auth_access_token')).toBeNull();
        expect(localStorage.getItem('auth_refresh_token')).toBeNull();
        expect(localStorage.getItem('logged_user')).toBeNull();
        expect(router.navigate).toHaveBeenCalledWith(['/login']);
      });
    });

    describe('#hasRole', () => {
      it('should return true if the user has the specified role', () => {
        // The user from beforeEach has the 'viewer' role
        expect(service.hasRole('viewer')).toBe(true);
      });

      it('should return false if the user does not have the specified role', () => {
        // The user from beforeEach does NOT have the 'admin' role
        expect(service.hasRole('admin')).toBe(false);
      });
    });
  });
});
