// Authentication and User types

export type OAuthProvider = "google" | "twitch" | "email";

export interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  oauthProvider?: OAuthProvider;
  createdAt: string;
  updatedAt?: string;
}

// export interface AuthTokens {
//   token: string;
//   refreshToken?: string;
// }

export interface AuthResponse {
  user?: User;
  token?: string;
  message?: string;
  requiresVerification?: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
}

export interface OAuthCallbackData {
  token: string;
  user: string; // JSON string
}

export interface AuthError {
  message: string;
  code?: string;
}

export interface ValidateTokenRequest {
  token: string;
}

// export interface ValidateTokenResponse {
//   user: User;
// }

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}
