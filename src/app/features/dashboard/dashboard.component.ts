import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RequestService } from '../../core/services/request.service';
import { NotificationService } from '../../core/services/notification.service';
import { DashboardFilterState } from './services/dashboard-filter-state.service';
import { RequestCardComponent } from './components/request-card/request-card.component';
import { NotificationHostComponent } from './components/notification-host/notification-host.component';
import { SearchBarComponent } from './components/search-bar/search-bar.component';
import { RequestItem, RequestPriority, RequestStatus } from '../../core/models/request.model';
import { API_URL } from '../../core/tokens/api-url.token';
import {
  AUDIT_LOGGER_TOKEN,
  FEATURE_FLAGS_TOKEN,
  FORMATTER_TOKEN,
  LOGGER_TOKEN
} from '../../core/tokens/provider-strategies.demo';

/**
 * DashboardComponent
 *
 * Core architectural responsibilities:
 * 1. Component-level provider: Configures `DashboardFilterState` in `providers: [DashboardFilterState]`.
 * 2. Unidirectional Data Flow Coordinator:
 *    - Consumes state from `RequestService` (Root).
 *    - Consumes filter parameters from `DashboardFilterState` (Isolated Component Scope).
 *    - Derives `filteredRequests` via `computed()`.
 *    - Supplies request objects to `RequestCardComponent` via `input.required<RequestItem>()`.
 *    - Handles `output<number>()` deletions and instructs `RequestService` to mutate state.
 *    - Informs `NotificationService` of side effects (toast notifications).
 * 3. Architecture Showcase:
 *    - Demonstrates Zoneless Change Detection (`provideZonelessChangeDetection()`).
 *    - Demonstrates all 4 DI provider strategies (`useValue`, `useClass`, `useFactory`, `useExisting`).
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RequestCardComponent,
    NotificationHostComponent,
    SearchBarComponent
  ],
  providers: [
    // Component-level provider: creates an isolated instance per DashboardComponent instance
    DashboardFilterState
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent {
  // 1. Injected Services (Root Scope)
  readonly requestService = inject(RequestService);
  readonly notificationService = inject(NotificationService);

  // 2. Injected Component-Level Service (ElementInjector Scope)
  readonly filterState = inject(DashboardFilterState);

  // 3. Injected Tokens (Demonstrating all DI Strategies)
  readonly apiUrl = inject(API_URL);
  readonly featureFlags = inject(FEATURE_FLAGS_TOKEN, { optional: true });
  readonly logger = inject(LOGGER_TOKEN, { optional: true });
  readonly formatter = inject(FORMATTER_TOKEN, { optional: true });
  readonly auditLogger = inject(AUDIT_LOGGER_TOKEN, { optional: true });

  // UI state for Architecture Inspection Panel
  readonly showArchInspector = signal<boolean>(false);

  // Quick addition form state
  readonly showQuickAddModal = signal<boolean>(false);
  readonly newTitle = signal<string>('');
  readonly newCategory = signal<string>('Cloud Infrastructure');
  readonly newPriority = signal<RequestPriority>('MEDIUM');

  // Statistics derived directly from root service computed signals
  readonly totalCount = this.requestService.totalCount;
  readonly pendingCount = this.requestService.pendingCount;
  readonly inProgressCount = this.requestService.inProgressCount;
  readonly completedCount = this.requestService.completedCount;
  readonly rejectedCount = this.requestService.rejectedCount;

  /**
   * Computed Signal: Filtered & Sorted Requests
   * Automatically re-evaluates whenever:
   * - `requestService.requests()` changes (add, delete, status change)
   * - `filterState.searchQuery()` changes
   * - `filterState.statusFilter()` changes
   * - `filterState.priorityFilter()` changes
   * - `filterState.sortBy()` changes
   */
  readonly filteredRequests = computed(() => {
    const items = this.requestService.requests();
    const query = this.filterState.searchQuery().toLowerCase().trim();
    const status = this.filterState.statusFilter();
    const priority = this.filterState.priorityFilter();
    const sort = this.filterState.sortBy();

    // 1. Filter
    let result = items.filter(r => {
      const matchesQuery =
        !query ||
        r.title.toLowerCase().includes(query) ||
        r.description.toLowerCase().includes(query) ||
        r.requester.name.toLowerCase().includes(query) ||
        r.requester.department.toLowerCase().includes(query) ||
        r.category.toLowerCase().includes(query) ||
        r.id.toString().includes(query);

      const matchesStatus = status === 'ALL' || r.status === status;
      const matchesPriority = priority === 'ALL' || r.priority === priority;

      return matchesQuery && matchesStatus && matchesPriority;
    });

    // 2. Sort
    result = [...result].sort((a, b) => {
      if (sort === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sort === 'oldest') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (sort === 'priority') {
        const priorityWeight: Record<RequestPriority, number> = {
          URGENT: 4,
          HIGH: 3,
          MEDIUM: 2,
          LOW: 1
        };
        return priorityWeight[b.priority] - priorityWeight[a.priority];
      }
      return 0;
    });

    return result;
  });

  /**
   * Handlers for Child Component Outputs
   */
  onDeleteRequest(id: number): void {
    const success = this.requestService.deleteRequest(id);
    if (success) {
      this.notificationService.success(
        `Request #${id} was deleted successfully. (Unidirectional Flow: Child Output -> Parent Coordinator -> Service Mutation)`,
        5000
      );
    } else {
      this.notificationService.error(`Failed to delete request #${id}.`);
    }
  }

  onStatusChange(event: { id: number; status: RequestStatus }): void {
    this.requestService.updateRequestStatus(event.id, event.status);
    this.notificationService.info(
      `Request #${event.id} status transitioned to "${event.status}".`,
        3500
    );
  }

  /**
   * Filter Toolbar Handlers
   */
  setStatusFilter(status: RequestStatus | 'ALL'): void {
    this.filterState.setStatusFilter(status);
  }

  setPriorityFilter(priority: RequestPriority | 'ALL'): void {
    this.filterState.setPriorityFilter(priority);
  }

  setSortBy(sort: 'newest' | 'oldest' | 'priority'): void {
    this.filterState.setSortBy(sort);
  }

  resetFilters(): void {
    this.filterState.reset();
    this.notificationService.info('All filters and search queries reset.');
  }

  refreshData(): void {
    this.requestService.refreshRequests();
    this.notificationService.info('Synchronized with mock server endpoint.');
  }

  restoreDefaultData(): void {
    this.requestService.resetToMockData();
    this.notificationService.warning('Default mock requests dataset restored.');
  }

  toggleArchInspector(): void {
    this.showArchInspector.update(v => !v);
  }

  openAddModal(): void {
    this.showQuickAddModal.set(true);
  }

  closeAddModal(): void {
    this.showQuickAddModal.set(false);
    this.newTitle.set('');
  }

  submitNewRequest(): void {
    const title = this.newTitle().trim();
    if (!title) {
      this.notificationService.error('Please enter a request title.');
      return;
    }

    const created = this.requestService.addRequest(
      title,
      this.newCategory(),
      this.newPriority()
    );

    this.notificationService.success(
      `Request #${created.id} created and dispatched to queue.`,
      4000
    );
    this.closeAddModal();
  }
}
