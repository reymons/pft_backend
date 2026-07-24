import { Module } from "@nestjs/common";
import { TransactionsService } from "./transactions.service";
import { TransactionsRepo, TransactionsRepoFactory } from "./transactions.repo";
import { CategoriesModule } from "@/categories/categories.module";
import { TransactionsController } from "./transactions.controller";
import { PubsubModule } from "@/pubsub/pubsub.module";

@Module({
    providers: [TransactionsService, TransactionsRepoFactory, TransactionsRepo],
    imports: [CategoriesModule, PubsubModule],
    controllers: [TransactionsController],
})
export class TransactionsModule {}
