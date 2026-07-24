import { NotificationModel } from "@/notifications/notifications.model";
import { ApiProperty } from "@nestjs/swagger";

export class NotificationRes {
    @ApiProperty()
    id: number;

    @ApiProperty()
    data: Record<string, unknown>;

    @ApiProperty()
    createdAt: string;

    @ApiProperty()
    isRead: boolean;

    constructor(m: NotificationModel) {
        this.id = m.id;
        this.data = JSON.parse(m.data);
        this.createdAt = m.createdAt;
        this.isRead = m.isRead;
    }
}
