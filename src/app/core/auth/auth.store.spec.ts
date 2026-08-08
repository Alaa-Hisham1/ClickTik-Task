import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import { AuthStorage } from './auth-storage';
import { AuthStore } from './auth.store';

describe('AuthStore', () => {
  let store: InstanceType<typeof AuthStore>;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    store = TestBed.inject(AuthStore);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('starts unauthenticated when storage is empty', () => {
    expect(store.isAuthenticated()).toBe(false);
  });

  it('hydrates from a persisted session on init', () => {
    const seedStorage = TestBed.inject(AuthStorage);
    seedStorage.setAccessToken('persisted-access');
    seedStorage.setRefreshToken('persisted-refresh');

    // Force a fresh store instance so withHooks' onInit reads the seeded storage.
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    const rehydratedStore = TestBed.inject(AuthStore);

    expect(rehydratedStore.isAuthenticated()).toBe(true);
    expect(rehydratedStore.accessToken()).toBe('persisted-access');

    TestBed.inject(HttpTestingController).verify();
  });

  it('stores the session in memory and in storage on a successful login', () => {
    store.login({ username: 'emilys', password: 'emilyspass' });

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/auth/login`);
    req.flush({
      id: 1,
      username: 'emilys',
      email: 'emily@x.com',
      firstName: 'Emily',
      lastName: 'Smith',
      image: '',
      accessToken: 'access-1',
      refreshToken: 'refresh-1',
    });

    expect(store.isAuthenticated()).toBe(true);
    expect(store.accessToken()).toBe('access-1');
    expect(store.error()).toBeNull();

    const authStorage = TestBed.inject(AuthStorage);
    expect(authStorage.getAccessToken()).toBe('access-1');
    expect(authStorage.getRefreshToken()).toBe('refresh-1');
  });

  it('sets an error and stays unauthenticated on a failed login', () => {
    store.login({ username: 'bad', password: 'wrong' });

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/auth/login`);
    req.flush({ message: 'Invalid credentials' }, { status: 400, statusText: 'Bad Request' });

    expect(store.isAuthenticated()).toBe(false);
    expect(store.error()).toBeTruthy();
  });

  it('clears state and storage when a refresh attempt fails', () => {
    const authStorage = TestBed.inject(AuthStorage);
    authStorage.setAccessToken('access-1');
    authStorage.setRefreshToken('stale-refresh');

    // Seed the store's own refreshToken signal too — refresh() reads it from
    // state, not storage, to decide whether there's anything to send.
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    const rehydratedStore = TestBed.inject(AuthStore);
    const rehydratedHttpMock = TestBed.inject(HttpTestingController);

    rehydratedStore.refresh().subscribe((result) => {
      expect(result).toBe(false);
    });

    const req = rehydratedHttpMock.expectOne(`${environment.apiBaseUrl}/auth/refresh`);
    req.flush({ message: 'Invalid refresh token' }, { status: 401, statusText: 'Unauthorized' });

    expect(rehydratedStore.isAuthenticated()).toBe(false);
    expect(rehydratedStore.accessToken()).toBeNull();
    expect(authStorage.getAccessToken()).toBeNull();

    rehydratedHttpMock.verify();
  });
});
