import { TestBed } from '@angular/core/testing';

import { AuthStorage } from './auth-storage';

describe('AuthStorage', () => {
  let storage: AuthStorage;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    storage = TestBed.inject(AuthStorage);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('has no session by default', () => {
    expect(storage.hasSession()).toBe(false);
    expect(storage.getAccessToken()).toBeNull();
    expect(storage.getRefreshToken()).toBeNull();
  });

  it('stores and retrieves the access token', () => {
    storage.setAccessToken('access-1');
    expect(storage.getAccessToken()).toBe('access-1');
  });

  it('stores and retrieves the refresh token', () => {
    storage.setRefreshToken('refresh-1');
    expect(storage.getRefreshToken()).toBe('refresh-1');
  });

  it('reports a session once an access token is set', () => {
    storage.setAccessToken('access-1');
    expect(storage.hasSession()).toBe(true);
  });

  it('clears both tokens on clearSession', () => {
    storage.setAccessToken('access-1');
    storage.setRefreshToken('refresh-1');

    storage.clearSession();

    expect(storage.getAccessToken()).toBeNull();
    expect(storage.getRefreshToken()).toBeNull();
    expect(storage.hasSession()).toBe(false);
  });
});
