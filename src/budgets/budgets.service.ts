import { ForbiddenException, Injectable } from "@nestjs/common";
import { BudgetsRepo, BudgetsRepoFactory } from "./budgets.repo";
import { CategoriesRepoFactory } from "@/categories/categories.repo";
import { BudgetModel } from "./budgets.model";
import { Transactor } from "@/db/db.transactor";
import type { CreateBudgetDto, DeleteBudgetDto, EditBudgetDto } from "./dto/service";
import { BudgetUpdatedEvent } from "@/pubsub/events/budget";
import { EventBus } from "@/pubsub/pubsub.bus";
import { CurrencyService } from "@/currency/currency.service";

@Injectable()
export class BudgetsService {
    constructor(
        private readonly budgetsRepo: BudgetsRepo,
        private readonly budgetsRepoFactory: BudgetsRepoFactory,
        private readonly categoriesRepoFactory: CategoriesRepoFactory,
        private readonly currencyService: CurrencyService,
        private readonly transactor: Transactor,
        private readonly events: EventBus,
    ) {}

    getBudgets(userId: number): Promise<BudgetModel[]> {
        return this.budgetsRepo.getAllByUserId(userId);
    }

    async createBudget(dto: CreateBudgetDto): Promise<BudgetModel> {
        await this.currencyService.ensureExchangeRatesExist(dto.startsAt);

        return this.transactor.run(async (t) => {
            const budgetsRepo = this.budgetsRepoFactory.createRepo(t);
            const categoriesRepo = this.categoriesRepoFactory.createRepo(t);
            const categoryIds = [...(dto.categoryIds || [])];
            if (dto.newCategories?.length) {
                const ids = await categoriesRepo.saveMany(dto.userId, dto.newCategories);
                categoryIds.push(...ids);
            }
            return budgetsRepo.save({
                userId: dto.userId,
                name: dto.name,
                amount: dto.amount,
                period: dto.period,
                startsAt: dto.startsAt,
                categoryIds,
                currency: dto.currency,
            });
        });
    }

    async deleteBudget(dto: DeleteBudgetDto): Promise<void> {
        const exists = await this.budgetsRepo.exists(dto.budgetId, dto.userId);
        if (exists) {
            await this.budgetsRepo.deleteById(dto.budgetId);
        } else {
            throw new ForbiddenException();
        }
    }

    async editBudget(dto: EditBudgetDto): Promise<BudgetModel> {
        if (dto.startsAt) {
            await this.currencyService.ensureExchangeRatesExist(dto.startsAt);
        }
        const budget = await this.budgetsRepo.patch(dto);
        this.events.publish(new BudgetUpdatedEvent(budget.id, budget.userId));
        return budget;
    }

    async findLimitApproaching(userId: number): Promise<BudgetModel[]> {
        const budgets = await this.budgetsRepo.getAllByUserId(userId);
        return budgets.filter((b) => b.totalSpent / b.amount > 0.9);
    }
}
