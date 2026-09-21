export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  username: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}
