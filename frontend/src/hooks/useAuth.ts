import { useContext } from 'react';
import AuthContext from '@/context/AuthContext';

/**
 * Custom hook for using authentication context
 * 
 * @returns Authentication context values
 * 
 * @example
 * ```tsx
 * const { user, login, logout } = useAuth();
 * 
 * // Check if user is logged in
 * if (user) {
 *   console.log('User is logged in:', user.name);
 * }
 * 
 * // Login function
 * const handleLogin = async () => {
 *   try {
 *     await login('user@example.com', 'password');
 *   } catch (error) {
 *     console.error('Login failed:', error);
 *   }
 * };
 * 
 * // Logout function
 * const handleLogout = () => {
 *   logout();
 * };
 * ```
 */
const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default useAuth; 