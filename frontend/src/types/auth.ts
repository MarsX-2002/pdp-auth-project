export interface User {
  id: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
  firstName?: string;
  lastName?: string;
  profilePicture?: string;
  bio?: string;
  twoFactorEnabled: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  accessToken: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  username: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirmRequest {
  token: string;
  newPassword: string;
}

export interface ProfileUpdateRequest {
  firstName?: string;
  lastName?: string;
  bio?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface TwoFactorSetupResponse {
  qrCodeUrl: string;
}

export interface AdminUserStats {
  totalUsers: number;
  activeUsers: number;
  adminUsers: number;
  recentUsers: Array<User>;
}

export interface PaginatedUserList {
  users: User[];
  currentPage: number;
  totalPages: number;
  totalUsers: number;
}
