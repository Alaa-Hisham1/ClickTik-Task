export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  gender: string;
  image: string;
}

// /auth/login returns the user profile and both tokens in one payload.
export interface AuthSession extends AuthUser {
  accessToken: string;
  refreshToken: string;
}

// /auth/refresh only rotates the tokens — user profile is unchanged.
export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

// used in auth.store.ts
export interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  status: 'idle' | 'loading' | 'error';
  error: string | null;
}