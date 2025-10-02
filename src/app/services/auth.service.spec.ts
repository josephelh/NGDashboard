import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { LogedUser } from '../models/auth.model'; // Make sure LogedUser is imported

// The top-level suite for the entire service
describe('AuthService', () => {
  let service: AuthService;

  // This beforeEach will now apply to ALL nested describe blocks
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        AuthService,
        { provide: Router, useValue: { navigate: jest.fn() } },
      ],
    });
    service = TestBed.inject(AuthService);
  });

  // A simple, top-level test
  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // --- THE NEW #hasRole SUITE ---
  // This is now nested inside the main describe, so it has access to 'service'
  describe('#hasRole', () => {
    it('should return true if the logged-in user has the specified role', () => {
      const adminUser: LogedUser = {
        firstName: 'Admin',
        lastName: 'User',
        image: '',
        roles: ['admin'],
      };
      // 'service' is now correctly defined here
      service.logedUser.set(adminUser);
      const result = (service as any).hasRole('admin');
      expect(result).toBe(true);
    });

    it('should return false if the user does not have the role', () => {
      const basicUser: LogedUser = {
        firstName: 'Basic',
        lastName: 'User',
        image: '',
        roles: ['viewer'],
      };
      service.logedUser.set(basicUser);
      const result = (service as any).hasRole('admin');
      expect(result).toBe(false);
    });
  });
});
