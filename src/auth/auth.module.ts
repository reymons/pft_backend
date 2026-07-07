import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { PasswordModule } from "@/password/password.module";
import { AuthController } from "./auth.controller";
import { UsersModule } from "@/users/users.module";

@Module({
    imports: [PasswordModule, UsersModule],
    providers: [AuthService],
    controllers: [AuthController],
})
export class AuthModule {}
