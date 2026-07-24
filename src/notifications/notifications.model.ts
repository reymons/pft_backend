import { RawJSON } from "@/common/entity";

export class NotificationModel {
    id: number;
    data: RawJSON;
    createdAt: string;
    isRead: boolean;
}
