import { BudgetPeriod } from "@/budgets/budgets.model";

export type CreateBudgetDto = {
    userId: number;
    amount: number;
    period: BudgetPeriod;
    categoryIds?: number[];
    newCategories?: string[];
};

export type DeleteBudgetDto = {
    budgetId: number;
    userId: number;
};
