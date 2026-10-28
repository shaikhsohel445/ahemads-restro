import { Injectable, Logger } from '@nestjs/common';
import { OrdersService } from './orders.service';

/** Releases scheduled orders to the kitchen as their time approaches. */
@Injectable()
export class ScheduledOrdersService {
  private readonly logger = new Logger(ScheduledOrdersService.name);

  constructor(private readonly orders: OrdersService) {}

  // Runs every minute (Cron Trigger "* * * * *", see src/cloudflare/scheduled.ts).
  async tick() {
    try {
      const released = await this.orders.releaseDueScheduledOrders();
      if (released > 0)
        this.logger.log(
          `Released ${released} scheduled order(s) to the kitchen`,
        );
    } catch (err) {
      this.logger.error(
        `Scheduled-order release failed: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }
}
