import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NotificationService } from '../../../../core/services/notification.service';
import { AppNotification } from '../../../../core/models/request.model';

/**
 * NotificationHostComponent
 * - Manages rendering of global toasts injected via NotificationService
 * - Demonstrates Modern CSS Animations:
 *   - Enter animation (`animate.enter` class with keyframes: opacity + translate)
 *   - Leave animation (`animate.leave` class)
 *   - `prefers-reduced-motion` compliance
 * - ChangeDetectionStrategy: OnPush
 * - Zoneless: Signals trigger DOM reconciliation directly
 */
@Component({
  selector: 'app-notification-host',
  standalone: true,
  templateUrl: './notification-host.component.html',
  styleUrl: './notification-host.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationHostComponent {
  private readonly notificationService = inject(NotificationService);

  // Readonly signal of notifications
  readonly notifications = this.notificationService.notifications;

  dismiss(notification: AppNotification): void {
    this.notificationService.remove(notification.id);
  }
}
