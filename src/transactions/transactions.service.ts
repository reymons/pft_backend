import { ForbiddenException, Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { Transactor } from "@/db/db.transactor";
import { CategoriesRepoFactory } from "@/categories/categories.repo";
import { TransactionsRepo, TransactionsRepoFactory } from "./transactions.repo";
import { TransactionModel } from "./transactions.model";
import { CreateTrxDto } from "./dto/service";
import { TransactionsQuery } from "./query/trx";
import { EventBus } from "@/pubsub/pubsub.bus";
import { TransactionUpdatedEvent } from "@/pubsub/events/transaction";
import { CurrencyService } from "@/currency/currency.service";

@Injectable()
export class TransactionsService {
    constructor(
        private readonly transactor: Transactor,
        private readonly trxRepoFactory: TransactionsRepoFactory,
        private readonly categoriesRepoFactory: CategoriesRepoFactory,
        private readonly trxRepo: TransactionsRepo,
        private readonly events: EventBus,
        private readonly currencyService: CurrencyService,
    ) {}

    @Cron(CronExpression.EVERY_HOUR)
    protected async checkRecurringTransactionsCron() {
        await this.trxRepo.updateDue();
    }

    async createTransaction(dto: CreateTrxDto): Promise<TransactionModel> {
        await this.currencyService.ensureExchangeRatesExist(dto.addedAt);

        return this.transactor.run(async (t) => {
            const categoriesRepo = this.categoriesRepoFactory.createRepo(t);

            const category = await categoriesRepo.getById(dto.categoryId);
            if (!category.isDefault && category.userId !== dto.userId) {
                throw new ForbiddenException();
            }

            const trxRepo = this.trxRepoFactory.createRepo(t);
            const trx = await trxRepo.save(dto);

            if (trx.recurringTrxId) {
                await trxRepo.updateDue(trx.recurringTrxId);
            }

            this.events.publish(new TransactionUpdatedEvent(trx.id, dto.userId));

            return trx;
        });
    }

    async getTransactions(
        userId: number,
        query: TransactionsQuery,
    ): Promise<{ data: TransactionModel[]; total: number }> {
        return this.trxRepo.getAllByUserId(userId, query);
    }
}
