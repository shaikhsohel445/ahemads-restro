import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BranchTimeService } from '../../common/services/branch-time.service';
import { addDaysToDate, localDate, zonedDayStart } from '../../common/time';

@Injectable()
export class DashboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly branchTime: BranchTimeService,
  ) {}

  async getSummary(branchId: string) {
    // "Today" is the restaurant's calendar day; Workers run in UTC.
    const tz = await this.branchTime.tzForBranch(branchId);
    const startOfDay = zonedDayStart(localDate(new Date(), tz), tz);

    const [
      revenueAgg,
      ordersToday,
      orderTypeCounts,
      tableCounts,
      kitchenQueue,
      recentOrders,
    ] = await Promise.all([
      this.prisma.order.aggregate({
        where: { branchId, status: 'PAID', billedAt: { gte: startOfDay } },
        _sum: { totalAmount: true },
      }),
      this.prisma.order.count({
        where: { branchId, createdAt: { gte: startOfDay } },
      }),
      this.prisma.order.groupBy({
        by: ['channel'],
        where: { branchId, createdAt: { gte: startOfDay } },
        _count: true,
      }),
      this.prisma.table.groupBy({
        by: ['status'],
        where: { floor: { branchId } },
        _count: true,
      }),
      this.prisma.kot.groupBy({
        by: ['status'],
        where: {
          order: { branchId },
          status: { notIn: ['SERVED', 'CANCELLED'] },
        },
        _count: true,
      }),
      this.prisma.order.findMany({
        where: { branchId, status: 'PAID' },
        orderBy: { billedAt: 'desc' },
        take: 10,
        select: {
          id: true,
          orderNumber: true,
          type: true,
          totalAmount: true,
          billedAt: true,
        },
      }),
    ]);

    const tableStatusMap = Object.fromEntries(
      tableCounts.map((row) => [row.status, row._count]),
    );
    const kitchenQueueMap = Object.fromEntries(
      kitchenQueue.map((row) => [row.status, row._count]),
    );
    // Online = placed by a guest through the website or QR (Order.channel),
    // everything else was rung up by staff.
    const channels = orderTypeCounts.reduce(
      (acc, row) => {
        if (row.channel === 'ONLINE') {
          acc.online += row._count;
        } else {
          acc.offline += row._count;
        }
        return acc;
      },
      { online: 0, offline: 0 },
    );

    return {
      todayRevenue: Number(revenueAgg._sum.totalAmount ?? 0),
      todayOrders: ordersToday,
      channels,
      tables: {
        available: tableStatusMap.AVAILABLE ?? 0,
        occupied: tableStatusMap.OCCUPIED ?? 0,
        reserved: tableStatusMap.RESERVED ?? 0,
        cleaning: tableStatusMap.CLEANING ?? 0,
        outOfService: tableStatusMap.OUT_OF_SERVICE ?? 0,
      },
      kitchenQueue: {
        new: kitchenQueueMap.NEW ?? 0,
        accepted: kitchenQueueMap.ACCEPTED ?? 0,
        preparing: kitchenQueueMap.PREPARING ?? 0,
        ready: kitchenQueueMap.READY ?? 0,
      },
      recentOrders,
    };
  }

  async getTrends(branchId: string, days = 14) {
    const tz = await this.branchTime.tzForBranch(branchId);
    const firstDay = addDaysToDate(localDate(new Date(), tz), -(days - 1));
    const since = zonedDayStart(firstDay, tz);

    const [orders, wasteLogs] = await Promise.all([
      this.prisma.order.findMany({
        where: { branchId, status: 'PAID', billedAt: { gte: since } },
        select: { totalAmount: true, billedAt: true },
      }),
      this.prisma.wasteLog.findMany({
        where: { branchId, createdAt: { gte: since } },
        select: { quantity: true, unitCostAtWaste: true, createdAt: true },
      }),
    ]);

    // Bucket by the restaurant's local calendar day, not UTC: a Riyadh
    // dinner at 01:00 local belongs to that night, not to "yesterday" in UTC.
    const dateKey = (d: Date) => localDate(d, tz);
    const revenueByDay = new Map<string, number>();
    const wasteByDay = new Map<string, number>();
    for (let i = 0; i < days; i++) {
      const key = addDaysToDate(firstDay, i);
      revenueByDay.set(key, 0);
      wasteByDay.set(key, 0);
    }

    for (const order of orders) {
      if (!order.billedAt) continue;
      const key = dateKey(order.billedAt);
      if (revenueByDay.has(key)) {
        revenueByDay.set(
          key,
          revenueByDay.get(key)! + Number(order.totalAmount),
        );
      }
    }

    for (const log of wasteLogs) {
      const key = dateKey(log.createdAt);
      if (wasteByDay.has(key)) {
        const cost = Number(log.quantity) * Number(log.unitCostAtWaste);
        wasteByDay.set(key, wasteByDay.get(key)! + cost);
      }
    }

    return {
      revenue: [...revenueByDay.entries()].map(([date, amount]) => ({
        date,
        amount: Math.round(amount * 100) / 100,
      })),
      waste: [...wasteByDay.entries()].map(([date, cost]) => ({
        date,
        cost: Math.round(cost * 100) / 100,
      })),
    };
  }
}
