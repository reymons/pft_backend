import { CategoryEntity } from "@/categories/categories.entity";

export type TopSpendingCategoryEntity = CategoryEntity & {
    amount: number;
};

export type SummaryEntity = {
    balance: number;
    transactions: number;
    transactions_prev_month: number;
    transactions_this_month: number;
    budgets: number;
};
