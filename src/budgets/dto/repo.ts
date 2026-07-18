import { BudgetPeriod } from "../budgets.model";

export type SaveBudgetDto = {
    userId: number;
    name: string;
    amount: number;
    period: BudgetPeriod;
    categoryIds?: number[];
};

export type PatchBudgetDto = Partial<Omit<SaveBudgetDto, "userId">> & {
    userId: number;
    budgetId: number;
};
