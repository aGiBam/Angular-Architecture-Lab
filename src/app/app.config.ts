import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { API_URL } from './core/tokens/api-url.token';
import {
  AUDIT_LOGGER_TOKEN,
  ConsoleLogger,
  FEATURE_FLAGS_TOKEN,
  FORMATTER_TOKEN,
  LOGGER_TOKEN,
  formatterFactory
} from './core/tokens/provider-strategies.demo';

/**
 * Application Configuration for Angular 22
 *
 * Demonstrates:
 * 1. Zoneless Angular Architecture: `provideZonelessChangeDetection()`
 * 2. All 4 Dependency Injection Provider Strategies:
 *    - `useValue`: Static configuration and primitive/object tokens
 *    - `useClass`: Instantiating concrete class implementations
 *    - `useFactory`: Dynamic factory functions with dependency injection
 *    - `useExisting`: Aliasing an existing token to another token
 */
export const appConfig: ApplicationConfig = {
  providers: [
    // 1. Zoneless Change Detection (No zone.js required)
    provideZonelessChangeDetection(),

    // Global Browser Error Listeners
    provideBrowserGlobalErrorListeners(),

    // Router Configuration
    provideRouter(routes),

    // -------------------------------------------------------------
    // Demonstration of all 4 Angular DI Provider Strategies:
    // -------------------------------------------------------------

    // Strategy 1: useValue
    // Injects static configuration objects or primitives directly
    {
      provide: API_URL,
      useValue: 'https://api.angular-architecture-lab.internal/v1'
    },
    {
      provide: FEATURE_FLAGS_TOKEN,
      useValue: {
        enableAnalytics: true,
        enableAuditLog: true,
        maxRequestsPerUser: 25
      }
    },

    // Strategy 2: useClass
    // Instructs DI to instantiate and provide an instance of ConsoleLogger
    {
      provide: LOGGER_TOKEN,
      useClass: ConsoleLogger
    },

    // Strategy 3: useFactory
    // Dynamically invokes a factory function to construct the dependency
    {
      provide: FORMATTER_TOKEN,
      useFactory: () => formatterFactory('en-US')
    },

    // Strategy 4: useExisting
    // Creates an alias pointing AUDIT_LOGGER_TOKEN to the already configured LOGGER_TOKEN
    {
      provide: AUDIT_LOGGER_TOKEN,
      useExisting: LOGGER_TOKEN
    }
  ]
};
