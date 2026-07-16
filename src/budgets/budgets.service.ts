import { ForbiddenException, Injectable } from "@nestjs/common";
import { BudgetsRepo, BudgetsRepoFactory } from "./budgets.repo";
import { CategoriesRepo, CategoriesRepoFactory } from "@/categories/categories.repo";
import { BudgetModel } from "./budgets.model";
import { Transactor } from "@/db/db.transactor";
import type { CreateBudgetDto, DeleteBudgetDto } from "./dto/service";

@Injectable()
export class BudgetsService {
    constructor(
        private readonly budgetsRepo: BudgetsRepo,
        private readonly categoriesRepo: CategoriesRepo,
        private readonly budgetsRepoFactory: BudgetsRepoFactory,
        private readonly categoriesRepoFactory: CategoriesRepoFactory,
        private readonly transactor: Transactor,
    ) {}

    async getBudgets(userId: number): Promise<BudgetModel[]> {
        const budgets = await this.budgetsRepo.getAllByUserId(userId);
        const promises = budgets.map(async (budget) => {
            budget.categories = await this.categoriesRepo.getAllByBudgetId(budget.id);
        });
        await Promise.all(promises);
        return budgets;
    }

    createBudget(dto: CreateBudgetDto): Promise<BudgetModel> {
        return this.transactor.run(async (t) => {
            const budgetsRepo = this.budgetsRepoFactory.createRepo(t);
            const categoriesRepo = this.categoriesRepoFactory.createRepo(t);

            const categoryIds = [...(dto.categoryIds || [])];
            if (dto.newCategories?.length) {
                const ids = await categoriesRepo.saveMany(dto.userId, dto.newCategories);
                categoryIds.push(...ids);
            }

            const budget = await budgetsRepo.save(dto.userId, dto.name, dto.amount, dto.period, categoryIds);
            budget.categories = await categoriesRepo.getAllByBudgetId(budget.id);
            return budget;
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
}
