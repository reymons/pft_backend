import { Module } from "@nestjs/common";
import { BudgetsRepo, BudgetsRepoFactory } from "./budgets.repo";
import { CategoriesModule } from "@/categories/categories.module";
import { BudgetsController } from "./budgets.controller";
import { BudgetsService } from "./budgets.service";

@Module({
    providers: [BudgetsRepo, BudgetsService, BudgetsRepoFactory],
    imports: [CategoriesModule],
    controllers: [BudgetsController],
})
export class BudgetsModule {}
