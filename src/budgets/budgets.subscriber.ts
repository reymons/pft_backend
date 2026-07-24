import { Event } from "@/pubsub/events/event";
import { EventSubscriber } from "@/pubsub/pubsub.bus";
import { TransactionUpdatedEvent } from "@/pubsub/events/transaction";
import { BudgetLimitApproachingEvent, BudgetUpdatedEvent } from "@/pubsub/events/budget";
import { BudgetsService } from "./budgets.service";
import { NotificationsService } from "@/notifications/notifications.service";
import { Injectable } from "@nestjs/common";

const budgetUpdatedEv = new BudgetUpdatedEvent(0, 0);
const trxUpdatedEv = new TransactionUpdatedEvent(0, 0);

@Injectable()
export class BudgetsSubscriber {
    constructor(
        private readonly subscriber: EventSubscriber,
        private readonly budgetsService: BudgetsService,
        private readonly notifService: NotificationsService,
    ) {
        subscriber.subscribe(budgetUpdatedEv.type);
        subscriber.subscribe(trxUpdatedEv.type);
        subscriber.onEvent((ev) => {
            this.handleEvent(ev);
        });
    }

    private async handleEvent(ev: Event) {
        let userId: number;
        if (ev instanceof TransactionUpdatedEvent) {
            userId = ev.userId;
        } else if (ev instanceof BudgetUpdatedEvent) {
            userId = ev.userId;
        } else {
            return;
        }
        const budgets = await this.budgetsService.findLimitApproaching(userId);
        const events = budgets.map((b) => new BudgetLimitApproachingEvent(b.id, b.name));
        await this.notifService.publishMany(userId, events);
    }
}
