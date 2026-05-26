export type NotificationType = "SYSTEM" | "ACCOUNT" | "ANNOUNCEMENT";

export type NotificationView = {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  payload: Record<string, unknown> | null;
  createdAt: string;
  isRead: boolean;
};

export type PaginatedNotifications = {
  data: NotificationView[];
  total: number;
  limit: number;
  offset: number;
};
