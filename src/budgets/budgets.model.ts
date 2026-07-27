import { CategoryModel } from "@/categories/categories.model";
import { Currency } from "@/currency/currency.model";

export enum BudgetPeriod {
    Weekly = "weekly",
    Monthly = "monthly",
    Yearly = "yearly",
}

export class BudgetModel {
    id: number;
    userId: number;
    name: string;
    amount: number;
    period: BudgetPeriod;
    totalSpent: number;
    categories: CategoryModel[];
    startsAt: string;
    currency: Currency;
}
