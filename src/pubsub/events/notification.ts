import { Event } from "./event";

export class NotificationEvent implements Event {
    readonly id: number;
    readonly createdAt: string;
    readonly isRead: boolean;
    readonly data: { type: string; data: Event };

    constructor(id: number, data: Event, createdAt: string) {
        this.id = id;
        this.createdAt = createdAt;
        this.isRead = false;
        this.data = { type: data.type, data };
    }

    get type() {
        return "notification";
    }
}
