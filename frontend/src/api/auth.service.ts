import api from './axios';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    subscriptionTier: string;
    planDetails?: {
      creditsRemaining: number;
      planStart: string;
      planEnd: string;
    };
    profilePicture?: string;
  };
}

/**
 * Service for handling authentication operations
 */
const AuthService = {
  /**
   * Login user with email and password
   * @param credentials - Login credentials
   * @returns Auth response with token and user data
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },

  /**
   * Register a new user
   * @param credentials - Registration credentials
   * @returns Auth response with token and user data
   */
  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', credentials);
    return response.data;
  },

  /**
   * Get current user profile
   * @returns User data
   */
  async getCurrentUser() {
    const response = await api.get('/users/me');
    return response.data;
  },

  /**
   * Log out the current user
   */
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  /**
   * Check if user is authenticated
   * @returns true if authenticated, false otherwise
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  },

  /**
   * Refresh user data from server
   * @returns Updated user data
   */
  async refreshUserData() {
    try {
      const response = await api.get('/users/me');
      
      // Update the user in localStorage
      localStorage.setItem('user', JSON.stringify(response.data));
      
      return response.data;
    } catch (error) {
      console.error('Error refreshing user data:', error);
      throw error;
    }
  },

  /**
   * Request password reset
   * @param email - User email
   */
  async requestPasswordReset(email: string) {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  /**
   * Reset password with token
   * @param token - Reset token
   * @param newPassword - New password
   */
  async resetPassword(token: string, newPassword: string) {
    const response = await api.post('/auth/reset-password', {
      token,
      password: newPassword
    });
    return response.data;
  }
};

export default AuthService; 