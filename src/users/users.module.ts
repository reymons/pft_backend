import { Module } from "@nestjs/common";
import { UsersRepo } from "./users.repo";
import { UsersController } from "./users.controller";

@Module({
    providers: [UsersRepo],
    exports: [UsersRepo],
    controllers: [UsersController],
})
export class UsersModule {}
