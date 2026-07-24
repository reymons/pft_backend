import { Module, Scope } from "@nestjs/common";
import { EventBus, EventSubscriber } from "./pubsub.bus";

@Module({
    providers: [
        EventBus,
        {
            provide: EventSubscriber,
            inject: [EventBus],
            useFactory: (bus: EventBus) => new EventSubscriber(bus),
            scope: Scope.TRANSIENT,
        },
    ],
    exports: [EventBus, EventSubscriber],
})
export class PubsubModule {}
