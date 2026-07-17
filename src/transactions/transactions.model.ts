import { CategoryModel } from "@/categories/categories.model";

export enum RecurringTrxPeriod {
    Weekly = "weekly",
    Monthly = "monthly",
    Yearly = "yearly",
}

export enum TransactionType {
    Income = "income",
    Expense = "expense",
}

export class TransactionModel {
    id: number;
    name: string;
    description: string;
    type: TransactionType;
    amount: number;
    recurringPeriod: RecurringTrxPeriod | null;
    createdAt: string;
    category: CategoryModel;

    get isRecurring() {
        return this.recurringPeriod !== null;
    }
}
