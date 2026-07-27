import { Currency } from "@/currency/currency.model";
import { BudgetPeriod } from "../budgets.model";

export type SaveBudgetDto = {
    userId: number;
    name: string;
    amount: number;
    period: BudgetPeriod;
    startsAt: string;
    categoryIds?: number[];
    currency: Currency;
};

export type PatchBudgetDto = Partial<Omit<SaveBudgetDto, "userId">> & {
    userId: number;
    budgetId: number;
};
