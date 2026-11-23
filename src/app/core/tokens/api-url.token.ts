import { InjectionToken } from '@angular/core';

/**
 * InjectionToken demonstrating dependency injection with `useValue`.
 * Represents the base API URL configured at application bootstrap.
 */
export const API_URL = new InjectionToken<string>('API_URL', {
  providedIn: 'root',
  factory: () => 'https://api.angular-architecture-lab.internal/v1'
});
