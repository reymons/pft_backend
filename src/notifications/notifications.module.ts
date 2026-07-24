import { Module } from "@nestjs/common";
import { NotificationsController } from "./notifications.controller";
import { NotificationsService } from "./notifications.service";
import { NotificationsRepo } from "./notifications.repo";
import { PubsubModule } from "@/pubsub/pubsub.module";

@Module({
    providers: [NotificationsService, NotificationsRepo],
    controllers: [NotificationsController],
    exports: [NotificationsService],
    imports: [PubsubModule],
})
export class NotificationsModule {}
