// Authentication utilities
import { apiClient } from './api';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role_id: string;
  team_id?: string;
  is_active: boolean;
}

// Store authentication token
export function setAuthToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_token', token);
  }
}

// Get authentication token
export function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token');
  }
  return null;
}

// Remove authentication token
export function removeAuthToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('current_user');
  }
}

// Check if user is authenticated
export function isAuthenticated(): boolean {
  return !!getAuthToken();
}

// Login function
export async function login(email: string, password: string): Promise<User> {
  try {
    const response = await apiClient.login(email, password);
    setAuthToken(response.access_token);
    
    // Fetch current user info
    const user = await apiClient.getCurrentUser();
    if (typeof window !== 'undefined') {
      localStorage.setItem('current_user', JSON.stringify(user));
    }
    
    return user;
  } catch (error) {
    removeAuthToken();
    throw error;
  }
}

// Logout function
export function logout(): void {
  removeAuthToken();
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
}

// Get current user from localStorage
export function getCurrentUser(): User | null {
  if (typeof window !== 'undefined') {
    const userStr = localStorage.getItem('current_user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
  }
  return null;
}

// Verify current user with backend
export async function verifyAuth(): Promise<User | null> {
  if (!isAuthenticated()) {
    return null;
  }

  try {
    const user = await apiClient.getCurrentUser();
    if (typeof window !== 'undefined') {
      localStorage.setItem('current_user', JSON.stringify(user));
    }
    return user;
  } catch (error) {
    removeAuthToken();
    return null;
  }
}
