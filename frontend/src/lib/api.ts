import axios from 'axios';
import { AuthResponse, LoginCredentials, RegisterCredentials } from '../types/auth';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

// Add interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const response = await api.post<{ accessToken: string }>('/auth/refresh');
        const { accessToken } = response.data;
        
        // Update the token in localStorage
        localStorage.setItem('accessToken', accessToken);
        
        // Update the original request with the new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, redirect to login
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  register: (credentials: RegisterCredentials) =>
    api.post<AuthResponse>('/auth/register', credentials),

  login: (credentials: LoginCredentials) =>
    api.post<AuthResponse>('/auth/login', credentials),

  logout: () => api.post('/auth/logout'),

  getProtectedData: () => api.get('/auth/protected'),

  // Password Reset Methods
  forgotPassword: (email: string) => 
    api.post('/password/forgot', { email }),

  resetPassword: (data: { token: string; newPassword: string }) => 
    api.post('/password/reset', data)
};

export const profileApi = {
  // Profile Management
  updateProfile: (profileData: any) => 
    api.patch('/profile', profileData),

  uploadProfilePicture: (file: File) => {
    const formData = new FormData();
    formData.append('profilePicture', file);
    return api.post('/profile/picture', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  changePassword: (passwordData: { 
    currentPassword: string; 
    newPassword: string 
  }) => api.post('/profile/change-password', passwordData),

  // Two-Factor Authentication Methods
  initiate2FA: () => 
    api.post('/2fa/setup'),

  verify2FA: (token: string) => 
    api.post('/2fa/verify', { token }),

  disable2FA: (token: string) => 
    api.post('/2fa/disable', { token })
};

export const adminApi = {
  // Admin Dashboard Methods
  getStats: () => 
    api.get('/admin/stats'),

  listUsers: (page: number = 1, limit: number = 10) => 
    api.get(`/admin/users?page=${page}&limit=${limit}`),

  updateUserRole: (userId: string, role: string) => 
    api.patch(`/admin/users/${userId}/role`, { role }),

  deactivateUser: (userId: string) => 
    api.patch(`/admin/users/${userId}/deactivate`)
};

export default api;
