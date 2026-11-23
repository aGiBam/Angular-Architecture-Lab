import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RequestItem, RequestPriority, RequestStatus } from '../../../../core/models/request.model';

/**
 * RequestCardComponent
 * - Presentation (Dumb) Component
 * - Pure Unidirectional Data Flow:
 *   - Receives data strictly via `input.required<RequestItem>()`
 *   - Emits events strictly via `output<number>()`
 * - ChangeDetectionStrategy: OnPush
 * - NO direct service injection or state mutation:
 *   Does NOT inject RequestService and does NOT mutate the request directly.
 */
@Component({
  selector: 'app-request-card',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './request-card.component.html',
  styleUrl: './request-card.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RequestCardComponent {
  // Required signal input
  readonly request = input.required<RequestItem>();

  // Signal outputs for parent communication
  readonly delete = output<number>();
  readonly statusChange = output<{ id: number; status: RequestStatus }>();

  // Derived styling helpers using computed signals
  readonly priorityClass = computed(() => {
    switch (this.request().priority) {
      case 'URGENT': return 'badge-urgent';
      case 'HIGH': return 'badge-high';
      case 'MEDIUM': return 'badge-medium';
      case 'LOW': return 'badge-low';
    }
  });

  readonly statusClass = computed(() => {
    switch (this.request().status) {
      case 'PENDING': return 'status-pending';
      case 'IN_PROGRESS': return 'status-progress';
      case 'COMPLETED': return 'status-completed';
      case 'REJECTED': return 'status-rejected';
    }
  });

  onDeleteClick(): void {
    // Child signals the parent that deletion was requested.
    // The parent (DashboardComponent) coordinates with RequestService.
    this.delete.emit(this.request().id);
  }

  onSelectStatus(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const newStatus = select.value as RequestStatus;
    this.statusChange.emit({ id: this.request().id, status: newStatus });
  }
}
