import { Injectable, computed, inject, signal } from '@angular/core';
import { RequestItem, RequestPriority, RequestStatus } from '../models/request.model';
import { API_URL } from '../tokens/api-url.token';
import { LOGGER_TOKEN } from '../tokens/provider-strategies.demo';

const INITIAL_MOCK_REQUESTS: RequestItem[] = [
  {
    id: 101,
    title: 'Provision High-Memory Kubernetes Cluster for AI Sandbox',
    description: 'Requires 4x H100 node pool with ephemeral SSD scratch storage for inference evaluation.',
    category: 'Cloud Infrastructure',
    status: 'PENDING',
    priority: 'URGENT',
    requester: {
      name: 'Sarah Chen',
      email: 'schen@lab.internal',
      department: 'AI Research',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80'
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 35).toISOString()
  },
  {
    id: 102,
    title: 'PostgreSQL Read-Replica Upgrade & Connection Pooling',
    description: 'Upgrade RDS replica to PostgreSQL 16.4 and configure PgBouncer for peak traffic spikes.',
    category: 'Database Administration',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    requester: {
      name: 'Omar Farooq',
      email: 'omar.f@lab.internal',
      department: 'Backend Engineering',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80'
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString()
  },
  {
    id: 103,
    title: 'Renew Enterprise Wildcard TLS & mTLS Gateway Certificates',
    description: 'Automate Let\'s Encrypt DNS-01 challenge via cert-manager across all staging ingress controllers.',
    category: 'Security & Compliance',
    status: 'COMPLETED',
    priority: 'MEDIUM',
    requester: {
      name: 'Elena Rostova',
      email: 'elena.r@lab.internal',
      department: 'DevSecOps',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
  },
  {
    id: 104,
    title: 'VPN Split-Tunneling Bypass for Remote Developers in EMEA',
    description: 'Resolve high latency when querying local observability grafana instances over corporate WireGuard.',
    category: 'Network Operations',
    status: 'PENDING',
    priority: 'HIGH',
    requester: {
      name: 'Tariq Mansoor',
      email: 'tariq.m@lab.internal',
      department: 'Platform Architecture',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80'
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString()
  },
  {
    id: 105,
    title: 'S3 Cold Storage Lifecycle Tiering Policy Review',
    description: 'Move unaccessed build artifacts older than 90 days to Glacier Flexible Retrieval to curb storage cost.',
    category: 'FinOps',
    status: 'COMPLETED',
    priority: 'LOW',
    requester: {
      name: 'Maya Lin',
      email: 'mlin@lab.internal',
      department: 'Finance Systems',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80'
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString()
  },
  {
    id: 106,
    title: 'Deprecate Legacy v1 Auth Token Verification Webhook',
    description: 'Migrate OAuth2 client introspection to RS256 JWT key sets before the end of quarter deadline.',
    category: 'Identity & Access',
    status: 'REJECTED',
    priority: 'MEDIUM',
    requester: {
      name: 'Lucas Wright',
      email: 'lwright@lab.internal',
      department: 'Core Identity',
      avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=80'
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString()
  }
];

/**
 * RequestService
 * - Scope: Root provider (`providedIn: 'root'`)
 * - Injects: `API_URL` InjectionToken using `inject(API_URL)`
 * - State: Owns requests state via private writable signal, exposes readonly signal
 * - Computed State: Derives total, pending, in-progress, and completed counts
 */
@Injectable({
  providedIn: 'root'
})
export class RequestService {
  // Injected tokens
  readonly apiUrl = inject(API_URL);
  private readonly logger = inject(LOGGER_TOKEN, { optional: true });

  // 1. Private writable signal
  private readonly _requests = signal<RequestItem[]>(INITIAL_MOCK_REQUESTS);

  // 2. Public readonly signal exposed to components
  readonly requests = this._requests.asReadonly();

  // Async loading & error state
  private readonly _isLoading = signal<boolean>(false);
  readonly isLoading = this._isLoading.asReadonly();

  private readonly _error = signal<string | null>(null);
  readonly error = this._error.asReadonly();

  // 3. Computed derived statistics (Zero-overhead automatic updates when _requests changes)
  readonly totalCount = computed(() => this._requests().length);
  readonly pendingCount = computed(() => this._requests().filter(r => r.status === 'PENDING').length);
  readonly inProgressCount = computed(() => this._requests().filter(r => r.status === 'IN_PROGRESS').length);
  readonly completedCount = computed(() => this._requests().filter(r => r.status === 'COMPLETED').length);
  readonly rejectedCount = computed(() => this._requests().filter(r => r.status === 'REJECTED').length);

  /**
   * Deletes a request by its ID.
   * Demonstrates unidirectional data flow: service owns state mutation.
   */
  deleteRequest(id: number): boolean {
    const exists = this._requests().some(r => r.id === id);
    if (!exists) return false;

    this.logger?.log(`Deleting request #${id} via API: ${this.apiUrl}/requests/${id}`);

    // Immutable update of writable signal
    this._requests.update(items => items.filter(r => r.id !== id));
    return true;
  }

  /**
   * Updates the status of an existing request.
   */
  updateRequestStatus(id: number, status: RequestStatus): void {
    this.logger?.log(`Updating request #${id} status to ${status}`);
    this._requests.update(items =>
      items.map(r => (r.id === id ? { ...r, status } : r))
    );
  }

  /**
   * Simulates fetching / refreshing requests from API with realistic delay.
   */
  refreshRequests(): void {
    this._isLoading.set(true);
    this._error.set(null);

    this.logger?.log(`Refreshing requests from ${this.apiUrl}/requests`);

    // Simulated network delay
    setTimeout(() => {
      this._isLoading.set(false);
    }, 600);
  }

  /**
   * Adds a new simulated request to demonstrate reactive additions.
   */
  addRequest(title: string, category: string, priority: RequestPriority): RequestItem {
    const newId = Math.max(0, ...this._requests().map(r => r.id)) + 1;
    const newRequest: RequestItem = {
      id: newId,
      title,
      description: 'Newly submitted admin infrastructure request for architectural review.',
      category,
      status: 'PENDING',
      priority,
      requester: {
        name: 'You (Admin)',
        email: 'admin@architecture.lab',
        department: 'Architecture Guild'
      },
      createdAt: new Date().toISOString()
    };

    this._requests.update(items => [newRequest, ...items]);
    this.logger?.log(`Added new request #${newId}`);
    return newRequest;
  }

  /**
   * Resets the requests collection back to initial mock state.
   */
  resetToMockData(): void {
    this._requests.set(INITIAL_MOCK_REQUESTS);
    this._error.set(null);
    this.logger?.log('Reset requests state to initial mock data.');
  }
}
