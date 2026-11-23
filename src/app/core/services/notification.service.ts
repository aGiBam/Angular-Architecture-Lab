import { Injectable, signal } from '@angular/core';
import { AppNotification, NotificationType } from '../models/request.model';

/**
 * NotificationService
 * - Scope: Root provider (`providedIn: 'root'`)
 * - State: Signals-based reactive state
 * - Functionality: Auto-dismissing toast notifications with enter/leave handling
 */
@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  // Private writable signal owning notifications array
  private readonly _notifications = signal<AppNotification[]>([]);

  // Public readonly signal exposed to consumers
  readonly notifications = this._notifications.asReadonly();

  // Internal timer map to allow manual dismissals without orphaned timeouts
  private readonly activeTimers = new Map<string, ReturnType<typeof setTimeout>>();

  /**
   * Adds a notification with automatic dismiss after duration ms.
   */
  show(message: string, type: NotificationType = 'info', duration: number = 4000): string {
    const id = `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const notification: AppNotification = {
      id,
      message,
      type,
      duration,
      createdAt: Date.now()
    };

    // Update signal immutably using update()
    this._notifications.update(current => [...current, notification]);

    if (duration > 0) {
      const timer = setTimeout(() => {
        this.remove(id);
      }, duration);
      this.activeTimers.set(id, timer);
    }

    return id;
  }

  success(message: string, duration = 4000): string {
    return this.show(message, 'success', duration);
  }

  error(message: string, duration = 5000): string {
    return this.show(message, 'error', duration);
  }

  warning(message: string, duration = 4500): string {
    return this.show(message, 'warning', duration);
  }

  info(message: string, duration = 4000): string {
    return this.show(message, 'info', duration);
  }

  /**
   * Removes a notification by ID
   */
  remove(id: string): void {
    const timer = this.activeTimers.get(id);
    if (timer) {
      clearTimeout(timer);
      this.activeTimers.delete(id);
    }

    this._notifications.update(current => current.filter(n => n.id !== id));
  }

  clearAll(): void {
    this.activeTimers.forEach(timer => clearTimeout(timer));
    this.activeTimers.clear();
    this._notifications.set([]);
  }
}
