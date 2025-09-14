import { buildApiUrl, API_CONFIG } from '@/config/api';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: {
    id: number;
    username: string;
    email: string;
    role: 'admin' | 'teacher' | 'student';
    name: string;
    // Add other user fields as needed
  };
}

export interface ApiError {
  detail: string;
  message?: string;
}

class AuthService {
  private async makeRequest<T>(
    url: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const defaultHeaders = {
      'Content-Type': 'application/json',
    };

    // Add auth token if available
    const token = localStorage.getItem('access_token');
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData: ApiError = await response.json();
        throw new Error(errorData.detail || errorData.message || 'API request failed');
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error');
    }
  }

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const url = buildApiUrl(API_CONFIG.ENDPOINTS.AUTH.LOGIN);
    
    const response = await this.makeRequest<LoginResponse>(url, {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    // Store tokens
    localStorage.setItem('access_token', response.access_token);
    localStorage.setItem('refresh_token', response.refresh_token);

    return response;
  }

  async logout(): Promise<void> {
    const url = buildApiUrl(API_CONFIG.ENDPOINTS.AUTH.LOGOUT);
    
    try {
      await this.makeRequest(url, {
        method: 'POST',
      });
    } catch (error) {
      // Even if logout API fails, clear local storage
      console.warn('Logout API failed, clearing local storage:', error);
    } finally {
      // Always clear local storage
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
    }
  }

  async refreshToken(): Promise<LoginResponse> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const url = buildApiUrl(API_CONFIG.ENDPOINTS.AUTH.REFRESH);
    
    const response = await this.makeRequest<LoginResponse>(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${refreshToken}`,
      },
    });

    // Update tokens
    localStorage.setItem('access_token', response.access_token);
    localStorage.setItem('refresh_token', response.refresh_token);

    return response;
  }

  async getProfile(): Promise<LoginResponse['user']> {
    const url = buildApiUrl(API_CONFIG.ENDPOINTS.AUTH.PROFILE);
    
    return await this.makeRequest<LoginResponse['user']>(url, {
      method: 'GET',
    });
  }

  // Helper method to check if user is authenticated
  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  }

  // Helper method to get current token
  getToken(): string | null {
    return localStorage.getItem('access_token');
  }
}

export const authService = new AuthService(); 