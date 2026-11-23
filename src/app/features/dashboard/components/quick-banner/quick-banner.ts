import { ChangeDetectionStrategy, Component, inject, input, InputSignal, output, Signal } from '@angular/core';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-quick-banner',
  standalone: true,
  template: `
    <div class="banner-box animate-pop">
      <!-- 1. اعرض هنا قيمة الـ message باستخدام السجنال: message() -->
      <span>📢 {{ message() }}</span>

      <!-- 2. زرار لما نضغط عليه ينادي دالة onAction() -->
      <button type="button" (click)="onAction()">Acknowledge</button>
    </div>
  `,
  styles: [
    `
      /* 3. كود الـ Animation */
      @keyframes popIn {
        0% {
          opacity: 0;
          transform: scale(0.85) translateY(-10px);
        }
        100% {
          opacity: 1;
          transform: scale(1) translateY(0);
        }
      }

      .banner-box {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: #eff6ff;
        border: 1px solid #bfdbfe;
        padding: 0.75rem 1rem;
        border-radius: 8px;
        color: #1e40af;
        margin-bottom: 1rem;
      }

      .animate-pop {
        animation: popIn 300ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
      }

      button {
        background: #2563eb;
        color: white;
        border: none;
        padding: 0.35rem 0.75rem;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 600;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuickBannerComponent {
  // ==========================================
  // المطلوب منك هنا:
  // ==========================================

  // أ) عرّف input إجباري اسمه message نوعه string
  // فكر: بنكتب input.required<...>() إزاي؟
  message = input.required<string>();
  // ب) عرّف output اسمه acknowledged بيطلق حدث نوعه void
  // فكر: بنكتب output<void>() إزاي؟
  acknowledged = output<void>();

  // ج) احقن NotificationService باستخدام دالة inject()
  // فكر: بنكتب inject(NotificationService) إزاي؟
  notificationService = inject(NotificationService);
  onAction(): void {
    // د) لما المستخدم يدوس:
    // 1. نادي السيرفيس تطلع إشعار info أو success
    // 2. أطلق الـ output للـ Parent
    this.notificationService.success(this.message());
    this.acknowledged.emit();
  }
}
