import { ApiProperty } from "@nestjs/swagger";
import { PaginationRes } from "@/collection/pagination";
import { NotificationModel } from "@/notifications/notifications.model";
import { NotificationRes } from "./notification";

export class GetAllNotificationsRes extends PaginationRes {
    @ApiProperty({ isArray: true, type: NotificationRes })
    data: NotificationRes[];

    constructor(ents: NotificationModel[], total: number) {
        super(total);
        this.data = ents.map((ent) => new NotificationRes(ent));
    }
}
