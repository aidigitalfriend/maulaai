// Simple test user for development - replace with real authentication
export interface User {
  id: string;
  email: string;
  name: string;
}

// Mock user for testing subscription system
export const TEST_USER: User = {
  id: '507f1f77bcf86cd799439011', // Valid MongoDB ObjectId format
  email: 'test@onelastai.co',
  name: 'Test User'
};

export function getCurrentUser(): User | null {
  // In development, return test user
  // In production, this would integrate with real auth
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem('testUser');
    if (stored) {
      return JSON.parse(stored);
    }
    
    // Set test user for development
    localStorage.setItem('testUser', JSON.stringify(TEST_USER));
    return TEST_USER;
  } catch {
    return null;
  }
}

export function logoutUser(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('testUser');
}