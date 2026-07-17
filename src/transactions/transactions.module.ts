import { Module } from "@nestjs/common";
import { TransactionsService } from "./transactions.service";
import { TransactionsRepo, TransactionsRepoFactory } from "./transactions.repo";
import { CategoriesModule } from "@/categories/categories.module";
import { TransactionsController } from "./transactions.controller";

@Module({
    providers: [TransactionsService, TransactionsRepoFactory, TransactionsRepo],
    imports: [CategoriesModule],
    controllers: [TransactionsController],
})
export class TransactionsModule {}
