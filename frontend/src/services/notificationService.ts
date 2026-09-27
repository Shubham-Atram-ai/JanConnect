import api from '../lib/api';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: string;
  entityId?: string;
  status: 'UNREAD' | 'READ';
  createdAt: string;
  readAt?: string;
}

const notificationService = {
  list: (): Promise<Notification[]> =>
    api.get('/notifications').then((r) => r.data),

  markRead: (id: string): Promise<void> =>
    api.patch(`/notifications/${id}/read`).then(() => undefined),
};

export default notificationService;
