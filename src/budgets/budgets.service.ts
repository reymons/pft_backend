import { ForbiddenException, Injectable } from "@nestjs/common";
import { BudgetsRepo, BudgetsRepoFactory } from "./budgets.repo";
import { CategoriesRepoFactory } from "@/categories/categories.repo";
import { BudgetModel } from "./budgets.model";
import { Transactor } from "@/db/db.transactor";
import type { CreateBudgetDto, DeleteBudgetDto, EditBudgetDto } from "./dto/service";

@Injectable()
export class BudgetsService {
    constructor(
        private readonly budgetsRepo: BudgetsRepo,
        private readonly budgetsRepoFactory: BudgetsRepoFactory,
        private readonly categoriesRepoFactory: CategoriesRepoFactory,
        private readonly transactor: Transactor,
    ) {}

    getBudgets(userId: number): Promise<BudgetModel[]> {
        return this.budgetsRepo.getAllByUserId(userId);
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

            const budget = await budgetsRepo.save({
                userId: dto.userId,
                name: dto.name,
                amount: dto.amount,
                period: dto.period,
                startsAt: dto.startsAt,
                categoryIds,
            });
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

    editBudget(dto: EditBudgetDto): Promise<BudgetModel> {
        return this.budgetsRepo.patch(dto);
    }
}
