import { Injectable } from "@nestjs/common";
import { NotificationsRepo } from "./notifications.repo";
import { Event } from "@/pubsub/events/event";
import { EventBus } from "@/pubsub/pubsub.bus";

@Injectable()
export class NotificationsService {
    constructor(
        private readonly notifsRepo: NotificationsRepo,
        private readonly events: EventBus,
    ) {}

    getAllByUserId(id: number) {
        return this.notifsRepo.getAllByUserId(id);
    }

    getUnreadCount(userId: number) {
        return this.notifsRepo.getUnreadCount(userId);
    }

    async publish(userId: number, ev: Event): Promise<void> {
        const event = await this.notifsRepo.save(userId, ev);
        this.events.publish(event);
    }

    async publishMany(userId: number, ev: Event[]): Promise<void> {
        const events = await this.notifsRepo.saveMany(userId, ev);
        for (const event of events) {
            this.events.publish(event);
        }
    }

    async readOne(notifId: number, userId: number): Promise<void> {
        await this.notifsRepo.readOne(notifId, userId);
    }

    async readAll(userId: number): Promise<void> {
        await this.notifsRepo.readAll(userId);
    }
}
