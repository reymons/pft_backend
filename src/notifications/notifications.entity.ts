import { RawJSON } from "@/common/entity";

export type NotificationEntity = {
    id: number;
    data: RawJSON;
    created_at: string;
    is_read: boolean;
};

export type NotificationWithTotalEntity = NotificationEntity & {
    total: number;
};
