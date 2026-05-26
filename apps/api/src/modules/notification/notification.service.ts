import { Injectable } from '@nestjs/common';
import {
  type Notification,
  NotificationType,
  type Prisma,
  UserRole,
} from '@identis/db';
import { PrismaService } from '@/prisma.service';

export type NotificationView = Omit<Notification, 'read' | 'readAt'> & {
  isRead: boolean;
};

type SaveNotificationInput = {
  type: NotificationType;
  title: string;
  body: string;
  payload?: Prisma.InputJsonValue;
};

@Injectable()
export class NotificationService {
  constructor(private readonly prisma: PrismaService) {}

  async send(input: {
    type: NotificationType;
    title: string;
    body: string;
    payload?: Record<string, unknown>;
  }): Promise<void> {
    await this.save({
      type: input.type,
      title: input.title,
      body: input.body,
      payload: input.payload as Prisma.InputJsonValue,
    });
  }

  async list(query: {
    limit: number;
    offset: number;
    unread?: boolean;
    userId: string;
    role: UserRole;
  }): Promise<{
    data: NotificationView[];
    total: number;
    limit: number;
    offset: number;
  }> {
    const where: Prisma.NotificationWhereInput = {
      ...(query.unread ? { reads: { none: { userId: query.userId } } } : {}),
    };
    const [raw, total] = await Promise.all([
      this.prisma.client.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: query.limit,
        skip: query.offset,
        include: {
          reads: { where: { userId: query.userId }, select: { readAt: true } },
        },
      }),
      this.prisma.client.notification.count({ where }),
    ]);
    const data: NotificationView[] = raw.map(
      ({ reads, read: _r, readAt: _ra, ...n }) => ({
        ...n,
        isRead: reads.length > 0,
      }),
    );
    return { data, total, limit: query.limit, offset: query.offset };
  }

  async unreadCount(userId: string): Promise<{ count: number }> {
    const count = await this.prisma.client.notification.count({
      where: {
        reads: { none: { userId } },
      },
    });
    return { count };
  }

  async markRead(notificationId: string, userId: string): Promise<void> {
    await this.prisma.client.userNotificationRead.upsert({
      where: { userId_notificationId: { userId, notificationId } },
      create: { userId, notificationId },
      update: {},
    });
  }

  async markAllRead(userId: string): Promise<void> {
    const unread = await this.prisma.client.notification.findMany({
      where: { reads: { none: { userId } } },
      select: { id: true },
    });
    if (unread.length === 0) return;
    await this.prisma.client.userNotificationRead.createMany({
      data: unread.map((n) => ({ userId, notificationId: n.id })),
      skipDuplicates: true,
    });
  }

  private async save(input: SaveNotificationInput): Promise<void> {
    const { type, title, body, payload } = input;
    await this.prisma.client.notification.create({
      data: { type, title, body, payload },
    });
  }
}
