import { DB_CLIENT, DB_HELPERS, type DBHelpers, type DBClient } from "@/db/db.client";
import { Inject, Injectable } from "@nestjs/common";
import { NotificationEntity, NotificationWithTotalEntity } from "./notifications.entity";
import { NotificationModel } from "./notifications.model";
import { Event } from "@/pubsub/events/event";
import { NotificationEvent } from "@/pubsub/events/notification";

@Injectable()
export class NotificationsRepo {
    constructor(
        @Inject(DB_CLIENT) private readonly client: DBClient,
        @Inject(DB_HELPERS) private readonly helpers: DBHelpers,
    ) {}

    static toModel(ent: NotificationEntity) {
        const m = new NotificationModel();
        m.id = ent.id;
        m.data = ent.data;
        m.createdAt = ent.created_at;
        m.isRead = ent.is_read;
        return m;
    }

    async getAllByUserId(id: number): Promise<{ data: NotificationModel[]; total: number }> {
        const ents = await this.client.manyOrNone<NotificationWithTotalEntity>(
            "SELECT id, data, created_at, is_read, count(*) over()::int AS total FROM notifications WHERE user_id = $1 ORDER BY created_at DESC",
            id,
        );
        return {
            data: ents.map((ent) => NotificationsRepo.toModel(ent)),
            total: ents.at(0)?.total ?? 0,
        };
    }

    async getUnreadCount(userId: number): Promise<number> {
        const row = await this.client.one<{ count: number }>(
            "SELECT count(*)::int FROM notifications WHERE user_id = $1 AND is_read = FALSE",
            userId,
        );
        return row.count;
    }

    async save(userId: number, ev: Event): Promise<NotificationEvent> {
        const ent = await this.client.one<NotificationEntity>(
            "INSERT INTO notifications(user_id, data) VALUES ($1, $2) RETURNING id, created_at",
            [userId, JSON.stringify({ type: ev.type, data: ev })],
        );
        return new NotificationEvent(ent.id, ev, ent.created_at);
    }

    async saveMany(userId: number, events: Event[]): Promise<NotificationEvent[]> {
        if (!events.length) return [];
        const data = events.map((ev) => ({
            user_id: userId,
            data: JSON.stringify({ type: ev.type, data: ev }),
        }));
        const cs = new this.helpers.ColumnSet(["user_id", "data"], { table: "notifications" });
        const query = this.helpers.insert(data, cs);
        const ents = await this.client.many<NotificationEntity>(`${query} RETURNING id, created_at`);
        return ents.map((ent, i) => new NotificationEvent(ent.id, events[i], ent.created_at));
    }

    async readOne(notifId: number, userId: number): Promise<void> {
        await this.client.none("UPDATE notifications SET is_read = TRUE WHERE id = $1 AND user_id = $2", [
            notifId,
            userId,
        ]);
    }

    async readAll(userId: number): Promise<void> {
        await this.client.none(
            "UPDATE notifications SET is_read = TRUE WHERE is_read = FALSE AND user_id = $1",
            userId,
        );
    }
}
