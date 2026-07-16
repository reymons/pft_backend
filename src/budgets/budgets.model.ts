import { CategoryModel } from "@/categories/categories.model";

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
    categories: CategoryModel[];
}
