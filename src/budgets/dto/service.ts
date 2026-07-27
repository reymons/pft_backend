import { BudgetPeriod } from "@/budgets/budgets.model";
import { Currency } from "@/currency/currency.model";

export type CreateBudgetDto = {
    userId: number;
    name: string;
    amount: number;
    period: BudgetPeriod;
    startsAt: string;
    categoryIds?: number[];
    newCategories?: string[];
    currency: Currency;
};

export type DeleteBudgetDto = {
    budgetId: number;
    userId: number;
};

export type EditBudgetDto = Partial<Omit<CreateBudgetDto, "userId">> & {
    userId: number;
    budgetId: number;
};
