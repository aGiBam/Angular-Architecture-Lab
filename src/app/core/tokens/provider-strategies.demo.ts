import { InjectionToken } from '@angular/core';

/**
 * Demonstration of all DI Provider Strategies:
 * 1. useValue: Injecting raw static configuration/values
 * 2. useClass: Instantiating and injecting a specific class implementation
 * 3. useFactory: Dynamic creation with dependency injection
 * 4. useExisting: Aliasing an existing token to another token
 */

// 1. useValue token
export interface FeatureFlags {
  enableAnalytics: boolean;
  enableAuditLog: boolean;
  maxRequestsPerUser: number;
}

export const FEATURE_FLAGS_TOKEN = new InjectionToken<FeatureFlags>('FEATURE_FLAGS_TOKEN');

// 2. useClass token & implementations
export abstract class BaseLogger {
  abstract log(message: string): string;
  abstract readonly strategyName: string;
}

export class ConsoleLogger implements BaseLogger {
  readonly strategyName = 'useClass (ConsoleLogger)';
  log(message: string): string {
    const text = `[ConsoleLogger] ${message}`;
    console.log(text);
    return text;
  }
}

export const LOGGER_TOKEN = new InjectionToken<BaseLogger>('LOGGER_TOKEN');

// 3. useFactory token & factory function
export interface FormatterService {
  formatDate(date: string): string;
  formatCurrency(amount: number): string;
  readonly strategyName: string;
}

export const FORMATTER_TOKEN = new InjectionToken<FormatterService>('FORMATTER_TOKEN');

export function formatterFactory(locale: string): FormatterService {
  return {
    strategyName: `useFactory (configured for ${locale})`,
    formatDate: (dateStr: string) => {
      const d = new Date(dateStr);
      return new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(d);
    },
    formatCurrency: (amount: number) => {
      return new Intl.NumberFormat(locale, { style: 'currency', currency: 'USD' }).format(amount);
    }
  };
}

// 4. useExisting token (aliasing LOGGER_TOKEN to AUDIT_LOGGER_TOKEN)
export const AUDIT_LOGGER_TOKEN = new InjectionToken<BaseLogger>('AUDIT_LOGGER_TOKEN');
