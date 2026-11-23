export type RequestStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED';

export type RequestPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface Requester {
  name: string;
  email: string;
  department: string;
  avatarUrl?: string;
}

export interface RequestItem {
  id: number;
  title: string;
  description: string;
  category: string;
  status: RequestStatus;
  priority: RequestPriority;
  requester: Requester;
  createdAt: string;
}

export type NotificationType = 'success' | 'info' | 'warning' | 'error';

export interface AppNotification {
  id: string;
  message: string;
  type: NotificationType;
  duration?: number;
  createdAt: number;
}
