import { Module } from "@nestjs/common";
import { StatsController } from "./stats.controller";
import { StatsRepo } from "./stats.repo";

@Module({
    providers: [StatsRepo],
    controllers: [StatsController],
})
export class StatsModule {}
