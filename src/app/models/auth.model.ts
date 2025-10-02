export interface AuthResponse {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  gender: string;
  image: string;
  accessToken: string; // The API provides this directly
  refreshToken: string; // The API provides this directly
}

export interface LogedUser {
  firstName: string;
  lastName: string;
  image: string;
  roles?: string[];
}

// NEW: Model for the refresh token API response
export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}
