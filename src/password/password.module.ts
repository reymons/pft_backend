import { Module } from "@nestjs/common";
import { PasswordService } from "./password.service";

@Module({
    exports: [PasswordService],
    providers: [PasswordService],
})
export class PasswordModule {}
