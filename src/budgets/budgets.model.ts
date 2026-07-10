export enum BudgetPeriod {
    Weekly = "weekly",
    Monthly = "monthly",
    Yearly = "yearly",
}

export class BudgetModel {
    id: number;
    userId: number;
    amount: number;
    period: BudgetPeriod;
    categoryIds: number[];
}
