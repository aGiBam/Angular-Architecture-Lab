import { Injectable, signal } from '@angular/core';
import { RequestPriority, RequestStatus } from '../../../core/models/request.model';

/**
 * DashboardFilterState
 * - Scope: Component-level provider (NO `providedIn: 'root'`)
 * - Lifecycle: Created when DashboardComponent mounts, destroyed when DashboardComponent unmounts.
 * - Purpose: Encapsulates isolated search, filter, and pagination/sort state for this specific dashboard view.
 * - Architectural Demonstration: Proves Hierarchical DI and ElementInjector isolation.
 */
@Injectable()
export class DashboardFilterState {
  // Unique instance ID generated per instantiation to prove ElementInjector isolation in the UI
  readonly instanceId = signal<string>(`filt-scope-${Math.random().toString(36).substring(2, 8).toUpperCase()}`);
  readonly createdAt = new Date().toLocaleTimeString();

  // Reactive state signals
  readonly searchQuery = signal<string>('');
  readonly statusFilter = signal<RequestStatus | 'ALL'>('ALL');
  readonly priorityFilter = signal<RequestPriority | 'ALL'>('ALL');
  readonly sortBy = signal<'newest' | 'oldest' | 'priority'>('newest');

  setSearchQuery(query: string): void {
    this.searchQuery.set(query);
  }

  setStatusFilter(status: RequestStatus | 'ALL'): void {
    this.statusFilter.set(status);
  }

  setPriorityFilter(priority: RequestPriority | 'ALL'): void {
    this.priorityFilter.set(priority);
  }

  setSortBy(sort: 'newest' | 'oldest' | 'priority'): void {
    this.sortBy.set(sort);
  }

  reset(): void {
    this.searchQuery.set('');
    this.statusFilter.set('ALL');
    this.priorityFilter.set('ALL');
    this.sortBy.set('newest');
  }
}
