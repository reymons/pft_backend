import { Module } from "@nestjs/common";
import { BudgetsRepo, BudgetsRepoFactory } from "./budgets.repo";
import { CategoriesModule } from "@/categories/categories.module";
import { BudgetsController } from "./budgets.controller";
import { BudgetsService } from "./budgets.service";
import { NotificationsModule } from "@/notifications/notifications.module";
import { PubsubModule } from "@/pubsub/pubsub.module";
import { BudgetsSubscriber } from "./budgets.subscriber";
import { CurrencyModule } from "@/currency/currency.module";

@Module({
    providers: [BudgetsRepo, BudgetsService, BudgetsRepoFactory, BudgetsSubscriber],
    imports: [CategoriesModule, NotificationsModule, PubsubModule, CurrencyModule],
    controllers: [BudgetsController],
})
export class BudgetsModule {}
