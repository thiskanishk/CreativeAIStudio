/**
 * Path utilities to simplify imports throughout the project.
 * This helps with TypeScript path resolution and VSCode IntelliSense.
 */

// Re-export all components with aliases to make imports cleaner
export function createComponentPath(path: string): string {
  return `@components/${path}`;
}

// Re-export all utilities with aliases
export function createUtilPath(path: string): string {
  return `@utils/${path}`;
}

// Re-export all hooks with aliases
export function createHookPath(path: string): string {
  return `@hooks/${path}`;
}

// Re-export all API services with aliases
export function createApiPath(path: string): string {
  return `@api/${path}`;
}

// Re-export all context providers with aliases
export function createContextPath(path: string): string {
  return `@context/${path}`;
}

/**
 * Example usage:
 * 
 * import { Button } from createComponentPath('ui/Button');
 * import { formatDate } from createUtilPath('datetime');
 * import { useAds } from createHookPath('useAds');
 */ 