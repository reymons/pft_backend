import { Global, Module } from "@nestjs/common";
import { JwtService } from "./jwt.service";
import { ConfigService } from "@nestjs/config";

@Global()
@Module({
    providers: [
        {
            provide: JwtService,
            inject: [ConfigService],
            useFactory: (conf: ConfigService) => {
                return new JwtService(conf.get<string>("JWT_SECRET")!);
            },
        },
    ],
    exports: [JwtService],
})
export class JwtModule {}
