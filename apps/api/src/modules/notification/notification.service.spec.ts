import { describe, it, expect, vi } from 'vitest';
import { NotificationType } from '@identis/db';
import { NotificationService } from './notification.service';
import type { PrismaService } from '@/prisma.service';

function makePrisma(): PrismaService {
  return {
    client: {
      notification: {
        create: vi.fn().mockResolvedValue({}),
        findMany: vi.fn().mockResolvedValue([]),
        count: vi.fn().mockResolvedValue(0),
      },
      userNotificationRead: {
        upsert: vi.fn().mockResolvedValue({}),
        createMany: vi.fn().mockResolvedValue({ count: 0 }),
      },
    },
  } as unknown as PrismaService;
}

describe('NotificationService — send', () => {
  it('persists a system notification to the database', async () => {
    const prisma = makePrisma();
    const service = new NotificationService(prisma);

    await service.send({
      type: NotificationType.SYSTEM,
      title: 'System alert',
      body: 'Something happened',
    });

    expect(prisma.client.notification.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        type: NotificationType.SYSTEM,
        title: 'System alert',
        body: 'Something happened',
      }),
    });
  });
});

describe('NotificationService — list & mark read', () => {
  it('returns paginated notifications with isRead derived from reads', async () => {
    const fakeNotif = {
      id: 'n1',
      type: NotificationType.SYSTEM,
      title: 'System alert',
      body: 'body',
      payload: null,
      read: false,
      readAt: null,
      createdAt: new Date(),
      reads: [],
    };
    const prisma = makePrisma();
    vi.mocked(prisma.client.notification.findMany).mockResolvedValue([
      fakeNotif,
    ]);
    vi.mocked(prisma.client.notification.count).mockResolvedValue(1);

    const service = new NotificationService(prisma);
    const result = await service.list({
      limit: 20,
      offset: 0,
      unread: true,
      userId: 'user-1',
      role: 'ADMIN',
    });

    expect(result.total).toBe(1);
    expect(result.data).toHaveLength(1);
    expect(result.data[0]?.isRead).toBe(false);
  });

  it('marks a single notification as read via upsert', async () => {
    const prisma = makePrisma();
    const service = new NotificationService(prisma);

    await service.markRead('notif-id-1', 'user-1');

    expect(prisma.client.userNotificationRead.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          userId_notificationId: {
            userId: 'user-1',
            notificationId: 'notif-id-1',
          },
        },
      }),
    );
  });

  it('marks all notifications as read', async () => {
    const prisma = makePrisma();
    vi.mocked(prisma.client.notification.findMany).mockResolvedValue([
      { id: 'n1' } as never,
      { id: 'n2' } as never,
    ]);
    const service = new NotificationService(prisma);

    await service.markAllRead('user-1');

    expect(prisma.client.userNotificationRead.createMany).toHaveBeenCalledWith({
      data: [
        { userId: 'user-1', notificationId: 'n1' },
        { userId: 'user-1', notificationId: 'n2' },
      ],
      skipDuplicates: true,
    });
  });
});
