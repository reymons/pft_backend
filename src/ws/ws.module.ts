import { Module } from "@nestjs/common";
import { JwtModule } from "@/jwt/jwt.module";
import { PubsubModule } from "@/pubsub/pubsub.module";
import { WsGateway } from "./ws.gateway";

@Module({
    imports: [JwtModule, PubsubModule],
    providers: [WsGateway],
    exports: [WsGateway],
})
export class WsModule {}
