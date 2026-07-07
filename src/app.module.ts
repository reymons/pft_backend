import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { DBModule } from "./db/db.module";
import { JwtModule } from "./jwt/jwt.module";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: [`.env.${process.env.APP_ENV}`, ".env"],
        }),
        DBModule,
        JwtModule,
        AuthModule,
        UsersModule,
    ],
})
export class AppModule {}
