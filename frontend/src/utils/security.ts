import cookie from 'cookie';
import DOMPurify from 'dompurify';
import jwtDecode from 'jwt-decode';

/**
 * Interface for JWT payload structure
 */
interface JwtPayload {
  sub: string;
  email?: string;
  name?: string;
  exp?: number;
  iat?: number;
  permissions?: string[];
  [key: string]: any;
}

/**
 * Security utilities for the application
 */
export const security = {
  /**
   * Sanitizes HTML content to prevent XSS attacks
   * @param html - The HTML content to sanitize
   * @returns Sanitized HTML content
   */
  sanitizeHtml: (html: string): string => {
    if (!html) return '';
    // Type assertion for DOMPurify
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
      ALLOWED_ATTR: ['href', 'target', 'rel']
    });
  },

  /**
   * Validates and sanitizes user input
   * @param input - The user input to validate
   * @returns Sanitized input
   */
  sanitizeInput: (input: string): string => {
    if (!input) return '';
    // Remove any potentially dangerous characters
    return input.replace(/[<>]/g, '');
  },

  /**
   * Extracts JWT token from cookies
   * @returns The JWT token or null if not found
   */
  getTokenFromCookies: (): string | null => {
    if (typeof document === 'undefined') return null;
    
    const cookies = cookie.parse(document.cookie);
    return cookies.token || null;
  },

  /**
   * Decodes JWT token and extracts payload
   * @param token - The JWT token to decode
   * @returns Decoded JWT payload or null if invalid
   */
  decodeToken: (token: string): JwtPayload | null => {
    if (!token) return null;
    
    try {
      const decoded = jwtDecode<JwtPayload>(token);
      return decoded;
    } catch (error) {
      console.error('Failed to decode token:', error);
      return null;
    }
  },

  /**
   * Checks if a token is expired
   * @param token - The JWT token to check
   * @returns True if token is expired, false otherwise
   */
  isTokenExpired: (token: string): boolean => {
    const decoded = security.decodeToken(token);
    if (!decoded || !decoded.exp) return true;
    
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  },

  /**
   * Validates an email address format
   * @param email - The email address to validate
   * @returns True if email is valid, false otherwise
   */
  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * Validates password strength
   * @param password - The password to validate
   * @returns True if password meets strength requirements, false otherwise
   */
  isStrongPassword: (password: string): boolean => {
    // Password must be at least 8 characters long and contain at least one uppercase letter,
    // one lowercase letter, one number, and one special character
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  }
};

/**
 * Validates and sanitizes user input
 */
export const sanitizeInput = (input: string): string => {
  // Remove potentially dangerous characters
  return input.trim().replace(/[<>&]/g, '');
};

/**
 * Validates an email address
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

/**
 * Gets CSRF token from cookies
 * @returns The CSRF token or null if not found
 */
export const getCsrfToken = (): string | null => {
  if (typeof document === 'undefined') return null;
  
  const cookies = cookie.parse(document.cookie);
  return cookies['csrf-token'] || null;
};

/**
 * Adds CSRF token to headers
 */
export const addCsrfHeader = (headers: Record<string, string>): Record<string, string> => {
  const token = getCsrfToken();
  
  if (token) {
    return {
      ...headers,
      'X-CSRF-Token': token,
    };
  }
  
  return headers;
};

/**
 * Validates if a JWT token is valid and not expired
 * @param token - The JWT token to validate
 * @returns True if token is valid, false otherwise
 */
export const isTokenValid = (token: string): boolean => {
  try {
    const decoded = security.decodeToken(token);
    if (!decoded || !decoded.exp) return false;
    
    const currentTime = Math.floor(Date.now() / 1000);
    
    // Check if token is expired
    return decoded.exp > currentTime;
  } catch (error) {
    return false;
  }
};

/**
 * Extract user permissions from JWT token
 * @param token - The JWT token
 * @returns Array of permission strings
 */
export const getUserPermissions = (token: string): string[] => {
  try {
    const decoded = security.decodeToken(token);
    return decoded?.permissions || [];
  } catch (error) {
    return [];
  }
};

/**
 * Checks if the user has the required permission
 */
export const hasPermission = (token: string, requiredPermission: string): boolean => {
  try {
    const permissions = getUserPermissions(token);
    return permissions.includes(requiredPermission);
  } catch (error) {
    return false;
  }
};

/**
 * Content Security Policy violation reporter
 */
export const reportCspViolation = (violation: any): void => {
  if (process.env.NODE_ENV === 'development') {
    console.warn('CSP Violation:', violation);
  } else {
    // In production, send to your monitoring service
    fetch('/api/csp-report', {
      method: 'POST',
      body: JSON.stringify({ violation }),
      headers: {
        'Content-Type': 'application/json',
      },
    }).catch(error => console.error('Error reporting CSP violation:', error));
  }
};

// Add a global listener for CSP violations in the browser
if (typeof window !== 'undefined') {
  document.addEventListener('securitypolicyviolation', (e) => {
    reportCspViolation({
      'violated-directive': e.violatedDirective,
      'effective-directive': e.effectiveDirective,
      'blocked-uri': e.blockedURI,
      'source-file': e.sourceFile,
    });
  });
} 